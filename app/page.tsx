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
      {/* TODO:  플레이 메이커가 미소에 들어가면서 첫 모달을 지웁니다. */}
      {/* <HackathonModal /> */}
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-8 pt-32 pb-16">
          {/* Cards grid - adjusted for 3 cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 overflow-visible">
            {/* Idea discovery card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.push('/chat')}
              className="group relative bg-blue-50 rounded-2xl p-6 custom:p-10 h-[380px] custom:h-[480px] text-left hover:bg-blue-100 transition-all duration-200 overflow-visible border border-blue-100"
            >
              {/* Main text - moved to top left */}
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <div className="space-y-3">
                  {/* Badge */}
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    Getting Started
                  </span>
                  <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                    Chat with the AI coach to<br />shape ideas and get guidance.
                  </h2>
                </div>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                Mini Ally helps refine your thoughts through conversation<br />
                and turns them into actionable ideas.
                </p>
              </div>

              {/* Character - overflow effect */}
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

              {/* Hover hint */}
              <div className="absolute bottom-6 custom:bottom-10 left-6 custom:left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">Get started →</span>
              </div>
            </motion.button>

            {/* Requirements preparation card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => router.push('/prd-generator')}
              className="group relative bg-gray-50 rounded-2xl p-6 custom:p-10 h-[380px] custom:h-[480px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible"
            >
              {/* Main text - top left */}
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <div className="space-y-3">
                  {/* Badge */}
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                    v0 Implementation Prep
                  </span>
                  <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                    Need to organize development requirements?
                  </h2>
                </div>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                Work with experts to convert features and requirements<br />
                into practical development guidelines.
                  
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

              {/* Hover hint */}
              <div className="absolute bottom-6 custom:bottom-10 left-6 custom:left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">Get started →</span>
              </div>
            </motion.button>

            {/* MISO design assistant card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => router.push('/miso-generator')}
              className="group relative bg-gray-50 rounded-2xl p-6 custom:p-10 h-[380px] custom:h-[480px] text-left hover:bg-gray-100 transition-all duration-200 overflow-visible xl:col-span-1 lg:col-span-2 lg:xl:col-span-1"
            >
              {/* Main text - top left */}
              <div className="absolute top-6 custom:top-10 left-6 custom:left-10 space-y-4 max-w-[280px]">
                <div className="space-y-3">
                  {/* Badge */}
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                  MISO Implementation Prep
                  </span>
                  <h2 className="text-[22px] custom:text-[28px] leading-tight font-bold text-gray-900">
                    Need to design MISO workflows or chatbots?
                  </h2>
                </div>
                <p className="text-sm custom:text-base text-gray-600 font-light leading-relaxed">
                Visualize your service flow with MISO and<br />
                get help designing workflows and chatbots.
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

              {/* Hover hint */}
              <div className="absolute bottom-6 custom:bottom-10 left-6 custom:left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-gray-700 font-medium text-sm">Get started →</span>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}