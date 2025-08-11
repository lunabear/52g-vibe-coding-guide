'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MisoSkipConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MisoSkipConfirmModal({ isOpen, onClose, onConfirm, onCancel }: MisoSkipConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900 text-center">
            MISO 설계를 건너뛰시겠어요?
          </DialogTitle>
          <DialogDescription className="text-center mt-4">
            <div className="text-sm text-gray-600 leading-relaxed">
              MISO 앱 설계를 먼저 완료하시면<br />
              더 완성도 높은 프로젝트를 만들 수 있어요!
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            MISO 설계하기
          </Button>
          <Button 
            onClick={handleConfirm}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          >
            바로 넘어가기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}