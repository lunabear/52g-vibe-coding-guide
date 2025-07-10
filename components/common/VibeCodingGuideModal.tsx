'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check, ExternalLink } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/links';

interface VibeCodingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function VibeCodingGuideModal({ isOpen, onClose, onDownload }: VibeCodingGuideModalProps) {
  const [copied, setCopied] = useState(false);

  const promptText = `Source의 파일들은 각 기획, 디자인, 개발에 대한 전문가의 지침입니다. 
이 문서들을 기반으로 최초에 작업 계획을 세우고 프로덕션 수준으로 개발을 진행해주세요.
문서의 모든 내용을 누락 없이 참고하여 구현해주세요.

각 문서의 역할:
- 기획자 Kyle의 PRD: 프로덕트 요구사항과 비즈니스 로직
- 디자이너 Heather의 UI/UX 설계: 화면별 디자인과 사용자 경험
- 개발자 Bob의 개발 작업 task 설계: 기술적 구현 계획과 작업 순서`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadAndClose = () => {
    onDownload();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal text-gray-900">
            바이브코딩에 적용하기
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-3 leading-relaxed">
            생성된 프로젝트 문서를 바이브코딩에서 활용하는 방법을 안내합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-12 mt-8">
          {/* Step 1: 기본 지침 복사 */}
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-normal text-gray-400">STEP 1</span>
              <h3 className="text-lg font-normal text-gray-900">v0의 Introduction에 기본 지침 추가</h3>
            </div>
            <div className="ml-16">
              <div className="relative">
                <div className="bg-gray-50 rounded-lg p-6 pr-14">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
{promptText}
                  </pre>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-6 right-6 p-2 hover:bg-white rounded-md transition-colors"
                  title="복사하기"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 leading-relaxed">
                  위 내용을 복사하여 v0의 Interaction → Introduction 섹션에 붙여넣으세요.
                </p>
                <a
                  href={EXTERNAL_LINKS.V0_INTRODUCTION_GUIDE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  자세한 방법 보러가기
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Step 2: 파일 다운로드 */}
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-normal text-gray-400">STEP 2</span>
              <h3 className="text-lg font-normal text-gray-900">프로젝트 문서 다운로드 및 업로드</h3>
            </div>
            <div className="ml-16">
              <div className="flex items-start gap-6">
                <Button
                  onClick={handleDownloadAndClose}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ZIP 파일 다운로드
                </Button>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    PRD, UI/UX, 개발 작업 문서가 포함된 ZIP 파일을 다운로드합니다.
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    다운로드한 파일을 v0의 Source 섹션에 업로드해주세요.
                  </p>
                  <a
                    href={EXTERNAL_LINKS.V0_DOCUMENT_UPLOAD_GUIDE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    프로젝트 문서 다운로드 및 업로드 가이드
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: 시작하기 */}
          <div className="relative">
            {/* Background Image - 우측 하단에 크게 배치 */}
            <div className="absolute right-8 -bottom-[90px] pointer-events-none">
              <img 
                src="/assets/coach_success.png" 
                alt="" 
                className="w-64 h-64 object-contain"
              />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-sm font-normal text-gray-400">STEP 3</span>
                <h3 className="text-lg font-normal text-gray-900">바이브코딩 시작!</h3>
              </div>
              <div className="ml-16">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    여러분의 상상을 현실로 만들어보세요!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-8 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 border-gray-200"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}