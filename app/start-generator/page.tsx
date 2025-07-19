'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import Footer from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function StartGeneratorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="absolute top-28 left-0 right-0 max-w-7xl mx-auto px-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              뒤로가기
            </button>
        </div>
        <div className="w-full max-w-6xl mx-auto px-8 pt-32 pb-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900">어떤 도움이 필요하신가요?</h1>
            <p className="text-lg text-gray-600 mt-4">수행하고 싶은 작업에 가장 가까운 서비스를 선택해주세요.</p>
          </div>
          <div className="grid grid-cols-1 custom:grid-cols-2 gap-10 overflow-visible">
            {/* Miso Generator 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.push('/miso-generator')}
              className="group relative bg-gray-50 rounded-2xl p-6 custom:p-10 h-[320px] custom:h-[400px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible"
            >
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                  MISO 설계 도우미
                </h2>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                  카일과 함께 미소를<br />설계해보세요.
                </p>
              </div>
              <div className="absolute bottom-10 -right-4 w-32 h-32 custom:w-40 custom:h-40 z-20">
                <Image
                  src="/assets/mini-kyle-miso-head.png"
                  alt="Miso Generator"
                  width={160}
                  height={160}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute bottom-6 custom:bottom-10 left-6 custom:left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">시작하기 →</span>
              </div>
            </motion.button>

            {/* PRD Generator 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => router.push('/prd-generator')}
              className="group relative bg-gray-50 rounded-2xl p-6 custom:p-10 h-[320px] custom:h-[400px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible"
            >
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                  바이브코딩 지침 생성하기
                </h2>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                  체계적인 질문에 답변하며<br />완성도 높은 지침을 작성합니다.
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 custom:-right-10 w-60 h-44 custom:w-80 custom:h-60 z-20">
                <Image
                  src="/assets/coach_default.png"
                  alt="PRD Generator"
                  width={320}
                  height={240}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute bottom-6 custom:bottom-10 left-6 custom:left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">시작하기 →</span>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
