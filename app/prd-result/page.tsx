'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { usePRDContext } from '@/contexts/PRDContext';
import { misoAPI } from '@/lib/miso-api';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export default function PRDResultPage() {
  const router = useRouter();
  const { getAllQuestionsAndAnswers, prdContent, setPRDContent, resetPRD } = usePRDContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [databaseSchema, setDatabaseSchema] = useState<string | null>(null);
  const [isDatabaseLoading, setIsDatabaseLoading] = useState(false);
  const [hasFetchedDatabase, setHasFetchedDatabase] = useState(false);
  const [designContent, setDesignContent] = useState<string | null>(null);
  const [isDesignLoading, setIsDesignLoading] = useState(false);
  const [hasFetchedDesign, setHasFetchedDesign] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    // PRD가 이미 생성되어 있으면 사용
    if (prdContent) {
      setIsLoading(false);
      return;
    }

    // PRD 생성
    const generatePRD = async () => {
      try {
        const questionsAndAnswers = getAllQuestionsAndAnswers();
        
        if (questionsAndAnswers.length === 0) {
          router.push('/');
          return;
        }
        
        const result = await misoAPI.generatePRD(questionsAndAnswers);
        
        if (result) {
          setPRDContent(result);
        } else {
          setError('PRD 생성에 실패했습니다.');
        }
      } catch (err) {
        console.error('Failed to generate PRD:', err);
        setError('PRD 생성 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    generatePRD();
  }, [prdContent, getAllQuestionsAndAnswers, setPRDContent, router]);

  // PRD가 완성되면 바로 데이터베이스 스키마 생성 시작
  useEffect(() => {
    if (prdContent && !hasFetchedDatabase) {
      setHasFetchedDatabase(true);
      generateDatabaseSchema(prdContent);
    }
  }, [prdContent, hasFetchedDatabase]);

  // 데이터베이스 스키마 생성 함수
  const generateDatabaseSchema = async (prd: string) => {
    setIsDatabaseLoading(true);
    try {
      const schema = await misoAPI.generateDatabaseSchema(prd);
      if (schema) {
        setDatabaseSchema(schema);
      }
    } catch (err) {
      console.error('Failed to generate database schema:', err);
    } finally {
      setIsDatabaseLoading(false);
    }
  };

  // 디자인 생성 함수
  const generateDesign = async (prd: string, dbSchema: string) => {
    setIsDesignLoading(true);
    try {
      const design = await misoAPI.generateDesign(prd, dbSchema);
      if (design) {
        setDesignContent(design);
      }
    } catch (err) {
      console.error('Failed to generate design:', err);
    } finally {
      setIsDesignLoading(false);
    }
  };

  // 데이터베이스 스키마가 완성되면 디자인 생성 시작
  useEffect(() => {
    if (prdContent && databaseSchema && !hasFetchedDesign) {
      setHasFetchedDesign(true);
      generateDesign(prdContent, databaseSchema);
    }
  }, [prdContent, databaseSchema, hasFetchedDesign]);

  const handleDownload = () => {
    const blob = new Blob([prdContent || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 홈으로 나가기 핸들러
  const handleGoHome = () => {
    setShowExitModal(true);
  };

  // 모달에서 확인 버튼 클릭
  const handleConfirmExit = () => {
    resetPRD();
    router.push('/');
  };

  // 모달에서 취소 버튼 클릭
  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </motion.div>
          <h2 className="text-2xl font-light mb-2">PRD를 생성하고 있습니다</h2>
          <p className="text-gray-600">MISO가 당신의 아이디어를 정리하고 있어요...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-red-500 mb-4">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-light mb-2">{error}</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            처음으로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50"
      >
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            처음으로
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              PRD 다운로드
            </button>
          </div>
        </div>
      </motion.header>

      <main className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-full px-4"
        >
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-light mb-4">프로젝트 문서가 완성되었습니다</h1>
            <p className="text-lg text-gray-600 font-light">세 명의 전문가가 협력하여 완전한 프로젝트 가이드를 만들었어요</p>
          </div>

          {/* 3 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 2xl:gap-8">
            
            {/* 기획자 - PRD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img 
                        src="/assets/charactor_planner.png" 
                        alt="기획자" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">기획자</h3>
                      <p className="text-xs text-gray-600">프로덕트 요구사항 정의</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-600">완료</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="max-h-[600px] overflow-y-auto">
                <div className="p-6">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-medium text-gray-800 mt-8 mb-4">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-medium text-gray-700 mt-6 mb-3">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-4 list-disc pl-5">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-2 mb-4 list-decimal pl-5">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm text-gray-600 list-item">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-800">{children}</strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="pl-4 py-2 my-4 border-l-3 border-gray-300 bg-gray-50 rounded-r">
                          <div className="italic text-sm text-gray-600">{children}</div>
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                          {children}
                        </td>
                      ),
                      hr: () => <hr className="my-6 border-gray-200" />,
                      code: ({ children, ...props }) => {
                        const isInline = !props.node?.position;
                        return isInline ? (
                          <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto my-4">
                            <code className="text-xs font-mono text-gray-800">{children}</code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {prdContent || '# PRD 문서\n\n내용을 불러올 수 없습니다.'}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>

            {/* 개발자 - 테이블 설계 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img 
                        src="/assets/charactor_developer.png" 
                        alt="개발자" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">개발자</h3>
                      <p className="text-xs text-gray-600">데이터베이스 테이블 설계</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 ${isDatabaseLoading ? 'bg-yellow-500 animate-pulse' : databaseSchema ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                    <span className={`text-xs font-medium ${isDatabaseLoading ? 'text-yellow-600' : databaseSchema ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isDatabaseLoading ? '생성 중' : databaseSchema ? '완료' : '대기 중'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="max-h-[600px] overflow-y-auto">
                {isDatabaseLoading ? (
                  <div className="h-[540px] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <Sparkles className="w-12 h-12 text-yellow-500 relative z-10" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        데이터베이스 설계 중
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        PRD를 분석하여 최적의 테이블 구조를 설계하고 있습니다
                      </p>
                      <div className="mt-6 flex justify-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                ) : databaseSchema ? (
                  <div className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-medium text-gray-800 mt-8 mb-4">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-medium text-gray-700 mt-6 mb-3">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-sm font-semibold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-100">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-1.5 mb-4">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="space-y-1.5 mb-4">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => {
                          // Check if this is a numbered list item
                          const text = children?.toString() || '';
                          const match = text.match(/^(\d+)\.\s+(.+?)(?:\s+-\s+(.+))?$/);
                          
                          if (match) {
                            return (
                              <li className="flex items-start gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                                  {match[1]}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium text-gray-800">{match[2]}</span>
                                  {match[3] && (
                                    <span className="text-gray-500 ml-2 text-xs">{match[3]}</span>
                                  )}
                                </div>
                              </li>
                            );
                          }
                          
                          return (
                            <li className="text-sm text-gray-600 pl-6">
                              {children}
                            </li>
                          );
                        },
                        pre: ({ children }) => (
                          <div className="my-4 bg-gray-900 rounded-lg overflow-hidden max-w-full">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                              <span className="text-xs font-mono text-gray-400">SQL</span>
                              <div className="flex gap-1">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <pre className="p-4 min-w-0">
                                <code className="text-xs font-mono text-gray-100 leading-relaxed whitespace-pre">{children}</code>
                              </pre>
                            </div>
                          </div>
                        ),
                        code: ({ children, ...props }) => {
                          const isInline = !props.node?.position;
                          return isInline ? (
                            <code className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                              {children}
                            </code>
                          ) : (
                            <>{children}</>
                          );
                        },
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-800">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-gray-600 not-italic">{children}</em>
                        ),
                      }}
                    >
                      {databaseSchema}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-[540px] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50"></div>
                        <FileText className="w-12 h-12 text-yellow-400 relative z-10" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        데이터베이스 설계 대기 중
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        PRD 작성이 완료되면 자동으로 시작됩니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 디자이너 - 페이지 설계 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img 
                        src="/assets/charactor_designer.png" 
                        alt="디자이너" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">디자이너</h3>
                      <p className="text-xs text-gray-600">페이지별 디자인 설계</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 ${isDesignLoading ? 'bg-yellow-500 animate-pulse' : designContent ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
                    <span className={`text-xs font-medium ${isDesignLoading ? 'text-yellow-600' : designContent ? 'text-green-600' : 'text-gray-400'}`}>
                      {isDesignLoading ? '생성 중' : designContent ? '완료' : '대기 중'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="max-h-[600px] overflow-y-auto">
                {isDesignLoading ? (
                  <div className="h-[540px] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <Sparkles className="w-12 h-12 text-yellow-500 relative z-10" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        UI/UX 설계 중
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        PRD와 데이터베이스를 분석하여 최적의 사용자 경험을 설계하고 있습니다
                      </p>
                      <div className="mt-6 flex justify-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                ) : designContent ? (
                  <div className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-medium text-gray-800 mt-8 mb-4">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-medium text-gray-700 mt-6 mb-3">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-sm font-semibold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-100">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-2 mb-4 list-disc pl-5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="space-y-2 mb-4 list-decimal pl-5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm text-gray-600">
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-800">{children}</strong>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="pl-4 py-2 my-4 border-l-3 border-gray-300 bg-gray-50 rounded-r">
                            <div className="italic text-sm text-gray-600">{children}</div>
                          </blockquote>
                        ),
                        pre: ({ children }) => (
                          <div className="my-4 bg-gray-50 rounded-lg overflow-hidden">
                            <pre className="p-4 overflow-x-auto">
                              <code className="text-xs font-mono text-gray-700">{children}</code>
                            </pre>
                          </div>
                        ),
                        code: ({ children, ...props }) => {
                          const isInline = !props.node?.position;
                          return isInline ? (
                            <code className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-mono">
                              {children}
                            </code>
                          ) : (
                            <>{children}</>
                          );
                        },
                      }}
                    >
                      {designContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-[540px] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 bg-gray-100 rounded-full blur-xl opacity-50"></div>
                        <FileText className="w-12 h-12 text-gray-400 relative z-10" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        UI/UX 설계 대기 중
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        데이터베이스 설계가 완료되면 자동으로 시작됩니다
                      </p>
                      <div className="mt-6">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-400">
                          <span className="block w-8 h-0.5 bg-gray-300 rounded"></span>
                          <span>순서를 기다리는 중</span>
                          <span className="block w-8 h-0.5 bg-gray-300 rounded"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
      
      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        title="홈으로 돌아가기"
        message="작성 중인 내용이 모두 사라집니다. 정말 홈으로 돌아가시겠습니까?"
        confirmText="홈으로 돌아가기"
        cancelText="계속 보기"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  );
}