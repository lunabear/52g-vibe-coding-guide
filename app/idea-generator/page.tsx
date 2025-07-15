'use client';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function IdeaGenerator() {
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full text-center"
        >
          <h1 className="text-5xl custom:text-6xl font-extralight tracking-tight leading-tight mb-8">
            아이디어 생성기
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            창의적인 아이디어를 체계적으로 발전시켜보세요
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
} 