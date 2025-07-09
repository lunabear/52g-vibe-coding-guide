'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, RefreshCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  errorCode?: number | string;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

const errorMessages = {
  404: {
    title: '페이지를 찾을 수 없어요',
    message: '찾으시는 페이지가 이사를 갔나봐요. URL을 다시 확인해주세요.'
  },
  500: {
    title: '서버에 문제가 생겼어요',
    message: '잠시만 기다려주시면 곧 해결할게요. 조금 뒤에 다시 시도해주세요.'
  },
  503: {
    title: '서비스 점검 중이에요',
    message: '더 나은 서비스를 위해 잠시 점검하고 있어요. 곧 돌아올게요!'
  },
  network: {
    title: '인터넷 연결을 확인해주세요',
    message: '네트워크에 연결할 수 없어요. 인터넷 연결 상태를 확인해주세요.'
  },
  default: {
    title: '문제가 발생했어요',
    message: '예상치 못한 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
  }
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  errorCode = 'default',
  title,
  message,
  showHomeButton = true,
  showRetryButton = false,
  onRetry
}) => {
  const router = useRouter();
  
  const errorInfo = errorMessages[errorCode as keyof typeof errorMessages] || errorMessages.default;
  const displayTitle = title || errorInfo.title;
  const displayMessage = message || errorInfo.message;

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Error Code Display */}
        {errorCode !== 'default' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <h1 className="font-mono text-6xl font-bold text-gray-900">
              {errorCode}
            </h1>
          </motion.div>
        )}
        
        {/* Character Image */}
        <div className="mb-8">
          <img
            src="/assets/coach_error.png"
            alt="Error Coach"
            className="w-80 h-80 object-contain drop-shadow-lg mx-auto"
          />
        </div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-2xl font-medium text-gray-900">
            {displayTitle}
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            {displayMessage}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {showHomeButton && (
            <Button
              onClick={handleGoHome}
              variant="default"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </Button>
          )}
          
          {showRetryButton && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              다시 시도하기
            </Button>
          )}
        </motion.div>

        {/* Additional Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 pt-8 border-t border-gray-100"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>계속해서 문제가 발생한다면</span>
            <a 
              href="#" 
              className="text-black underline hover:no-underline"
              onClick={(e) => {
                e.preventDefault();
                // 고객센터 또는 문의하기 페이지로 이동
              }}
            >
              고객센터에 문의해주세요
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// 편의를 위한 프리셋 컴포넌트들
export const Error404Page = () => <ErrorPage errorCode={404} />;
export const Error500Page = () => <ErrorPage errorCode={500} />;
export const Error503Page = () => <ErrorPage errorCode={503} />;
export const NetworkErrorPage = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorPage errorCode="network" showRetryButton={true} onRetry={onRetry} />
);