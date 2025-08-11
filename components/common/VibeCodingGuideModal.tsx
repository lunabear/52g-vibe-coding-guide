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
import { Copy, Download, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/links';
import { generateVibeCodingPrompt } from '@/lib/prompts/vibe-coding-guide';

interface VibeCodingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (includeMiso: boolean, misoType?: 'chatflow' | 'workflow' | 'both') => void;
}

export function VibeCodingGuideModal({ isOpen, onClose, onDownload }: VibeCodingGuideModalProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [includeMiso, setIncludeMiso] = useState(false);
  const [misoType, setMisoType] = useState<'chatflow' | 'workflow' | 'both'>('chatflow');

  const promptText = generateVibeCodingPrompt(includeMiso);

  const handleCopyPrompt = async () => {
    try {
      // 최신 브라우저의 Clipboard API 사용
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promptText);
      } else {
        // 폴백: 구형 브라우저나 비보안 컨텍스트에서 사용
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // 사용자에게 수동 복사 안내
      alert('복사에 실패했습니다. 텍스트를 직접 선택하여 복사해주세요.');
    }
  };

  const handleDownloadAndClose = () => {
    onDownload(includeMiso, includeMiso ? misoType : undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal text-gray-900">
            바이브코딩에 적용하기
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-3 leading-relaxed">
            생성된 프로젝트 문서를 바이브코딩에서 활용하는 방법을 안내합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-12 mt-8">
          {/* Step 1: MISO API 연동 여부 선택 */}
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-normal text-gray-400">STEP 1</span>
              <h3 className="text-lg font-normal text-gray-900">MISO API 연동이 필요하신가요?</h3>
            </div>
            <div className="ml-16">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="radio"
                    id="no-miso"
                    name="miso-option"
                    checked={!includeMiso}
                    onChange={() => setIncludeMiso(false)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="no-miso" className="text-gray-700 cursor-pointer">아니요, 필요하지 않습니다</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="yes-miso"
                    name="miso-option"
                    checked={includeMiso}
                    onChange={() => setIncludeMiso(true)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="yes-miso" className="text-gray-700 cursor-pointer">네, MISO API를 사용합니다</label>
                </div>
              </div>
              
              {includeMiso && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-3">어떤 방식의 MISO API를 사용하시나요?</p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <input
                        type="radio"
                        id="chatflow"
                        name="miso-type"
                        value="chatflow"
                        checked={misoType === 'chatflow'}
                        onChange={(e) => setMisoType(e.target.value as any)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 mt-0.5"
                      />
                      <div>
                        <label htmlFor="chatflow" className="text-gray-700 cursor-pointer">대화형 (Agent/Chatflow)</label>
                        <p className="text-xs text-gray-500 mt-1">채팅봇, 대화형 AI 기능을 구현할 때 사용합니다</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <input
                        type="radio"
                        id="workflow"
                        name="miso-type"
                        value="workflow"
                        checked={misoType === 'workflow'}
                        onChange={(e) => setMisoType(e.target.value as any)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 mt-0.5"
                      />
                      <div>
                        <label htmlFor="workflow" className="text-gray-700 cursor-pointer">워크플로우 (Workflow)</label>
                        <p className="text-xs text-gray-500 mt-1">단계별 자동화, 데이터 처리 파이프라인을 구현할 때 사용합니다</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <input
                        type="radio"
                        id="both"
                        name="miso-type"
                        value="both"
                        checked={misoType === 'both'}
                        onChange={(e) => setMisoType(e.target.value as any)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 mt-0.5"
                      />
                      <div>
                        <label htmlFor="both" className="text-gray-700 cursor-pointer">둘 다 필요</label>
                        <p className="text-xs text-gray-500 mt-1">복합적인 기능을 구현할 때 사용합니다</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: 기본 지침 복사 */}
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-normal text-gray-400">STEP 2</span>
              <h3 className="text-lg font-normal text-gray-900">v0의 Introduction에 기본 지침 추가</h3>
            </div>
            <div className="ml-16">
              {/* 통합된 기본 지침 카드 */}
              <div className="border border-gray-200 rounded-lg">
                {/* 통합 헤더 - 복사 버튼과 드롭다운 */}
                <div 
                  className="flex items-center justify-between p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">바이브코딩 지침</h4>
                    <p className="text-sm text-blue-700">
                      바이브코딩에 붙여넣을 지침을 복사하거나 상세 내용을 확인하세요.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          복사하기
                        </>
                      )}
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
{promptText}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600 leading-relaxed">
                  &quot;복사하기&quot; 버튼을 눌러 기본 지침을 복사한 후, v0의 Interaction → Introduction 섹션에 붙여넣으세요.
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

          {/* Step 3: 파일 다운로드 */}
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-normal text-gray-400">STEP 3</span>
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
                  {includeMiso && (
                    <p className="text-sm text-gray-600 mb-1">
                      {misoType === 'chatflow' && '✓ MISO Agent/Chatflow API 가이드 포함'}
                      {misoType === 'workflow' && '✓ MISO Workflow API 가이드 포함'}
                      {misoType === 'both' && '✓ MISO Agent/Chatflow 및 Workflow API 가이드 포함'}
                    </p>
                  )}
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

          {/* Step 4: 시작하기 */}
          <div className="relative min-h-[120px] overflow-hidden">
            {/* Background Image - 우측 하단에 크게 배치 */}
            <div className="absolute right-8 bottom-0 pointer-events-none">
              <img 
                src="/assets/coach_success.png" 
                alt="" 
                className="w-40 h-40 object-contain opacity-80"
              />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-sm font-normal text-gray-400">STEP 4</span>
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