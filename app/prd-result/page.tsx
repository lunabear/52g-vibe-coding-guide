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

export default function PRDResultPage() {
  const router = useRouter();
  const { getAllQuestionsAndAnswers, prdContent, setPRDContent } = usePRDContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDownload = () => {
    const blob = new Blob([prdContent || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-white">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50"
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
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
              다운로드
            </button>
          </div>
        </div>
      </motion.header>

      <main className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-6"
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4"
            >
              <FileText className="w-8 h-8 text-gray-600" />
            </motion.div>
            <h1 className="text-3xl font-light mb-2">PRD가 완성되었습니다</h1>
            <p className="text-gray-600">아래에서 생성된 문서를 확인하고 다운로드하세요</p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-lg border border-gray-100 shadow-sm"
          >
            <article className="prose prose-lg max-w-none p-8 md:p-12 
              prose-headings:font-light prose-headings:text-gray-900
              prose-h1:text-3xl prose-h1:mb-8 prose-h1:mt-0
              prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-strong:font-medium prose-strong:text-gray-900
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:mb-2 prose-li:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg
              prose-table:border-collapse prose-table:w-full
              prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-50 prose-th:font-medium
              prose-td:border prose-td:border-gray-300 prose-td:p-2"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-light text-gray-900 mb-8">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-light text-gray-900 mt-12 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-medium text-gray-800 mt-8 mb-3">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-700">{children}</li>,
                  strong: ({ children }) => <strong className="font-medium text-gray-900">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 my-6 italic text-gray-600">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full divide-y divide-gray-300">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-gray-700 border-t border-gray-200">{children}</td>
                  ),
                  hr: () => <hr className="my-8 border-gray-200" />,
                  br: () => <br className="my-2" />,
                  code: ({ children, ...props }) => {
                    const match = /language-(\w+)/.exec(props.className || '');
                    const isInline = !match;
                    
                    return isInline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                    ) : (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm font-mono" {...props}>{children}</code>
                      </pre>
                    );
                  },
                }}
              >
                {prdContent || '# PRD 문서\n\n내용을 불러올 수 없습니다.'}
              </ReactMarkdown>
            </article>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}