import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  canProceed,
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        이전
      </Button>

      <span className="text-sm text-gray-600">
        {currentStep} / {totalSteps}
      </span>

      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="flex items-center gap-2"
      >
        {isLastStep ? '완료' : '다음'}
        {!isLastStep && <ChevronRight className="w-4 h-4" />}
      </Button>
    </div>
  );
};