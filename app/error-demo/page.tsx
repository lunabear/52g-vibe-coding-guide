'use client';

import React, { useState } from 'react';
import { ErrorPage, Error404Page, Error500Page, Error503Page, NetworkErrorPage } from '@/components/common/ErrorPage';
import { Button } from '@/components/ui/button';

export default function ErrorDemoPage() {
  const [currentError, setCurrentError] = useState<string | null>(null);

  const errorTypes = [
    { code: '404', label: '404 에러' },
    { code: '500', label: '500 에러' },
    { code: '503', label: '503 에러' },
    { code: 'network', label: '네트워크 에러' },
    { code: 'custom', label: '커스텀 에러' },
  ];

  if (currentError) {
    switch (currentError) {
      case '404':
        return <Error404Page />;
      case '500':
        return <Error500Page />;
      case '503':
        return <Error503Page />;
      case 'network':
        return <NetworkErrorPage onRetry={() => setCurrentError(null)} />;
      case 'custom':
        return (
          <ErrorPage
            errorCode="CUSTOM"
            title="커스텀 에러 메시지"
            message="이렇게 커스텀 에러 메시지를 표시할 수 있어요."
            showRetryButton={true}
            onRetry={() => setCurrentError(null)}
          />
        );
      default:
        return <ErrorPage />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light mb-8">Error Page Demo</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-medium mb-6">에러 페이지 테스트</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {errorTypes.map((error) => (
              <Button
                key={error.code}
                onClick={() => setCurrentError(error.code)}
                variant="outline"
                className="h-20 text-base"
              >
                {error.label}
              </Button>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">사용 방법:</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
{`import { ErrorPage } from '@/components/common/ErrorPage';

// 기본 사용
<ErrorPage />

// 404 에러
<ErrorPage errorCode={404} />

// 커스텀 메시지
<ErrorPage 
  errorCode="CUSTOM"
  title="커스텀 제목"
  message="커스텀 메시지"
  showRetryButton={true}
  onRetry={() => console.log('retry')}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}