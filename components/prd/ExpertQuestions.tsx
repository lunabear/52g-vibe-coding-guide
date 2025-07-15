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
    name: '기획자 Kyle',
    englishName: 'Kyle',
    character: (
      <div className="w-24 h-24 flex items-center justify-center">
        <img 
          src="/assets/mini_kyle_default.png" 
          alt="기획자 Kyle" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '비즈니스 관점에서 질문드려요',
    greeting: '안녕하세요! 기획자 Kyle입니다.',
    questionPrefix: [
      '이 부분에 대해서 좀 더 자세히 여쭤볼게요.',
      '비즈니스 관점에서 궁금한 점이 있어요.',
      '사용자 가치를 위해 확인하고 싶은 부분이 있어요.',
      '전략적인 관점에서 질문드릴게요.'
    ]
  },
  designer: {
    name: '디자이너 Heather',
    englishName: 'Heather',
    character: (
      <div className="w-24 h-24 flex items-center justify-center">
        <img 
          src="/assets/mini_heather_default.png" 
          alt="디자이너 Heather" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '사용자 경험 관점에서 질문드려요',
    greeting: '안녕하세요! 디자이너 Heather입니다.',
    questionPrefix: [
      '사용자 경험 측면에서 궁금한 점이 있어요.',
      'UI/UX 관점에서 확인하고 싶은 부분이 있어요.',
      '디자인적으로 고려해야 할 부분에 대해 여쭤볼게요.',
      '사용자 인터페이스에 대해 질문드려요.'
    ]
  },
  developer: {
    name: '개발자 Bob',
    englishName: 'Bob',
    character: (
      <div className="w-24 h-24 flex items-center justify-center">
        <img 
          src="/assets/mini_bob_default.png" 
          alt="개발자 Bob" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '기술적 관점에서 질문드려요',
    greeting: '안녕하세요! 개발자 Bob입니다.',
    questionPrefix: [
      '기술적인 부분에 대해 확인하고 싶어요.',
      '구현 관점에서 궁금한 점이 있어요.',
      '개발 측면에서 고려해야 할 부분에 대해 여쭤볼게요.',
      '시스템 아키텍처 관련해서 질문드려요.'
    ]
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
      <div key={expertType} className="mb-16">
        <div className="flex flex-col custom:flex-row items-start gap-4 custom:gap-6 mb-8 custom:mb-10">
          {expert.character}
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-2">
              <div className="text-xl custom:text-2xl font-medium text-gray-900">{expert.name}</div>
              <div className="text-sm custom:text-base text-muted-foreground font-light">{expert.description}</div>
            </div>
            <div className="text-sm custom:text-base text-gray-600 font-light mb-6 custom:mb-8">
              {expert.greeting} 프로젝트를 더 잘 이해하기 위해 몇 가지 질문드릴게요.
            </div>
            
            <div className="space-y-10">
              {expertQuestions.map((question, index) => {
                const questionId = `${expertType}-${index}`;
                const prefixIndex = index % expert.questionPrefix.length;
                return (
                  <div key={questionId} className="group">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 text-sm text-gray-500 font-light">
                          {expert.questionPrefix[prefixIndex]}
                        </div>
                        <label className="block mb-4">
                          <span className="text-base custom:text-lg font-medium text-gray-900 leading-relaxed">
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
        <h1 className="text-2xl custom:text-4xl font-light mb-4">전문가 추가 질문</h1>
        <p className="text-base custom:text-lg text-muted-foreground font-light">
          세 명의 전문가가 더 구체적인 아이디어를 위해 추가 질문을 준비했어요
        </p>
      </div>

      <div>
        {renderExpertSection(ExpertType.PLANNER)}
        {renderExpertSection(ExpertType.DESIGNER)}
        {renderExpertSection(ExpertType.DEVELOPER)}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 custom:px-6 py-4 custom:py-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {answeredQuestions}/{totalQuestions} 질문 답변 완료
          </span>
          <button
            onClick={onComplete}
            disabled={!isComplete}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            아이디어 구체화하기
          </button>
        </div>
      </div>
    </div>
  );
};