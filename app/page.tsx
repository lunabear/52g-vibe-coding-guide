'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* 왼쪽 영역 - 디자인싱킹&아이데이션 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <div className="text-center space-y-6">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl font-light tracking-tight leading-tight text-gray-800"
              >
                디자인싱킹<br />
                <span className="font-normal">&</span><br />
                아이데이션
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg text-gray-600 font-light max-w-sm mx-auto leading-relaxed"
              >
                체계적인 사고 과정을 통해<br />
                창의적인 솔루션을 발견하세요
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/idea-generator')}
                className="inline-flex items-center gap-2 px-8 py-3 text-sm font-normal bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
              >
                아이디어 시작하기
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* 오른쪽 영역 - 기존 콘텐츠 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <div className="text-center space-y-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl font-extralight tracking-tight leading-tight">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}