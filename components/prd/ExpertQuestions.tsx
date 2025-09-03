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
    name: 'Planner Kyle',
    englishName: 'Kyle',
    character: (
      <div className="w-24 h-24 flex items-center justify-center">
        <img 
          src="/assets/mini_kyle_default.png" 
          alt="Planner Kyle" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '',
    greeting: 'Hello! I am Kyle, the planner.',
    questionPrefix: [
      'I have a question from a business perspective.',
      'I want to confirm something for user value.',
      'I will ask from a strategic perspective.',
      'I want to ensure project success.'
    ]
  },
  designer: {
    name: 'Designer Heather',
    englishName: 'Heather',
    character: (
      <div className="w-24 h-24 flex items-center justify-center">
        <img 
          src="/assets/mini_heather_default.png" 
          alt="Designer Heather" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '',
    greeting: 'Hello! I am Heather, the designer.',
    questionPrefix: [
      'I have a question from the user experience perspective.',
      'I want to confirm something from a UI/UX perspective.',
      'I have a design consideration to ask about.',
      'I have a question about the user interface.'
    ]
  },
  developer: {
    name: 'Developer Bob',
    englishName: 'Bob',
    character: (
      <div className="w-24 h-24 flex items-center justify-center">
        <img 
          src="/assets/mini_bob_default.png" 
          alt="Developer Bob" 
          className="w-full h-full object-contain"
        />
      </div>
    ),
    color: 'border-gray-200 bg-white',
    description: '',
    greeting: 'Hello! I am Bob, the developer.',
    questionPrefix: [
      'I want to confirm a technical area.',
      'I have a question from an implementation perspective.',
      'I would like to ask about development considerations.',
      'I have a question about the system architecture.'
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
              {expert.greeting} To better understand the project, I have a few questions.
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
                        <label className="block mb-4">
                          <span className="text-base custom:text-lg font-medium text-gray-900 leading-relaxed">
                            {question}
                          </span>
                        </label>
                        <textarea
                          value={answers[questionId] || ''}
                          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                          placeholder="Please enter your answer..."
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
        <h1 className="text-2xl custom:text-4xl font-light mb-4">Expert Additional Questions</h1>
        <p className="text-base custom:text-lg text-muted-foreground font-light">
          Three experts prepared additional questions for more concrete ideas.
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
            {answeredQuestions}/{totalQuestions} answers completed
          </span>
          <button
            onClick={onComplete}
            disabled={!isComplete}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Generate PRD
          </button>
        </div>
      </div>
    </div>
  );
};