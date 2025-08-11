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
  defaultMisoType?: 'chatflow' | 'workflow' | 'both';
}

export function VibeCodingGuideModal({ isOpen, onClose, onDownload, defaultMisoType }: VibeCodingGuideModalProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [includeMiso, setIncludeMiso] = useState(!!defaultMisoType);
  const [misoType, setMisoType] = useState<'chatflow' | 'workflow' | 'both'>(defaultMisoType || 'chatflow');

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-2xl font-light text-gray-900">
            바이브코딩에 적용하기
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2 leading-relaxed font-light">
            생성된 프로젝트 문서를 바이브코딩에서 활용하는 방법을 안내합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-8">
          {/* Step 1: MISO API 연동 여부 선택 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <h3 className="text-lg font-light text-gray-900">MISO API 연동이 필요하신가요?</h3>
            </div>
            <div className="ml-11 space-y-3">
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  !includeMiso ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setIncludeMiso(false)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !includeMiso ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {!includeMiso && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div>
                    <div className="text-gray-700 font-light">아니요, 필요하지 않습니다</div>
                  </div>
                </div>
              </div>
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  includeMiso ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setIncludeMiso(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    includeMiso ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {includeMiso && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div>
                    <div className="text-gray-700 font-light">네, MISO API를 사용합니다</div>
                  </div>
                </div>
              </div>
              
              {includeMiso && (
                <div className="ml-8 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-3">어떤 방식의 MISO API를 사용하시나요?</p>
                  <div className="space-y-3">
                    <div 
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        misoType === 'chatflow' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setMisoType('chatflow')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          misoType === 'chatflow' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {misoType === 'chatflow' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <label className="text-gray-700 cursor-pointer font-light">대화형 (Agent/Chatflow)</label>
                          <p className="text-xs text-gray-500 mt-1 font-light">채팅봇, 대화형 AI 기능을 구현할 때 사용합니다</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        misoType === 'workflow' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setMisoType('workflow')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          misoType === 'workflow' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {misoType === 'workflow' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <label className="text-gray-700 cursor-pointer font-light">워크플로우 (Workflow)</label>
                          <p className="text-xs text-gray-500 mt-1 font-light">단계별 자동화, 데이터 처리 파이프라인을 구현할 때 사용합니다</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        misoType === 'both' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setMisoType('both')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          misoType === 'both' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {misoType === 'both' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <label className="text-gray-700 cursor-pointer font-light">둘 다 필요</label>
                          <p className="text-xs text-gray-500 mt-1 font-light">복합적인 기능을 구현할 때 사용합니다</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: 기본 지침 복사 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                2
              </div>
              <h3 className="text-lg font-light text-gray-900">바이브코딩 지침 설정하기</h3>
            </div>
            <div className="ml-11">
              <p className="text-sm text-gray-600 leading-relaxed font-light mb-4">
                v0의 Introduction에 추가할 지침을 복사해주세요
              </p>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">바이브코딩 지침</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleCopyPrompt}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            복사하기
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 px-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4 bg-white max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
{promptText}
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed font-light mb-2">
                  복사한 지침을 v0의 <span className="font-medium">Introduction</span> 섹션에 붙여넣어주세요
                </p>
                <a
                  href={EXTERNAL_LINKS.V0_INTRODUCTION_GUIDE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors font-light"
                >
                  자세한 방법 보기
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Step 3: 파일 다운로드 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                3
              </div>
              <h3 className="text-lg font-light text-gray-900">프로젝트 문서 업로드하기</h3>
            </div>
            <div className="ml-11">
              <p className="text-sm text-gray-600 leading-relaxed font-light mb-4">
                생성된 문서들을 v0에서 참조할 수 있도록 업로드해주세요
              </p>
              
              <div className="border border-gray-200 rounded-xl p-6 bg-white">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-shrink-0">
                    <Button
                      onClick={handleDownloadAndClose}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      문서 다운로드
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">포함된 문서</h4>
                        <div className="space-y-1 text-sm text-gray-600 font-light">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>프로젝트 기획서</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>화면 디자인 가이드</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>개발 가이드</span>
                          </div>
                          {includeMiso && (
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              <span className="text-blue-700 font-medium">
                                {misoType === 'chatflow' && 'MISO Agent/Chatflow API 가이드'}
                                {misoType === 'workflow' && 'MISO Workflow API 가이드'}
                                {misoType === 'both' && 'MISO Agent/Chatflow 및 Workflow API 가이드'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 font-light">
                            <span className="font-medium">1.</span> 다운로드한 ZIP 파일의 <span className="font-medium">압축을 해제</span>해주세요
                          </p>
                          <p className="text-sm text-gray-600 font-light">
                            <span className="font-medium">2.</span> 압축 해제된 파일들을 v0의 <span className="font-medium">Source</span> 섹션에 업로드해주세요
                          </p>
                        </div>
                        <a
                          href={EXTERNAL_LINKS.V0_DOCUMENT_UPLOAD_GUIDE}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors font-light mt-3"
                        >
                          업로드 방법 보기
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: 시작하기 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                4
              </div>
              <h3 className="text-lg font-light text-gray-900">바이브코딩 시작!</h3>
            </div>
            <div className="ml-11">
              <p className="text-sm text-gray-600 leading-relaxed font-light">
                이제 모든 준비가 완료되었습니다. 바이브코딩으로 상상을 현실로 만들어보세요!
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 border-gray-200 font-light px-6 py-2"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}