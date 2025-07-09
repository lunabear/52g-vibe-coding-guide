'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, Edit2, Save, X, Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import JSZip from 'jszip';
import { usePRDContext } from '@/contexts/PRDContext';
import { misoAPI } from '@/lib/miso-api';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ErrorPage } from '@/components/common/ErrorPage';
import { VibeCodingGuideModal } from '@/components/common/VibeCodingGuideModal';

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
  const [isDesignError, setIsDesignError] = useState(false);
  const [isDatabaseError, setIsDatabaseError] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showVibeCodingModal, setShowVibeCodingModal] = useState(false);
  
  // 편집 모드 상태
  const [isEditingPRD, setIsEditingPRD] = useState(false);
  const [isEditingDesign, setIsEditingDesign] = useState(false);
  const [isEditingDatabase, setIsEditingDatabase] = useState(false);
  
  // 임시 편집 내용
  const [tempPRDContent, setTempPRDContent] = useState('');
  const [tempDesignContent, setTempDesignContent] = useState('');
  const [tempDatabaseContent, setTempDatabaseContent] = useState('');
  
  // 수정 요청 상태
  const [prdFixRequest, setPRDFixRequest] = useState('');
  const [designFixRequest, setDesignFixRequest] = useState('');
  const [databaseFixRequest, setDatabaseFixRequest] = useState('');
  const [isPRDFixing, setIsPRDFixing] = useState(false);
  const [isDesignFixing, setIsDesignFixing] = useState(false);
  const [isDatabaseFixing, setIsDatabaseFixing] = useState(false);

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
        if (err instanceof Error && err.message.includes('fetch')) {
          setError('network');
        } else {
          setError('PRD 생성 중 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    generatePRD();
  }, [prdContent, getAllQuestionsAndAnswers, setPRDContent, router]);

  // PRD가 완성되면 바로 디자인 생성 시작
  useEffect(() => {
    if (prdContent && !hasFetchedDesign) {
      setHasFetchedDesign(true);
      generateDesign(prdContent);
    }
  }, [prdContent, hasFetchedDesign]);

  // 디자인 생성 함수
  const generateDesign = async (prd: string) => {
    setIsDesignLoading(true);
    setIsDesignError(false);
    try {
      const design = await misoAPI.generateDesign(prd);
      if (design) {
        setDesignContent(design);
      } else {
        setIsDesignError(true);
      }
    } catch (err) {
      console.error('Failed to generate design:', err);
      setIsDesignError(true);
    } finally {
      setIsDesignLoading(false);
    }
  };

  // 개발 작업 task 생성 함수
  const generateDatabaseSchema = async (prd: string, design: string) => {
    setIsDatabaseLoading(true);
    setIsDatabaseError(false);
    try {
      const schema = await misoAPI.generateDatabaseSchema(prd, design);
      if (schema) {
        setDatabaseSchema(schema);
      } else {
        setIsDatabaseError(true);
      }
    } catch (err) {
      console.error('Failed to generate database schema:', err);
      setIsDatabaseError(true);
    } finally {
      setIsDatabaseLoading(false);
    }
  };

  // 디자인이 완성되면 개발 작업 task 생성 시작
  useEffect(() => {
    if (prdContent && designContent && !hasFetchedDatabase && !isDesignError) {
      setHasFetchedDatabase(true);
      generateDatabaseSchema(prdContent, designContent);
    }
  }, [prdContent, designContent, hasFetchedDatabase, isDesignError]);

  const handleDownload = async () => {
    const zip = new JSZip();
    const date = new Date().toISOString().split('T')[0];
    
    // 1. 기획자 Kyle의 PRD 문서
    if (prdContent) {
      zip.file(`1_기획자_Kyle_PRD_${date}.md`, prdContent);
    }
    
    // 2. 디자이너 Heather의 UI/UX 설계
    if (designContent) {
      zip.file(`2_디자이너_Heather_UI설계_${date}.md`, designContent);
    }
    
    // 3. 개발자 Bob의 개발 작업 task 설계
    if (databaseSchema) {
      zip.file(`3_개발자_Bob_개발작업설계_${date}.md`, databaseSchema);
    }
    
    // README 파일 추가
    const readmeContent = `# 프로젝트 문서 모음
    
## 포함된 문서들

### 1. 기획자 Kyle의 PRD
- 파일명: 1_기획자_Kyle_PRD_${date}.md
- 내용: 프로덕트 요구사항 정의서
- 비즈니스 관점에서 프로젝트의 목표, 기능, 요구사항을 정의

### 2. 디자이너 Heather의 UI/UX 설계
- 파일명: 2_디자이너_Heather_UI설계_${date}.md
- 내용: 페이지별 UI/UX 설계 가이드
- 사용자 경험 관점에서 인터페이스와 상호작용을 설계

### 3. 개발자 Bob의 개발 작업 task 설계
- 파일명: 3_개발자_Bob_개발작업설계_${date}.md
- 내용: 개발 작업 task 및 구현 계획
- 기술적 관점에서 개발 작업을 체계적으로 설계

## 사용 방법
각 문서는 마크다운 형식으로 작성되어 있습니다.
마크다운 에디터나 뷰어에서 열어서 확인하실 수 있습니다.

생성일: ${new Date().toLocaleString('ko-KR')}
`;
    
    zip.file('README.md', readmeContent);
    
    // ZIP 파일 생성 및 다운로드
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `프로젝트문서_${date}.zip`;
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

  // 편집 관련 함수들
  const handleEditPRD = () => {
    setTempPRDContent(prdContent || '');
    setIsEditingPRD(true);
  };

  const handleSavePRD = () => {
    setPRDContent(tempPRDContent);
    setIsEditingPRD(false);
  };

  const handleCancelPRD = () => {
    setIsEditingPRD(false);
    setTempPRDContent('');
  };

  const handleEditDesign = () => {
    setTempDesignContent(designContent || '');
    setIsEditingDesign(true);
  };

  const handleSaveDesign = () => {
    setDesignContent(tempDesignContent);
    setIsEditingDesign(false);
  };

  const handleCancelDesign = () => {
    setIsEditingDesign(false);
    setTempDesignContent('');
  };

  const handleEditDatabase = () => {
    setTempDatabaseContent(databaseSchema || '');
    setIsEditingDatabase(true);
  };

  const handleSaveDatabase = () => {
    setDatabaseSchema(tempDatabaseContent);
    setIsEditingDatabase(false);
  };

  const handleCancelDatabase = () => {
    setIsEditingDatabase(false);
    setTempDatabaseContent('');
  };

  // 수정 요청 처리 함수들
  const handlePRDFix = async () => {
    if (!prdFixRequest.trim() || !prdContent) return;
    
    setIsPRDFixing(true);
    try {
      const fixedContent = await misoAPI.fixDocument('prd', prdContent, prdFixRequest);
      if (fixedContent) {
        setPRDContent(fixedContent);
        setPRDFixRequest('');
      }
    } catch (error) {
      console.error('Failed to fix PRD:', error);
    } finally {
      setIsPRDFixing(false);
    }
  };

  const handleDesignFix = async () => {
    if (!designFixRequest.trim() || !designContent) return;
    
    setIsDesignFixing(true);
    try {
      const fixedContent = await misoAPI.fixDocument('design', designContent, designFixRequest);
      if (fixedContent) {
        setDesignContent(fixedContent);
        setDesignFixRequest('');
      }
    } catch (error) {
      console.error('Failed to fix design:', error);
    } finally {
      setIsDesignFixing(false);
    }
  };

  const handleDatabaseFix = async () => {
    if (!databaseFixRequest.trim() || !databaseSchema) return;
    
    setIsDatabaseFixing(true);
    try {
      const fixedContent = await misoAPI.fixDocument('database', databaseSchema, databaseFixRequest);
      if (fixedContent) {
        setDatabaseSchema(fixedContent);
        setDatabaseFixRequest('');
      }
    } catch (error) {
      console.error('Failed to fix database:', error);
    } finally {
      setIsDatabaseFixing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/assets/mini_kyle_thinking.png"
              alt="Kyle thinking"
              className="w-32 h-32 object-contain mx-auto"
            />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">PRD를 생성하고 있습니다</h3>
          <p className="text-base text-gray-600 max-w-sm">기획자 Kyle이 당신의 아이디어를 정리하고 있어요...</p>
          <div className="flex gap-1 mt-8 justify-center">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (error === 'network') {
      return (
        <ErrorPage 
          errorCode="network"
          showHomeButton={true}
          showRetryButton={true}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            window.location.reload();
          }}
        />
      );
    }
    
    return (
      <ErrorPage 
        errorCode="default"
        title={error}
        showHomeButton={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                처음으로
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <h1 className="text-lg font-medium text-gray-900">프로젝트 문서</h1>
            </div>
            <button
              onClick={() => setShowVibeCodingModal(true)}
              disabled={!prdContent && !databaseSchema && !designContent}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Sparkles className="w-4 h-4" />
              바이브코딩에 적용하기
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8">
        <div className="px-6">
          {/* 3 Column Layout - Full Width */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* 기획자 - PRD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img 
                        src="/assets/mini_kyle_default.png" 
                        alt="기획자 Kyle" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">기획자 Kyle</h3>
                      <p className="text-sm text-gray-600">프로덕트 요구사항 정의</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={isEditingPRD ? handleSavePRD : handleEditPRD}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isEditingPRD ? "저장" : "편집"}
                      disabled={isPRDFixing}
                    >
                      {isEditingPRD ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                    {isEditingPRD && (
                      <button
                        onClick={handleCancelPRD}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-600">완료</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto relative">
                <div className="p-6">
                  {isEditingPRD ? (
                    <textarea
                      value={tempPRDContent}
                      onChange={(e) => setTempPRDContent(e.target.value)}
                      className="w-full h-[calc(100vh-330px)] p-4 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="PRD 내용을 입력하세요..."
                    />
                  ) : (
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
                  )}
                </div>
                
                {/* 수정 중 오버레이 */}
                {isPRDFixing && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4">
                        <img
                          src="/assets/mini_kyle_thinking.png"
                          alt="Kyle thinking"
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">문서를 수정하고 있습니다</h3>
                      <div className="flex gap-1 mt-4">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                            style={{
                              animationDelay: `${index * 0.2}s`,
                              animationDuration: '1.2s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 수정 요청 채팅바 */}
              {prdContent && !isEditingPRD && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={prdFixRequest}
                        onChange={(e) => setPRDFixRequest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePRDFix()}
                        placeholder="Kyle에게 수정을 요청하세요"
                        className="w-full px-4 py-2.5 pr-12 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 transition-all"
                        disabled={isPRDFixing}
                      />
                      <button
                        onClick={handlePRDFix}
                        disabled={isPRDFixing || !prdFixRequest.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {isPRDFixing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 디자이너 - 페이지 설계 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img 
                        src="/assets/mini_heather_default.png" 
                        alt="디자이너 Heather" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">디자이너 Heather</h3>
                      <p className="text-sm text-gray-600">페이지별 디자인 설계</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {designContent && !isDesignLoading && !isDesignError && (
                      <>
                        <button
                          onClick={isEditingDesign ? handleSaveDesign : handleEditDesign}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                          title={isEditingDesign ? "저장" : "편집"}
                        >
                          {isEditingDesign ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                        {isEditingDesign && (
                          <button
                            onClick={handleCancelDesign}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                            title="취소"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 ${isDesignLoading ? 'bg-yellow-500 animate-pulse' : isDesignError ? 'bg-red-500' : designContent ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                      <span className={`font-medium ${isDesignLoading ? 'text-yellow-600' : isDesignError ? 'text-red-600' : designContent ? 'text-green-600' : 'text-yellow-600'}`}>
                        {isDesignLoading ? '생성 중' : isDesignError ? '오류' : designContent ? '완료' : '대기 중'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto relative">
                {isDesignLoading ? (
                  <div className="h-[calc(100vh-320px)] flex items-center justify-center p-6">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-6">
                        <img
                          src="/assets/mini_heather_thinking.png"
                          alt="Heather thinking"
                          className="w-24 h-24 object-contain"
                        />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">UI/UX 설계 중</h3>
                      <p className="text-sm text-gray-600 text-center max-w-xs">
                        PRD를 분석하여 최적의 사용자 경험을 설계하고 있습니다
                      </p>
                      <div className="flex gap-1 mt-6">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                            style={{
                              animationDelay: `${index * 0.2}s`,
                              animationDuration: '1.2s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : isDesignError ? (
                  <div className="h-[calc(100vh-320px)] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6">
                        <img
                          src="/assets/mini_heather_error.png"
                          alt="Heather error"
                          className="w-24 h-24 object-contain mx-auto"
                        />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        UI/UX 설계 실패
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        설계 과정에서 문제가 발생했어요. 잠시 후 다시 시도해주세요.
                      </p>
                      <button
                        onClick={() => generateDesign(prdContent || '')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        다시 시도
                      </button>
                    </div>
                  </div>
                ) : designContent ? (
                  <>
                    <div className="p-6">
                      {isEditingDesign ? (
                        <textarea
                          value={tempDesignContent}
                          onChange={(e) => setTempDesignContent(e.target.value)}
                          className="w-full h-[calc(100vh-330px)] p-4 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="UI/UX 설계 내용을 입력하세요..."
                        />
                      ) : (
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
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-800">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-gray-600 not-italic">{children}</em>
                        ),
                      }}
                      >
                        {designContent}
                      </ReactMarkdown>
                      )}
                    </div>
                    
                    {/* 수정 중 오버레이 */}
                    {isDesignFixing && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4">
                            <img
                              src="/assets/mini_heather_thinking.png"
                              alt="Heather thinking"
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                          <h3 className="text-base font-medium text-gray-900 mb-2">디자인을 수정하고 있습니다</h3>
                          <div className="flex gap-1 mt-4">
                            {[0, 1, 2].map((index) => (
                              <div
                                key={index}
                                className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                                style={{
                                  animationDelay: `${index * 0.2}s`,
                                  animationDuration: '1.2s'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[calc(100vh-320px)] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        UI/UX 설계 대기 중
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        PRD 작성이 완료되면 자동으로 시작됩니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 수정 요청 채팅바 */}
              {designContent && !isEditingDesign && !isDesignLoading && !isDesignError && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={designFixRequest}
                        onChange={(e) => setDesignFixRequest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleDesignFix()}
                        placeholder="Heather에게 수정을 요청하세요"
                        className="w-full px-4 py-2.5 pr-12 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 placeholder-gray-400 transition-all"
                        disabled={isDesignFixing}
                      />
                      <button
                        onClick={handleDesignFix}
                        disabled={isDesignFixing || !designFixRequest.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDesignFixing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 개발자 - 테이블 설계 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img 
                        src="/assets/mini_bob_default.png" 
                        alt="개발자 Bob" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">개발자 Bob</h3>
                      <p className="text-sm text-gray-600">개발 작업 task 설계</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {databaseSchema && !isDatabaseLoading && !isDatabaseError && (
                      <>
                        <button
                          onClick={isEditingDatabase ? handleSaveDatabase : handleEditDatabase}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                          title={isEditingDatabase ? "저장" : "편집"}
                        >
                          {isEditingDatabase ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                        {isEditingDatabase && (
                          <button
                            onClick={handleCancelDatabase}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                            title="취소"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 ${isDatabaseLoading ? 'bg-yellow-500 animate-pulse' : isDatabaseError ? 'bg-red-500' : databaseSchema ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
                      <span className={`font-medium ${isDatabaseLoading ? 'text-yellow-600' : isDatabaseError ? 'text-red-600' : databaseSchema ? 'text-green-600' : 'text-gray-400'}`}>
                        {isDatabaseLoading ? '생성 중' : isDatabaseError ? '오류' : databaseSchema ? '완료' : '대기 중'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto relative">
                {isDatabaseLoading ? (
                  <div className="h-[calc(100vh-320px)] flex items-center justify-center p-6">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-6">
                        <img
                          src="/assets/mini_bob_thinking.png"
                          alt="Bob thinking"
                          className="w-24 h-24 object-contain"
                        />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">개발 작업 설계 중</h3>
                      <p className="text-sm text-gray-600 text-center max-w-xs">
                        PRD와 UI/UX 설계를 분석하여 개발 작업을 체계적으로 설계하고 있습니다
                      </p>
                      <div className="flex gap-1 mt-6">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                            style={{
                              animationDelay: `${index * 0.2}s`,
                              animationDuration: '1.2s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : isDatabaseError ? (
                  <div className="h-[calc(100vh-320px)] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6">
                        <img
                          src="/assets/mini_bob_error.png"
                          alt="Bob error"
                          className="w-24 h-24 object-contain mx-auto"
                        />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        개발 작업 설계 실패
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        설계 과정에서 문제가 발생했어요. 잠시 후 다시 시도해주세요.
                      </p>
                      <button
                        onClick={() => generateDatabaseSchema(prdContent || '', designContent || '')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        다시 시도
                      </button>
                    </div>
                  </div>
                ) : databaseSchema ? (
                  <>
                    <div className="p-6">
                      {isEditingDatabase ? (
                        <textarea
                          value={tempDatabaseContent}
                          onChange={(e) => setTempDatabaseContent(e.target.value)}
                          className="w-full h-[calc(100vh-330px)] p-4 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="개발 작업 task를 입력하세요..."
                        />
                      ) : (
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
                      }}
                      >
                        {databaseSchema}
                      </ReactMarkdown>
                      )}
                    </div>
                    
                    {/* 수정 중 오버레이 */}
                    {isDatabaseFixing && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4">
                            <img
                              src="/assets/mini_bob_thinking.png"
                              alt="Bob thinking"
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                          <h3 className="text-base font-medium text-gray-900 mb-2">데이터베이스를 수정하고 있습니다</h3>
                          <div className="flex gap-1 mt-4">
                            {[0, 1, 2].map((index) => (
                              <div
                                key={index}
                                className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                                style={{
                                  animationDelay: `${index * 0.2}s`,
                                  animationDuration: '1.2s'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[calc(100vh-320px)] flex items-center justify-center p-6">
                    <div className="text-center max-w-xs">
                      <div className="mb-6">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        개발 작업 설계 대기 중
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        UI/UX 설계가 완료되면 자동으로 시작됩니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 수정 요청 채팅바 */}
              {databaseSchema && !isEditingDatabase && !isDatabaseLoading && !isDatabaseError && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={databaseFixRequest}
                        onChange={(e) => setDatabaseFixRequest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleDatabaseFix()}
                        placeholder="Bob에게 수정을 요청하세요"
                        className="w-full px-4 py-2.5 pr-12 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 transition-all"
                        disabled={isDatabaseFixing}
                      />
                      <button
                        onClick={handleDatabaseFix}
                        disabled={isDatabaseFixing || !databaseFixRequest.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDatabaseFixing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
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
      
      {/* VibeCoding Guide Modal */}
      <VibeCodingGuideModal
        isOpen={showVibeCodingModal}
        onClose={() => setShowVibeCodingModal(false)}
        onDownload={handleDownload}
      />
    </div>
  );
}