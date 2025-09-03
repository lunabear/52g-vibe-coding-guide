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
        return 'Mini Ally summary → Expert questions';
      case 'prd-result':
        return 'Mini Ally summary → Expert questions → PRD completed';
      default:
        return 'Mini Ally summary';
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
            We found your previous work
          </DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed mt-2">
            You have unsaved progress from {timeAgo}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Project Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Project Summary</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Solution: </span>
                <span className="text-gray-800">
                  {session.projectData.solutionNameIdea || 'Untitled'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Target user: </span>
                <span className="text-gray-800">
                  {session.projectData.personaProfile?.slice(0, 50) || 'N/A'}
                  {session.projectData.personaProfile && session.projectData.personaProfile.length > 50 && '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{getProgressPercentage(session.step)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(session.step)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              You progressed up to: {getStepDescription(session.step)}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Saved at: {new Date(session.timestamp).toLocaleString('en-US')}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onStartNew}
            className="flex items-center gap-2 text-gray-700 border-gray-300"
          >
            <Plus className="w-4 h-4" />
            Start new
          </Button>
          <Button
            onClick={onRestore}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}