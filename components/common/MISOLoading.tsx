'use client';

import { motion } from 'framer-motion';
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
      {/* MISO 캐릭터 컨테이너 */}
      <div className="relative mb-8">
        {/* 부드러운 배경 효과 */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.1, 0.2]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -inset-8 bg-blue-100 rounded-full blur-3xl"
        />
        
        {/* 대화 버블 효과 */}
        <motion.div
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
            ease: "easeOut"
          }}
          className="absolute -top-4 -right-4 w-16 h-16 bg-blue-200 rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            delay: 1,
            ease: "easeOut"
          }}
          className="absolute -bottom-4 -left-4 w-12 h-12 bg-indigo-200 rounded-full"
        />
        
        {/* MISO 캐릭터 - 더 크게 */}
        <motion.div
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Image
            src="/assets/miso_processing_realtime.gif"
            alt="MISO Processing"
            width={200}
            height={200}
            className="object-contain drop-shadow-lg"
            priority
            unoptimized
          />
        </motion.div>
        
        {/* 작은 별 효과 */}
        <motion.div
          animate={{ 
            rotate: 360
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-2 -right-2"
        >
          <span className="text-2xl">✨</span>
        </motion.div>
      </div>
      
      {/* 텍스트 메시지 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h3 className="text-xl font-medium text-gray-900">{message}</h3>
        <p className="text-sm text-gray-600 max-w-sm">{subMessage}</p>
      </motion.div>
      
      {/* 점 애니메이션 */}
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.2
            }}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}