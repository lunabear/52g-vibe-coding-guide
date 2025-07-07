import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { IExpertQuestions, IExpertAnswer, ExpertType } from '@/types/prd.types';

interface ExpertQuestionsProps {
  questions: IExpertQuestions;
  onAnswersChange: (answers: IExpertAnswer[]) => void;
  onComplete: () => void;
}

const expertInfo = {
  planner: {
    name: '기획자',
    character: (
      <div className="w-16 h-16 flex items-center justify-center">
        <img 
          src="/assets/charactor_planner.png" 
          alt="기획자" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '비즈니스 관점에서 질문드려요'
  },
  designer: {
    name: '디자이너',
    character: (
      <div className="w-16 h-16 flex items-center justify-center">
        <img 
          src="/assets/charactor_designer.png" 
          alt="디자이너" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '사용자 경험 관점에서 질문드려요'
  },
  developer: {
    name: '개발자',
    character: (
      <div className="w-16 h-16 flex items-center justify-center">
        <img 
          src="/assets/charactor_developer.png" 
          alt="개발자" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '기술적 관점에서 질문드려요'
  }
};

export const ExpertQuestions: React.FC<ExpertQuestionsProps> = ({
  questions,
  onAnswersChange,
  onComplete,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Convert to IExpertAnswer format
    const expertAnswers: IExpertAnswer[] = [];
    Object.entries(newAnswers).forEach(([id, answer]) => {
      const [expertType, questionIndex] = id.split('-');
      const expert = expertType as ExpertType;
      const index = parseInt(questionIndex);
      
      if (questions[expert] && questions[expert][index]) {
        expertAnswers.push({
          question: questions[expert][index],
          answer,
          expert,
        });
      }
    });
    
    onAnswersChange(expertAnswers);
  };

  const renderExpertSection = (expertType: ExpertType) => {
    const expert = expertInfo[expertType];
    const expertQuestions = questions[expertType];
    
    if (!expertQuestions || expertQuestions.length === 0) {
      return null;
    }

    return (
      <div key={expertType} className="mb-12">
        <div className="flex items-center gap-4 mb-8">
          {expert.character}
          <div>
            <div className="text-xl font-light text-gray-900">{expert.name}</div>
            <div className="text-sm text-muted-foreground font-light">{expert.description}</div>
          </div>
        </div>
        
        <div className="space-y-8">
          {expertQuestions.map((question, index) => {
            const questionId = `${expertType}-${index}`;
            return (
              <div key={questionId} className="group">
                <label className="block mb-3">
                  <span className="text-base font-medium">
                    {question}
                  </span>
                </label>
                <textarea
                  value={answers[questionId] || ''}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  placeholder="답변을 입력해주세요..."
                  rows={3}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalQuestions = Object.values(questions).flat().length;
  const answeredQuestions = Object.values(answers).filter(answer => answer.trim().length > 0).length;
  const isComplete = answeredQuestions > 0; // At least one question answered

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-light mb-4">전문가 추가 질문</h1>
        <p className="text-lg text-muted-foreground font-light">
          세 명의 전문가가 더 나은 PRD를 위해 추가 질문을 준비했어요
        </p>
      </div>

      <div>
        {renderExpertSection(ExpertType.PLANNER)}
        {renderExpertSection(ExpertType.DESIGNER)}
        {renderExpertSection(ExpertType.DEVELOPER)}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {answeredQuestions}/{totalQuestions} 질문 답변 완료
          </span>
          <button
            onClick={onComplete}
            disabled={!isComplete}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            PRD 생성하기
          </button>
        </div>
      </div>
    </div>
  );
};