'use client';

import Image from 'next/image';

interface MISOLoadingProps {
  message?: string;
  subMessage?: string;
}

export default function MISOLoading({ 
  message = "MISO가 준비중입니다", 
  subMessage = "잠시만 기다려주세요..." 
}: MISOLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* MISO 캐릭터 */}
      <div className="mb-8">
        <Image
          src="/assets/miso_processing_realtime.gif"
          alt="MISO Processing"
          width={200}
          height={200}
          className="object-contain border-2 border-gray-200 rounded-lg"
          priority
          unoptimized
        />
      </div>
      
      {/* 텍스트 메시지 */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-medium text-gray-900">{message}</h3>
        <p className="text-sm text-gray-600 max-w-sm">{subMessage}</p>
      </div>
      
      {/* 점 애니메이션 */}
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
  );
}