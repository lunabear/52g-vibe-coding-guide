'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { misoAPI } from '@/lib/miso-api';
import MISOLoading from '@/components/common/MISOLoading';
import WorkflowVisualization from '@/components/common/WorkflowVisualization';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WorkflowNode } from '@/types/prd.types';
import { cn } from '@/lib/utils';
import { loadMiniAllySession } from '@/lib/mini-ally-utils';

function MisoGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expectedInput, setExpectedInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [desiredAction, setDesiredAction] = useState('');
  const [explanation, setExplanation] = useState('');
  const [flow, setFlow] = useState<WorkflowNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mini-Ally 세션 체크 및 로깅
  useEffect(() => {
    const fromMiniAlly = searchParams.get('fromMiniAlly') === 'true';
    
    if (fromMiniAlly) {
      const session = loadMiniAllySession();
      
      if (session) {
        console.log('📊 MISO Generator - Mini-Ally 세션 데이터:', {
          '타겟 사용자': session.projectData.personaProfile,
          '불편함 시점': session.projectData.painPointContext,
          '불편함 이유': session.projectData.painPointReason,
          '핵심 문제': session.projectData.coreProblemStatement,
          '솔루션 이름': session.projectData.solutionNameIdea,
          '솔루션 메커니즘': session.projectData.solutionMechanism,
          '기대 효과': session.projectData.expectedOutcome
        });
        
      } else {
        console.log('⚠️ MISO Generator - Mini-Ally 세션을 찾을 수 없습니다.');
      }
    } else {
      console.log('📝 MISO Generator - 일반 플로우로 시작됨');
    }
  }, [searchParams]);
  // 폼 유효성 검사
  const canSubmit = () => {
    return expectedInput.trim() && expectedOutput.trim() && desiredAction.trim();
  };

  // XML 태그로 조합된 쿼리 생성
  const generateQuery = () => {
    return `<input>${expectedInput.trim()}</input><output>${expectedOutput.trim()}</output><action>${desiredAction.trim()}</action>`;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    const query = generateQuery();
    setIsLoading(true);
    setError(null);
    setExplanation('');
    setFlow([]);

    try {
      const result = await misoAPI.runMisoWorkflow(query);
      if (result.explanation.startsWith('Error:')) {
        setError(result.explanation);
      } else {
        setExplanation(result.explanation);
        if (result.flow) {
          setFlow(result.flow);
        }
      }
    } catch (e) {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
             {/* 왼쪽 패널 - 입력 영역 */}
       <div className="w-full lg:w-[40%] h-1/2 lg:h-full bg-[#FAFAFA] flex flex-col">
        {/* 헤더 */}
        <div className="h-[60px] lg:h-[72px] px-4 lg:px-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-10 w-10 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
            <h2 className="text-[18px] lg:text-[22px] font-light text-gray-900 tracking-tight">MISO 설계 도우미</h2>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-4 lg:px-8 py-8">
            {/* 헤더 */}
            <div className="mb-12">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center flex-shrink-0 border-2 border-gray-200 rounded-xl overflow-hidden">
                  <img 
                    src="/assets/minian-making.png" 
                    alt="Minian의 MISO 설계실" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xl lg:text-2xl font-medium text-gray-900 mb-3">MISO 설계실 ✨</div>
                  <div className="text-[14px] lg:text-[16px] text-gray-600 font-light leading-relaxed">
                  만들고 싶은 서비스가 어떻게 작동하면 좋을지 알려주세요. 
                  <br /> MISO설계 가이드를 만들어 줄게요!
                  
                  </div>
                </div>
              </div>
            </div>

            {/* 설문 폼 */}
            <div className="space-y-10">
              {/* 1. 예상 입력 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">1</span>
                  </div>
                                     <div className="flex-1">
                     <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                      사용자는 처음에 무엇을 입력하나요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 font-light">
                      💡 Tip: “서비스를 시작하기 위해 사용자가 하는 첫 행동”을 적어주세요.
                      </span>
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={expectedInput}
                        onChange={(e) => setExpectedInput(e.target.value)}
                        placeholder="예: 이름 입력, 상품 검색, 위치 선택, 사진 업로드"
                        rows={3}
                        className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none font-light"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setExpectedInput('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 예상 출력 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">2</span>
                  </div>
                                     <div className="flex-1">
                     <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                      서비스는 사용자에게 어떤 결과를 보여주나요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 font-light">
                      💡 Tip: “사용자가 서비스를 쓰고 나서 얻게 되는 것”을 적어주세요.
                      </span>
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={expectedOutput}
                        onChange={(e) => setExpectedOutput(e.target.value)}
                        placeholder="예: 추천 상품 목록, 날씨 정보, 분석 결과, 번역문"
                        rows={3}
                        className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none font-light"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setExpectedOutput('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 원하는 동작 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">3</span>
                  </div>
                                     <div className="flex-1">
                     <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                        결과를 보여주기 위해 서비스는 어떤 일을 해야하나요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 font-light">
                      💡 Tip: “사용자가 모르는 사이에 서비스가 뒤에서 해주는 일”을 적어주세요.
                      </span>
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={desiredAction}
                        onChange={(e) => setDesiredAction(e.target.value)}
                        placeholder="예: 입력한 내용을 분석, 조건에 맞는 결과 찾기, 이미지 변환"
                        rows={3}
                        className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none font-light"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setDesiredAction('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* 에러 표시 */}
            {error && (
              <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-1">문제가 발생했습니다</p>
                <p className="text-xs text-red-600 font-light">{error}</p>
              </div>
            )}
          </div>

          {/* 하단 고정 버튼 */}
          <div className="bg-white border-t border-gray-100 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-light">
                {[expectedInput, expectedOutput, desiredAction].filter(v => v.trim().length > 0).length}/3 질문 답변 완료
              </span>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !canSubmit()}
                className={cn(
                  "text-[14px] lg:text-[16px] px-6 py-3 rounded-md transition-all font-medium",
                  canSubmit() && !isLoading
                    ? "bg-gray-900 hover:bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>설계 중...</span>
                  </div>
                ) : (
                  <span>워크플로우 생성하기</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

             {/* 오른쪽 패널 - 결과 영역 */}
       <div className="w-full lg:w-[60%] h-1/2 lg:h-full bg-white border-l lg:border-l border-t lg:border-t-0 border-gray-100 flex flex-col">
         {/* 헤더 */}
         <div className="h-[60px] lg:h-[72px] px-4 lg:px-6 flex items-center border-b border-gray-100">
           <div>
             <h2 className="text-[16px] lg:text-[18px] font-normal text-gray-900">분석 결과</h2>
             <p className="text-[12px] lg:text-[13px] text-gray-500 font-light">워크플로우 설계</p>
           </div>
         </div>
         
         {/* 결과 영역 */}
         <div className="flex-1 overflow-hidden">
           {isLoading && (
             <div className="h-full flex flex-col items-center justify-center px-8">
               <div className="w-16 h-16 mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                 <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
               </div>
               <div className="text-center">
                 <p className="text-sm text-gray-600 font-light mb-2">워크플로우 설계 중</p>
                 <div className="flex justify-center gap-1">
                   <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></span>
                   <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                   <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                 </div>
               </div>
             </div>
           )}

           {!isLoading && !explanation && !error && (
             <div className="h-full flex flex-col items-center justify-center text-center px-8">
               <div className="w-48 h-48 lg:w-56 lg:h-56 mx-auto mb-6 p-2">
                 <img
                   src="/assets/minian-drawing.png"
                   alt="MISO Minian"
                   className="w-full h-full object-contain object-center"
                 />
               </div>
               <h3 className="text-[20px] lg:text-[24px] font-light text-gray-900 mb-3">
                 분석 결과가 여기에 표시됩니다
               </h3>
               <p className="text-[14px] lg:text-[16px] text-gray-500 leading-relaxed font-light">
                 왼쪽 질문에 답변해주시면<br />
                 맞춤형 워크플로우를 설계해드립니다
               </p>
             </div>
           )}

           {!isLoading && error && (
             <div className="h-full flex flex-col items-center justify-center text-center px-8">
               <div className="w-32 h-32 mx-auto mb-6">
                 <img
                   src="/assets/mini-kyle-miso-error.png"
                   alt="MISO Kyle Error"
                   className="w-full h-full object-contain"
                 />
               </div>
               <div className="max-w-sm">
                 <h3 className="text-base font-medium text-red-800 mb-2">
                   분석에 실패했습니다
                 </h3>
                 <p className="text-sm text-red-600 font-light">
                   다시 시도하거나 질문을 더 구체적으로 작성해보세요
                 </p>
               </div>
             </div>
           )}

          {explanation && (
            <div className="h-full overflow-y-auto">
                             <div className="mx-auto px-4 lg:px-8 py-8 space-y-6">
                {/* 설명 섹션 */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    설명
                  </h3>
                  <div className="prose prose-sm max-w-none text-[14px] lg:text-[16px] font-light leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="my-3 space-y-1 list-disc ml-4 pl-2">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-700 leading-relaxed">
                            {children}
                          </li>
                        ),
                      }}
                    >
                      {explanation}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* 워크플로우 시각화 */}
                {flow.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <WorkflowVisualization flow={flow} explanation={explanation} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
}

export default function MisoGeneratorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <MisoGeneratorContent />
    </Suspense>
  );
}