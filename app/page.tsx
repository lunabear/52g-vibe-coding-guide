'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import Footer from '@/components/layout/Footer';
import HackathonModal from '@/components/common/HackathonModal';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HackathonModal />
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-8 pt-32 pb-16">
          {/* 카드 그리드 - 타이틀 없이 바로 시작 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-visible">
            {/* 아이디어 발굴 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.push('/chat')}
              className="group relative bg-gray-50 rounded-2xl p-10 h-[400px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible"
            >
              {/* 메인 텍스트 - 상단 왼쪽으로 이동 */}
              <div className="absolute top-10 left-10 space-y-4 max-w-[280px]">
                <h2 className="text-[28px] leading-tight font-bold text-gray-900">
                  아이디어가<br />
                  필요하신가요?
                </h2>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  Mini Ally에게 실시간으로<br />
                  질문하고 고민을 해결해 보세요.
                
                </p>
              </div>

              {/* 캐릭터 - 카드를 벗어나는 효과 */}
              <div className="absolute bottom-6 -right-4 w-40 h-40 z-20">
                {/* 기본 이미지 */}
                <Image
                  src="/assets/mini_ally_default.png"
                  alt="Mini Ally"
                  width={160}
                  height={160}
                  className="object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500 ease-in-out"
                  priority
                />
                {/* 호버 이미지 - 더 크게 */}
                <div className="absolute bottom-4 -right-4 w-56 h-56">
                  <Image
                    src="/assets/mini_ally_hover.png"
                    alt="Mini Ally Hover"
                    width={224}
                    height={224}
                    className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    priority
                  />
                </div>
              </div>

              {/* 호버 시 나타나는 안내 - 위치 조정 */}
              <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">시작하기 →</span>
              </div>
            </motion.button>

            {/* PRD 작성 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => router.push('/prd-generator')}
              className="group relative bg-gray-50 rounded-2xl p-10 h-[400px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible"
            >
              {/* 메인 텍스트 - 상단 왼쪽으로 이동 */}
              <div className="absolute top-10 left-10 space-y-4 max-w-[280px]">
                <h2 className="text-[28px] leading-tight font-bold text-gray-900">
                  아이디어를<br />
                  빠르고 체계적으로<br />
                  구현하고 싶나요?
                </h2>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  제품 기획서로 AI 구현 속도·정확도 UP!<br />
                  전문가와 핵심 요구사항을 정리해 보세요.
                </p>
              </div>

              {/* 캐릭터 - 카드를 벗어나는 효과 */}
              <div className="absolute -bottom-6 -right-10 w-80 h-60 z-20">
                {/* 기본 이미지 */}
                <Image
                  src="/assets/coach_default.png"
                  alt="Coach Team"
                  width={320}
                  height={240}
                  className="object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500 ease-in-out"
                  priority
                />
                {/* 호버 이미지 */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src="/assets/coach_hover.png"
                    alt="Coach Team Hover"
                    width={320}
                    height={240}
                    className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    priority
                  />
                </div>
              </div>

              {/* 호버 시 나타나는 안내 - 위치 조정 */}
              <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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