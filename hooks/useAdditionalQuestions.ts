import { useState, useCallback } from 'react';
import { misoAPI } from '@/lib/miso-api';
import { IExpertQuestions, IExpertAnswer, ExpertType } from '@/types/prd.types';

export const useAdditionalQuestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFinalQuestions = useCallback(
    async (allAnswers: Record<string, string>): Promise<IExpertQuestions> => {
      setIsLoading(true);
      setError(null);

      try {
        const expertQuestions = await misoAPI.generateFinalQuestions(allAnswers);
        return expertQuestions;
      } catch (err) {
        setError(err instanceof Error ? err.message : '추가 질문 생성 중 오류가 발생했습니다');
        return { planner: [], designer: [], developer: [] };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    generateFinalQuestions,
    isLoading,
    error,
  };
};