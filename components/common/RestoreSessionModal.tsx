import React from 'react';
import { Clock, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MiniAllySession, getSessionTimeAgo } from '@/lib/mini-ally-utils';

interface RestoreSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: MiniAllySession;
  onRestore: () => void;
  onStartNew: () => void;
}

export function RestoreSessionModal({
  open,
  onOpenChange,
  session,
  onRestore,
  onStartNew,
}: RestoreSessionModalProps) {
  const timeAgo = getSessionTimeAgo(session);
  
  const getStepDescription = (step: string) => {
    switch (step) {
      case 'expert-questions':
        return 'Mini-Ally 대화 정리 → 전문가 질문 단계';
      case 'prd-result':
        return 'Mini-Ally 대화 정리 → 전문가 질문 → PRD 생성 완료';
      default:
        return 'Mini-Ally 대화 정리';
    }
  };

  const getProgressPercentage = (step: string) => {
    switch (step) {
      case 'expert-questions':
        return 60;
      case 'prd-result':
        return 100;
      default:
        return 30;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-gray-900 text-lg">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            이전 작업을 발견했습니다
          </DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed mt-2">
            {timeAgo}에 작업하던 내용이 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* 프로젝트 정보 요약 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">프로젝트 요약</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">솔루션: </span>
                <span className="text-gray-800">
                  {session.projectData.solutionNameIdea || '이름 미정'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">타겟 사용자: </span>
                <span className="text-gray-800">
                  {session.projectData.personaProfile?.slice(0, 50) || '미작성'}
                  {session.projectData.personaProfile && session.projectData.personaProfile.length > 50 && '...'}
                </span>
              </div>
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">진행 상황</span>
              <span className="text-sm text-gray-500">{getProgressPercentage(session.step)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(session.step)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {getStepDescription(session.step)}까지 진행하셨습니다.
            </p>
          </div>

          {/* 시간 정보 */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>저장 시간: {new Date(session.timestamp).toLocaleString('ko-KR')}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onStartNew}
            className="flex items-center gap-2 text-gray-700 border-gray-300"
          >
            <Plus className="w-4 h-4" />
            새로 시작하기
          </Button>
          <Button
            onClick={onRestore}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            이어서 계속하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}