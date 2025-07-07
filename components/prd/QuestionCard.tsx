import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IQuestion, QuestionType } from '@/types/prd.types';

interface QuestionCardProps {
  question: IQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, value, onChange }) => {
  const renderInput = () => {
    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
          />
        );
      case QuestionType.TEXTAREA:
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
            rows={4}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
        {question.helpText && (
          <CardDescription>{question.helpText}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {renderInput()}
      </CardContent>
    </Card>
  );
};