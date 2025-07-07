'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <SimpleHeader />
      <main className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center space-y-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-extralight tracking-tight leading-tight">
              아이디어를<br />
              <span className="font-normal">현실로</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 font-light max-w-md mx-auto leading-relaxed"
          >
            당신의 생각을 체계적인 제품 기획서로 만들어드립니다
          </motion.p>


          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/prd-generator')}
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-normal bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            시작하기
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </main>
    </>
  );
}