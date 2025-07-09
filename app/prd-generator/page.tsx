'use client';

import React, { useState, useEffect } from 'react';
import { usePRDContext } from '@/contexts/PRDContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PRD_STEPS } from '@/lib/prd-questions';
import { ArrowLeft, ArrowRight, X, Sparkles } from 'lucide-react';
import { QuestionType } from '@/types/prd.types';
import { useRouter } from 'next/navigation';
import { useAdditionalQuestions } from '@/hooks/useAdditionalQuestions';
import { ExpertQuestions } from '@/components/prd/ExpertQuestions';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import MISOLoading from '@/components/common/MISOLoading';

function PRDGeneratorContent() {
  const router = useRouter();
  const {
    currentStep,
    answers,
    additionalQuestions,
    expertQuestions,
    expertAnswers,
    updateAnswer,
    goToNextStep,
    goToPreviousStep,
    getCurrentStepData,
    canProceedToNextStep,
    setAdditionalQuestions,
    setExpertQuestions,
    setExpertAnswers,
    resetPRD,
  } = usePRDContext();

  const { generateFinalQuestions, isLoading } = useAdditionalQuestions();
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [hasFetchedFinalQuestions, setHasFetchedFinalQuestions] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const currentStepData = getCurrentStepData();

  // 마지막 단계(인사이트)에 도달했을 때 MISO API 호출
  useEffect(() => {
    if (currentStepData && currentStepData.id === 'insight' && !hasFetchedFinalQuestions && !expertQuestions) {
      setIsGeneratingQuestions(true);
      
      // 모든 답변을 수집
      generateFinalQuestions(answers).then((finalQuestions) => {
        console.log('MISO API Response:', finalQuestions); // 디버깅용
        setExpertQuestions(finalQuestions);
        setIsGeneratingQuestions(false);
        setHasFetchedFinalQuestions(true);
      });
    }
  }, [currentStepData, hasFetchedFinalQuestions, expertQuestions, answers, generateFinalQuestions, setExpertQuestions]);

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
        className="fixed top-6 left-6 z-20 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </motion.button>

      <div className="max-w-3xl mx-auto px-6 pt-20 pb-32">
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
                className="text-4xl font-light mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentStepData.title}
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground font-light"
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
                        onAnswersChange={setExpertAnswers}
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
                    </motion.div>
                  );
                })
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
            <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
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
    </div>
  );
}

export default function PRDGeneratorPage() {
  return <PRDGeneratorContent />;
}