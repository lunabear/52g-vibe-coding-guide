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
        <div className="w-full max-w-7xl mx-auto px-8 pt-32 pb-16">
          {/* 카드 그리드 - 3개 카드에 맞게 조정 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 overflow-visible">
            {/* 아이디어 발굴 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.push('/chat')}
              className="group relative bg-gray-50 rounded-2xl p-6 custom:p-10 h-[320px] custom:h-[400px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible"
            >
              {/* 메인 텍스트 - 상단 왼쪽으로 이동 */}
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                  아이디어가<br />
                  필요하신가요?
                </h2>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                  Mini Ally에게 실시간으로<br />
                  질문하고 고민을 해결해 보세요.
                
                </p>
              </div>

              {/* 캐릭터 - 카드를 벗어나는 효과 */}
              <div className="absolute bottom-6 -right-4 w-32 h-32 custom:w-40 custom:h-40 z-20">
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
                <div className="absolute bottom-4 -right-4 w-44 h-44 custom:w-56 custom:h-56">
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
              <div className="absolute bottom-6 custom:bottom-10 left-6 custom:left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">시작하기 →</span>
              </div>
            </motion.button>

            {/* 아이디어 구체화 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => window.location.href = 'http://172.16.70.94:3000/prd-generator'}
              className="group relative bg-gray-50 rounded-2xl p-6 custom:p-10 h-[320px] custom:h-[400px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible"
            >
              {/* 메인 텍스트 - 상단 왼쪽으로 이동 */}
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                  바이브코딩에 필요한<br />
                  지침이 필요한가요?
                </h2>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                  체계적인 지침 작성으로 개발 효율성 UP!<br />
                  전문가와 핵심 요구사항을 정리해 보세요.
                </p>
              </div>

              {/* 캐릭터 - 카드를 벗어나는 효과 */}
              <div className="absolute -bottom-6 -right-6 custom:-right-10 w-60 h-44 custom:w-80 custom:h-60 z-20">
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
              <div className="absolute bottom-6 custom:bottom-10 left-6 custom:left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">시작하기 →</span>
              </div>
            </motion.button>

            {/* MISO 설계 도우미 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => router.push('/miso-generator')}
              className="group relative bg-gray-50 rounded-2xl p-6 custom:p-10 h-[320px] custom:h-[400px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible xl:col-span-1 lg:col-span-2 lg:xl:col-span-1"
            >
              {/* 메인 텍스트 - 상단 왼쪽으로 이동 */}
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                  MISO 워크플로우<br />
                  설계가 필요한가요?
                </h2>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                  Minian과 함께 입력-출력-동작을<br />
                  체계적으로 설계해 보세요.
                </p>
              </div>

              {/* 캐릭터 - 카드를 벗어나는 효과 */}
              <div className="absolute bottom-20 right-2 w-24 h-24 custom:w-32 custom:h-32 z-20">
                {/* 기본 이미지 */}
                <Image
                  src="/assets/minian-default.png"
                  alt="Minian"
                  width={128}
                  height={128}
                  className="object-contain absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500 ease-in-out"
                  priority
                />
                {/* 호버 이미지 - 살짝 크게 */}
                <div className="absolute -bottom-2 -right-2 w-28 h-28 custom:w-36 custom:h-36">
                  <Image
                    src="/assets/minian-hover.png"
                    alt="Minian Hover"
                    width={144}
                    height={144}
                    className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    priority
                  />
                </div>
              </div>

              {/* 호버 시 나타나는 안내 - 위치 조정 */}
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