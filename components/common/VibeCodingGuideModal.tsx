'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Upload, FileText, MousePointer, Send } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/links';

interface VibeCodingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (includeMiso: boolean, misoType?: 'chatflow' | 'workflow' | 'both') => void;
  defaultMisoType?: 'chatflow' | 'workflow' | 'both';
}

export function VibeCodingGuideModal({ isOpen, onClose, onDownload, defaultMisoType }: VibeCodingGuideModalProps) {
  const [includeMiso, setIncludeMiso] = useState(!!defaultMisoType);
  const [misoType, setMisoType] = useState<'chatflow' | 'workflow' | 'both'>(defaultMisoType || 'chatflow');
  
  // 애니메이션 상태
  const [showMouse, setShowMouse] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [showFiles, setShowFiles] = useState<number[]>([]);
  const [typedText, setTypedText] = useState('');
  const [isSendButtonPressed, setIsSendButtonPressed] = useState(false);
  const [uploadAreaActive, setUploadAreaActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fullText = '첨부한 지침에 따라 구현해줘';
  const textRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  
  // 파일 목록 (애니메이션에 PRD 문서만 포함)
  const fileList = [
    { name: 'PRD 문서.md', color: 'blue', icon: FileText },
  ];
  
  // 애니메이션 시퀀스
  useEffect(() => {
    if (isOpen) {
      const timeouts: NodeJS.Timeout[] = [];
      
      // 1. 모달 오픈과 동시에 마우스 표시
      setShowMouse(true);
      
      // 2. 2초 후 업로드 영역으로 이동 (자연스러운 곡선 이동)
      timeouts.push(setTimeout(() => {
        setMousePosition({ x: 50, y: 35 });
        setUploadAreaActive(true);
      }, 2000));
      
      // 3. 파일들 순차 첨부 (각 클릭마다 업로드 영역 하이라이트)
      fileList.forEach((_, index) => {
        timeouts.push(setTimeout(() => {
          setIsClicking(true);
          setTimeout(() => {
            setIsClicking(false);
            setShowFiles(prev => [...prev, index]);
            // 파일 추가 시 약간의 바운스 효과
            setUploadAreaActive(false);
            setTimeout(() => setUploadAreaActive(true), 50);
          }, 200);
        }, 2800 + index * 700));
      });
      
      // 4. 입력창으로 이동 (부드러운 이동)
      const moveToInputDelay = 2800 + fileList.length * 700 + 800;
      timeouts.push(setTimeout(() => {
        setUploadAreaActive(false);
        setMousePosition({ x: 25, y: 80 });
      }, moveToInputDelay));
      
      // 5. 타이핑 시작
      timeouts.push(setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 150);
        setIsTyping(true);
        
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i < fullText.length) {
            setTypedText(fullText.slice(0, i + 1));
            i++;
          } else {
            clearInterval(typeInterval);
            setIsTyping(false);
            
            // 0.5초 대기 후 전송 버튼으로 이동
            setTimeout(() => {
              setMousePosition({ x: 89, y: 80 });
            }, 500);
            
            // 전송 버튼 클릭 (더 리얼한 효과)
            setTimeout(() => {
              setIsClicking(true);
              setIsSendButtonPressed(true);
              setTimeout(() => {
                setIsClicking(false);
                // 버튼 눌림 효과 유지
                setTimeout(() => setIsSendButtonPressed(false), 400);
              }, 250);
            }, 1200);
          }
        }, 90); // 더 자연스러운 타이핑 속도
        
        timeouts.push(typeInterval as any);
      }, moveToInputDelay + 1000));
      
      return () => timeouts.forEach(clearTimeout);
    } else {
      // 리셋
      setShowMouse(false);
      setMousePosition({ x: 50, y: 50 });
      setIsClicking(false);
      setShowFiles([]);
      setTypedText('');
      setIsSendButtonPressed(false);
      setUploadAreaActive(false);
      setIsTyping(false);
    }
  }, [isOpen, includeMiso]);


  const handleDownloadOnly = () => {
    onDownload(includeMiso, includeMiso ? misoType : undefined);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce 0.4s ease-in-out;
        }
        .animate-glow {
          animation: glow 1s ease-in-out infinite;
        }
        .mouse-cursor {
          position: absolute;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 10;
          pointer-events: none;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        .mouse-cursor.clicking {
          transform: scale(0.8);
          transition: transform 0.15s ease-out;
        }
        .typing-cursor {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center">
              <img 
                src="/assets/mini_bob_default.png" 
                alt="개발자 Bob"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-light text-gray-900">
                바이브코딩에 적용하기
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1 leading-relaxed font-light">
                생성된 프로젝트 문서를 바이브코딩에서 활용하는 방법을 안내합니다
              </DialogDescription>
            </div>
          </div>
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

          {/* Step 2: 파일 다운로드 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                2
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
                      onClick={handleDownloadOnly}
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
                            <span>PRD 문서</span>
                          </div>
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

          {/* Step 3: 시작하기 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                3
              </div>
              <h3 className="text-lg font-light text-gray-900">바이브코딩 시작!</h3>
            </div>
            <div className="ml-11">
              <p className="text-sm text-gray-600 leading-relaxed font-light mb-4">
                이제 모든 준비가 완료되었습니다. v0에서 파일을 업로드하고 원하는 기능을 설명해보세요!
              </p>
              
              {/* V0 스타일 시뮬레이션 */}
              <div className="border border-gray-200 rounded-xl bg-white p-6 relative overflow-hidden">
                {/* 마우스 커서 */}
                {showMouse && (
                  <div 
                    className={`mouse-cursor ${isClicking ? 'clicking' : ''}`}
                    style={{
                      left: `${mousePosition.x}%`,
                      top: `${mousePosition.y}%`,
                    }}
                  >
                    <MousePointer className="w-4 h-4 text-gray-800 drop-shadow-sm" />
                  </div>
                )}

                {/* 파일 업로드 영역 */}
                <div className={`mb-4 p-4 border-2 border-dashed rounded-lg text-center transition-all duration-300 ${
                  uploadAreaActive 
                    ? 'border-blue-400 bg-blue-50/50 animate-glow' 
                    : 'border-gray-200 bg-gray-50/30'
                }`}>
                  <Upload className={`w-5 h-5 mx-auto mb-2 transition-colors ${
                    uploadAreaActive ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-xs transition-colors ${
                    uploadAreaActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>문서 업로드</p>
                  
                  {/* 동적으로 나타나는 파일들 */}
                  {showFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {showFiles.map((fileIndex) => {
                        const file = fileList[fileIndex];
                        const colorClasses: Record<'blue' | 'green' | 'purple', string> = {
                          blue: 'bg-blue-50 border-blue-200 text-blue-700',
                          green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                          purple: 'bg-violet-50 border-violet-200 text-violet-700'
                        };
                        const IconComponent = file.icon;
                        
                        return (
                          <div
                            key={fileIndex}
                            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs animate-fade-in animate-bounce-subtle ${colorClasses[file.color as 'blue']}`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span className="font-medium">{file.name}</span>
                            <div className="ml-auto text-xs opacity-60">업로드 완료</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 채팅 입력창 */}
                <div className={`border-2 rounded-xl bg-white transition-all duration-300 ${
                  isTyping ? 'border-blue-300 shadow-lg shadow-blue-500/10' : 'border-gray-200'
                }`}>
                  <div className="flex items-center p-4" ref={inputRef}>
                    <div className="flex-1 relative min-h-[20px]">
                      {typedText ? (
                        <>
                          <span ref={textRef} className="text-gray-900 text-sm font-normal">
                            {typedText}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">첨부한 지침에 따라 구현해줘</span>
                      )}
                    </div>
                    <button 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ml-4 transition-all duration-200 ${
                        isSendButtonPressed 
                          ? 'bg-blue-700 scale-90 shadow-inner transform-gpu' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 hover:scale-105'
                      }`}
                      style={{
                        boxShadow: isSendButtonPressed 
                          ? 'inset 0 2px 4px rgba(0,0,0,0.2)' 
                          : '0 4px 12px rgba(59, 130, 246, 0.25)'
                      }}
                    >
                      <Send className={`w-4 h-4 text-white transition-transform ${
                        isSendButtonPressed ? 'scale-90' : ''
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
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
    </>
  );
}