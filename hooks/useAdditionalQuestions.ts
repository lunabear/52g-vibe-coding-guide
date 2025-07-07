import { useState, useCallback } from 'react';
import { misoAPI } from '@/lib/miso-api';
import { IQuestion, QuestionType } from '@/types/prd.types';

export const useAdditionalQuestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFinalQuestions = useCallback(
    async (allAnswers: Record<string, string>): Promise<IQuestion[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const questionTexts = await misoAPI.generateFinalQuestions(allAnswers);
        
        // Convert string array to IQuestion array
        const additionalQuestions: IQuestion[] = questionTexts.map((text, index) => ({
          id: `final-additional-${index + 1}`,
          text,
          type: QuestionType.TEXTAREA,
          required: false,
          placeholder: '추가 정보를 입력해주세요',
          helpText: 'MISO가 종합 분석 후 추천하는 질문입니다',
        }));

        return additionalQuestions;
      } catch (err) {
        setError(err instanceof Error ? err.message : '추가 질문 생성 중 오류가 발생했습니다');
        return [];
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