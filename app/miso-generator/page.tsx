'use client';

import { useState } from 'react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import Footer from '@/components/layout/Footer';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { misoAPI } from '@/lib/miso-api';
import MISOLoading from '@/components/common/MISOLoading';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MisoGeneratorPage() {
  const [query, setQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('질문 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      const result = await misoAPI.runMisoWorkflow(query);
      if (result.startsWith('Error:')) {
        setError(result);
      } else {
        setExplanation(result);
      }
    } catch (e) {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SimpleHeader />
      <main className="flex-1 flex flex-col items-center py-24 px-4">
        <div className="w-full max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">MISO 설계 도우미</h1>
            <p className="text-lg text-gray-600 mt-4">
              궁금한 점이나 해결하고 싶은 문제를 자유롭게 질문해보세요.<br />
              MISO가 최적의 해결책을 제안해 드립니다.
            </p>
          </div>

          <div className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="여기에 질문을 입력하세요. (예: 사용자를 위한 추천 시스템을 설계해줘)"
              className="min-h-[120px] text-base p-4 bg-white shadow-sm"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !query.trim()}
              className="w-full text-lg py-6"
            >
              {isLoading ? 'MISO가 생각하는 중...' : '결과 생성하기'}
            </Button>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-100 border border-red-200 text-red-800 rounded-md">
              <p className="font-semibold">오류 발생</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 flex justify-center">
              <MISOLoading />
            </div>
          )}

          {explanation && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {explanation}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}