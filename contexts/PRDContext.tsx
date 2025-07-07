'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { IPRDData, IPRDStep, IQuestion } from '@/types/prd.types';
import { PRD_STEPS } from '@/lib/prd-questions';

interface IPRDContext {
  currentStep: number;
  prdData: Partial<IPRDData>;
  answers: Record<string, string>;
  additionalQuestions: Record<string, IQuestion[]>;
  prdContent: string | null;
  
  setCurrentStep: (step: number) => void;
  updateAnswer: (questionId: string, value: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  getCurrentStepData: () => IPRDStep | undefined;
  canProceedToNextStep: () => boolean;
  resetPRD: () => void;
  setAdditionalQuestions: (stepId: string, questions: IQuestion[]) => void;
  setPRDContent: (content: string) => void;
  getAllQuestionsAndAnswers: () => Array<{ question: string; answer: string }>;
}

const PRDContext = createContext<IPRDContext | undefined>(undefined);

export const PRDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [prdData, setPrdData] = useState<Partial<IPRDData>>({});
  const [additionalQuestions, setAdditionalQuestionsState] = useState<Record<string, IQuestion[]>>({});
  const [prdContent, setPRDContent] = useState<string | null>(null);

  const updateAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep < PRD_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const getCurrentStepData = useCallback(() => {
    return PRD_STEPS.find(step => step.order === currentStep);
  }, [currentStep]);

  const canProceedToNextStep = useCallback(() => {
    const currentStepData = getCurrentStepData();
    if (!currentStepData) return false;

    // MISO 인사이트 단계는 항상 진행 가능
    if (currentStepData.id === 'insight') {
      return true;
    }

    return currentStepData.questions.every(question => {
      if (question.required) {
        const answer = answers[question.id];
        return answer && answer.trim().length > 0;
      }
      return true;
    });
  }, [getCurrentStepData, answers]);

  const setAdditionalQuestions = useCallback((stepId: string, questions: IQuestion[]) => {
    setAdditionalQuestionsState(prev => ({
      ...prev,
      [stepId]: questions,
    }));
  }, []);

  const getAllQuestionsAndAnswers = useCallback(() => {
    const allQuestionsAndAnswers: Array<{ question: string; answer: string }> = [];
    
    PRD_STEPS.forEach(step => {
      // 기본 질문들
      step.questions.forEach(q => {
        if (answers[q.id]) {
          allQuestionsAndAnswers.push({
            question: q.text,
            answer: answers[q.id]
          });
        }
      });
      
      // 추가 질문들
      const stepAdditionalQuestions = additionalQuestions[step.id] || [];
      stepAdditionalQuestions.forEach(q => {
        if (answers[q.id]) {
          allQuestionsAndAnswers.push({
            question: q.text,
            answer: answers[q.id]
          });
        }
      });
    });
    
    return allQuestionsAndAnswers;
  }, [answers, additionalQuestions]);

  const resetPRD = useCallback(() => {
    setCurrentStep(1);
    setAnswers({});
    setPrdData({});
    setAdditionalQuestionsState({});
    setPRDContent(null);
  }, []);

  const value: IPRDContext = {
    currentStep,
    prdData,
    answers,
    additionalQuestions,
    prdContent,
    setCurrentStep,
    updateAnswer,
    goToNextStep,
    goToPreviousStep,
    getCurrentStepData,
    canProceedToNextStep,
    resetPRD,
    setAdditionalQuestions,
    setPRDContent,
    getAllQuestionsAndAnswers,
  };

  return <PRDContext.Provider value={value}>{children}</PRDContext.Provider>;
};

export const usePRDContext = () => {
  const context = useContext(PRDContext);
  if (!context) {
    throw new Error('usePRDContext must be used within a PRDProvider');
  }
  return context;
};