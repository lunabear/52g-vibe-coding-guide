'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeName: string;
  prompt: string;
}

export default function PromptModal({ isOpen, onClose, nodeName, prompt }: PromptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {nodeName} 프롬프트
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* 콘텐츠 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="relative">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt}
              </pre>
            </div>
            
            {/* 복사 버튼 */}
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title={copied ? '복사됨!' : '클립보드에 복사'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? '복사됨!' : '복사하기'}
          </button>
        </div>
      </div>
    </div>
  );
} 