'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { track } from '@vercel/analytics';
import { usePRDContext } from '@/contexts/PRDContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PRD_STEPS } from '@/lib/prd-questions';
import { ArrowLeft, ArrowRight, X, Sparkles } from 'lucide-react';
import { QuestionType, ExpertType } from '@/types/prd.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdditionalQuestions } from '@/hooks/useAdditionalQuestions';
import { ExpertQuestions } from '@/components/prd/ExpertQuestions';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { RestoreSessionModal } from '@/components/common/RestoreSessionModal';
import MISOLoading from '@/components/common/MISOLoading';
import { 
  loadMiniAllySession, 
  clearMiniAllySession, 
  convertProjectDataToContext,
  updateMiniAllySessionAnswers,
  updateMiniAllySessionStep,
  MiniAllySession 
} from '@/lib/mini-ally-utils';

function PRDGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentStep,
    answers,
    additionalQuestions,
    expertQuestions,
    chatMessages,
    updateAnswer,
    goToNextStep,
    goToPreviousStep,
    getCurrentStepData,
    canProceedToNextStep,
    setCurrentStep,
    setExpertQuestions,
    setExpertAnswers,
    resetPRD,
  } = usePRDContext();

  const { generateFinalQuestions } = useAdditionalQuestions();
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [hasFetchedFinalQuestions, setHasFetchedFinalQuestions] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [hint, setHint] = useState<string>('');
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [lastHintStep, setLastHintStep] = useState<number | null>(null);
  
  // Mini-Ally 세션 관련 상태
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedSession, setSavedSession] = useState<MiniAllySession | null>(null);
  const [isMiniAllyFlow, setIsMiniAllyFlow] = useState(false);
  
  const currentStepData = getCurrentStepData();
  
  // 쿼리 파라미터 확인
  const step = searchParams.get('step');
  const fromMiniAlly = searchParams.get('fromMiniAlly') === 'true';
  const fromMisoGenerator = searchParams.get('fromMisoGenerator') === 'true';
  const journeyId = searchParams.get('journey_id') || undefined;
  const journeyOrigin = searchParams.get('origin') || (journeyId ? 'chat' : undefined);
  const journeyIntent = searchParams.get('intent') || undefined;

  // Mini-Ally 세션 체크 및 복구 모달 표시
  useEffect(() => {
    const session = loadMiniAllySession();
    
    if (fromMiniAlly) {
      // Mini-Ally에서 직접 온 경우
      setIsMiniAllyFlow(true);
      setCurrentStep(4); // insight 단계로 바로 이동
    } else if (fromMisoGenerator) {
      // Miso-Generator에서 온 경우
      console.log('📋 PRD Generator - MISO Generator에서 유입됨');
      if (session) {
        // Mini-Ally → Miso-Generator → PRD-Generator 플로우
        console.log('📊 PRD Generator - Mini-Ally + Miso 데이터 활용 가능');
        setIsMiniAllyFlow(true);
        setCurrentStep(4); // insight 단계로 바로 이동
      } else {
        // Miso-Generator → PRD-Generator 직접 플로우
        console.log('📝 PRD Generator - MISO 설계 데이터만 활용');
        setCurrentStep(0); // 첫 단계부터 시작
      }
    } else if (session && !fromMiniAlly && !fromMisoGenerator) {
      // 이전 세션이 있고, 외부에서 직접 오지 않은 경우 복구 모달 표시
      setSavedSession(session);
      setShowRestoreModal(true);
    }
  }, [fromMiniAlly, fromMisoGenerator, setCurrentStep]);

  // 여정 랜딩 이벤트
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('journey_ctx');
      const ctx = stored ? JSON.parse(stored) : {};
      const payload = {
        feature_area: 'prd',
        journey_id: journeyId || ctx?.journey_id,
        journey_origin: journeyOrigin || ctx?.journey_origin,
        journey_intent: journeyIntent || ctx?.journey_intent,
      } as const;
      if (payload.journey_id) {
        track('journey_landed', payload);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 힌트 생성 useEffect
  useEffect(() => {
    // 힌트 생성 조건: step='hint' 파라미터가 있고, 3단계 이하이며, 단계가 변경되었을 때
    if (typeof window === 'undefined' || 
        step !== 'hint' || 
        currentStep > 3 || 
        lastHintStep === currentStep ||
        !currentStepData ||
        !chatMessages || 
        chatMessages.length === 0) return;
    
    const generateHint = async () => {
      // 즉시 로딩 상태 설정
      setIsLoadingHint(true);
      setLastHintStep(currentStep);
      setHint(''); // 이전 힌트 초기화
      
      try {
        // workflow를 사용한 힌트 생성 API 호출
        const context = `이전 대화 내용:
${chatMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}`;

        const request = `${currentStepData?.description || ''}
        
현재 질문: ${currentStepData?.questions?.[0]?.text || ''}`;

        const hintResponse = await fetch('/api/miso/generate-hint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context: context,
            request: request
          }),
        });
        
        if (hintResponse.ok) {
          const data = await hintResponse.json();
          setHint(data.hint || '힌트를 가져오지 못했습니다.');
        } else {
          setHint('힌트를 가져오지 못했습니다.');
        }
      } catch (error) {
        console.error('Failed to generate hint:', error);
        setHint('힌트를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoadingHint(false);
      }
    };
    
    generateHint();
  }, [step, currentStep, currentStepData, lastHintStep, chatMessages]);


  // 마지막 단계(인사이트)에 도달했을 때 MISO API 호출
  useEffect(() => {
    if (currentStepData && currentStepData.id === 'insight' && !hasFetchedFinalQuestions && !expertQuestions) {
      setIsGeneratingQuestions(true);
      
      if (isMiniAllyFlow) {
        // Mini-Ally 플로우: 세션에서 데이터 가져오기
        const session = loadMiniAllySession();
        if (session) {
          const context = convertProjectDataToContext(session.projectData);
          generateFinalQuestions(context).then((finalQuestions) => {
            console.log('Mini-Ally MISO API Response:', finalQuestions);
            setExpertQuestions(finalQuestions);
            setIsGeneratingQuestions(false);
            setHasFetchedFinalQuestions(true);
          });
        } else {
          // 세션이 없으면 홈으로 이동
          router.push('/');
        }
      } else {
        // 기존 플로우: 폼 답변 사용
        generateFinalQuestions(answers).then((finalQuestions) => {
          console.log('MISO API Response:', finalQuestions);
          setExpertQuestions(finalQuestions);
          setIsGeneratingQuestions(false);
          setHasFetchedFinalQuestions(true);
        });
      }
    }
  }, [currentStepData, hasFetchedFinalQuestions, expertQuestions, answers, generateFinalQuestions, setExpertQuestions, isMiniAllyFlow, router]);

  if (!currentStepData) {
    return null;
  }

  const progress = (currentStep / PRD_STEPS.length) * 100;

  const handleNextClick = async () => {
    if (!canProceedToNextStep()) return;
    
    // 마지막 단계에서 완료 클릭 시 결과 페이지로 이동
    if (currentStep === PRD_STEPS.length) {
      router.push('/prd-result');
      return;
    }
    
    goToNextStep();
  };

  // 현재 단계의 모든 질문 (기본 + 추가) - insight 단계가 아닌 경우만
  const allQuestions = currentStepData.id === 'insight' ? [] : [
    ...currentStepData.questions,
    ...(additionalQuestions[currentStepData.id] || [])
  ];

  // 인사이트 단계에서 전문가 질문 완료 핸들러
  const handleExpertQuestionsComplete = () => {
    if (isMiniAllyFlow) {
      // Mini-Ally 플로우에서는 세션 단계 업데이트
      updateMiniAllySessionStep('prd-result');
    }
    try {
      const stored = sessionStorage.getItem('journey_ctx');
      const ctx = stored ? JSON.parse(stored) : {};
      const payloadBase = {
        feature_area: 'prd',
        journey_id: journeyId || ctx?.journey_id,
        journey_origin: journeyOrigin || ctx?.journey_origin,
        journey_intent: journeyIntent || ctx?.journey_intent,
      } as const;
      track('prd_generate_started', payloadBase);
      // 완료 시점에서 성공 이벤트도 기록 (결과 페이지 이동 직전)
      track('prd_generate_succeeded', payloadBase);
    } catch {}
    router.push('/prd-result');
  };

  // 홈으로 나가기 핸들러 (경고 포함)
  const handleGoHome = () => {
    const hasProgress = Object.keys(answers).length > 0 || currentStep > 1;
    
    if (hasProgress) {
      setShowExitModal(true);
    } else {
      router.push('/');
    }
  };

  // 모달에서 확인 버튼 클릭
  const handleConfirmExit = () => {
    resetPRD();
    router.push('/');
  };

  // 모달에서 취소 버튼 클릭
  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // 세션 복구 핸들러
  const handleRestoreSession = () => {
    if (savedSession) {
      setIsMiniAllyFlow(true);
      setCurrentStep(4); // insight 단계로 이동
      setShowRestoreModal(false);
      
      // 세션에 저장된 전문가 답변이 있다면 복원
      if (savedSession.expertAnswers) {
        const convertedAnswers = savedSession.expertAnswers.map((answer: any) => ({
          ...answer,
          expert: answer.expert as ExpertType
        }));
        setExpertAnswers(convertedAnswers);
      }
    }
  };

  // 새로 시작 핸들러
  const handleStartNew = () => {
    clearMiniAllySession();
    setShowRestoreModal(false);
    setSavedSession(null);
    // 현재 페이지는 일반 폼 플로우로 진행
  };

  // 전문가 답변 변경 핸들러
  const handleExpertAnswersChange = (answers: any[]) => {
    setExpertAnswers(answers);
    
    // Mini-Ally 플로우인 경우 세션에도 저장
    if (isMiniAllyFlow) {
      updateMiniAllySessionAnswers(answers);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 bg-white z-10">
        <div className="h-1 bg-gray-100">
          <motion.div
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleGoHome}
        className="fixed top-4 custom:top-6 left-4 custom:left-6 z-20 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </motion.button>

      <div className="max-w-3xl mx-auto px-4 custom:px-6 pt-16 custom:pt-20 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-12">
              <motion.h1 
                className="text-2xl custom:text-4xl font-light mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentStepData.title}
              </motion.h1>
              <motion.p 
                className="text-base custom:text-lg text-muted-foreground font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentStepData.description}
              </motion.p>
            </div>

            <div className="space-y-8">
              {currentStepData.id === 'insight' ? (
                <>
                  {isGeneratingQuestions ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <MISOLoading 
                        message="MISO가 전문가들과 상의 중이에요"
                        subMessage="기획자, 개발자, 디자이너가 당신의 아이디어를 검토하고 있어요 💭"
                      />
                    </motion.div>
                  ) : expertQuestions ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <ExpertQuestions
                        questions={expertQuestions}
                        onAnswersChange={handleExpertAnswersChange}
                        onComplete={handleExpertQuestionsComplete}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 text-muted-foreground"
                    >
                      추가 인사이트를 준비하지 못했습니다.
                    </motion.div>
                  )}
                </>
              ) : (
                allQuestions.map((question, index) => {
                  const isAdditional = index >= currentStepData.questions.length;
                  
                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="group"
                    >
                      
                      <label className="block mb-3">
                        <span className="text-base font-medium">
                          {question.text}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                        {question.helpText && (
                          <span className="block text-sm text-muted-foreground mt-1">
                            {question.helpText}
                          </span>
                        )}
                      </label>
                      
                      <div className="space-y-4">
                        {question.type === QuestionType.TEXT ? (
                          <input
                            type="text"
                            value={answers[question.id] || ''}
                            onChange={(e) => updateAnswer(question.id, e.target.value)}
                            placeholder={question.placeholder}
                            className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent"
                          />
                        ) : (
                          <div className="space-y-3">
                            <textarea
                              value={answers[question.id] || ''}
                              onChange={(e) => updateAnswer(question.id, e.target.value)}
                              placeholder={question.placeholder}
                              rows={3}
                              className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none"
                            />
                            {!isAdditional && currentStepData.id !== 'insight' && (
                              <button
                                type="button"
                                onClick={() => updateAnswer(question.id, '잘 모르겠습니다')}
                                className="text-sm text-muted-foreground hover:text-black transition-colors"
                              >
                                잘 모르겠어요 →
                              </button>
                            )}
                          </div>
                        )}
                        
                      </div>
                    </motion.div>
                  );
                })
              )}
              
              {/* 힌트 UI - 질문들 아래에 표시 (3단계까지만) */}
              {step === 'hint' && currentStep <= 3 && currentStepData.id !== 'insight' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8"
                >
                  <div className="flex items-start gap-4">
                    {/* Mini Ally 아바타 */}
                    <div className="flex-shrink-0">
                      <img
                        src="/assets/mini_ally_default.png"
                        alt="Mini Ally"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    
                    {/* 말풍선 스타일 콘텐츠 */}
                    <div className="flex-1">
                      <div className="relative">
                        {/* 말풍선 꼬리 */}
                        <div className="absolute -left-2 top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-gray-50"></div>
                        
                        {/* 말풍선 본체 */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          {isLoadingHint ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></span>
                                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                </div>
                                <span className="text-sm text-gray-500">이전 대화를 분석하고 있어요</span>
                              </div>
                            </div>
                          ) : hint ? (
                            <div className="space-y-2">
                              {/* 제목과 버튼을 같은 줄에 배치 */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-gray-800">이런 답변은 어떤가요?</span>
                                <button
                                  onClick={(e) => {
                                    // 현재 단계의 첫 번째 질문 ID를 찾아서 해당 답변 업데이트
                                    if (currentStepData.questions.length > 0) {
                                      const firstQuestionId = currentStepData.questions[0].id;
                                      updateAnswer(firstQuestionId, hint);
                                      
                                      // 적용 완료 피드백
                                      const button = e.currentTarget;
                                      button.textContent = '✓ 적용됨';
                                      button.classList.add('bg-gray-100');
                                      setTimeout(() => {
                                        button.textContent = '답변에 적용하기';
                                        button.classList.remove('bg-gray-100');
                                      }, 1500);
                                    }
                                  }}
                                  className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-md border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                                >
                                  답변에 적용하기
                                </button>
                              </div>
                              
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {hint}
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              <p>{hint || '힌트를 생성하는 중 오류가 발생했습니다.'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 인사이트 단계에서 전문가 질문을 보여줄 때는 하단 네비게이션 숨기기 */}
        {!(currentStepData.id === 'insight' && expertQuestions && !isGeneratingQuestions) && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="max-w-3xl mx-auto px-4 custom:px-6 py-4 custom:py-6 flex items-center justify-between">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-2 text-base font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </button>

              <span className="text-sm text-muted-foreground">
                {currentStep} / {PRD_STEPS.length}
              </span>

              <motion.button
                onClick={handleNextClick}
                disabled={!canProceedToNextStep() || isGeneratingQuestions}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGeneratingQuestions ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    MISO 분석 중...
                  </>
                ) : (
                  <>
                    {currentStep === PRD_STEPS.length ? '완료' : '다음'}
                    {currentStep !== PRD_STEPS.length && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        title="홈으로 돌아가기"
        message="작성 중인 내용이 모두 사라집니다. 정말 홈으로 돌아가시겠습니까?"
        confirmText="홈으로 돌아가기"
        cancelText="계속 작성하기"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      {/* Session Restore Modal */}
      {savedSession && (
        <RestoreSessionModal
          open={showRestoreModal}
          onOpenChange={setShowRestoreModal}
          session={savedSession}
          onRestore={handleRestoreSession}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
}

export default function PRDGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <MISOLoading />
      </div>
    }>
      <PRDGeneratorContent />
    </Suspense>
  );
}