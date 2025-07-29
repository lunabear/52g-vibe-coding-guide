import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface MiniAllySummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  result: string;
  feedback?: string; // 미니앨리 피드백 메시지
  onConfirm: () => void;
}

export function MiniAllySummaryModal({
  open,
  onOpenChange,
  loading,
  result,
  feedback,
  onConfirm,
}: MiniAllySummaryModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // result가 변경될 때마다 editableContent 업데이트
  useEffect(() => {
    if (result) {
      setEditableContent(result);
    }
  }, [result]);

  // 편집 모드 진입
  const enterEditMode = () => {
    setIsEditing(true);
    // 다음 렌더링 사이클에서 포커스
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      }
    }, 0);
  };

  // 편집 모드 종료
  const exitEditMode = () => {
    setIsEditing(false);
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      exitEditMode();
    }
    // Ctrl/Cmd + Enter로 편집 완료
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      exitEditMode();
    }
  };

  // 확인 버튼 클릭 시 편집된 내용으로 진행
  const handleConfirm = () => {
    onConfirm();
  };

  // 피드백 메시지 파싱 (제목과 설명 분리)
  const parseFeedback = (feedbackText: string) => {
    const lines = feedbackText.trim().split('\n');
    const title = lines[0] || '';
    const description = lines.slice(1).join('\n').trim() || '';
    return { title, description };
  };

  const { title: feedbackTitle, description: feedbackDescription } = feedback 
    ? parseFeedback(feedback)
    : { title: '', description: '' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col">
        <DialogHeader className={`flex-shrink-0 ${
          feedback ? 'pb-3' : 'pb-4'
        }`}>
          <DialogTitle className={`font-normal text-gray-900 ${
            loading 
              ? "text-[18px] custom:text-[20px]"
              : feedback 
                ? "text-[15px] custom:text-[16px] mt-2 max-w-[calc(100%-32px)]" // 닫기 버튼과 간격, 최대 폭 제한
                : "text-[18px] custom:text-[20px]"
          }`}>
            {loading 
              ? "대화 내용을 정리하고 있어요" 
              : feedback ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] custom:text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      Feedback
                    </span>
                    <span>{feedbackTitle}</span>
                  </div>
                ) : "정리 완료"
            }
          </DialogTitle>
          <DialogDescription className={`text-gray-500 leading-relaxed ${
            loading 
              ? "text-[14px] custom:text-[15px] mt-1"
              : feedback
                ? "text-[12px] custom:text-[13px] mt-1 max-w-[calc(100%-32px)]" // 최대 폭 제한
                : "text-[14px] custom:text-[15px] mt-1"
          }`}>
            {loading 
              ? "지금까지의 대화를 요약하여 다음 단계 진행을 위해 준비하고 있습니다." 
              : (feedback 
                  ? feedbackDescription 
                  : "아래 내용을 클릭하여 바로 수정하거나, 확인 후 다음 단계로 진행해주세요."
                )
            }
          </DialogDescription>
        </DialogHeader>

        <div className={`flex-1 min-h-0 ${feedback ? '-mt-1' : ''}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[15px] font-light text-gray-700">대화 내용을 분석 중입니다</p>
                <div className="flex justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="pr-4 pb-4">
                <div className="space-y-6">
                  {/* 노션 스타일 인라인 편집 영역 */}
                  <div className="bg-gray-50 rounded-xl border border-gray-100">
                    {isEditing ? (
                      <div className="p-6">
                        <div className="mb-4">
                          <p className="text-[12px] custom:text-[13px] text-gray-500 font-medium">
                            마크다운으로 편집하세요 (Esc 또는 Ctrl+Enter로 완료)
                          </p>
                        </div>
                        <Textarea
                          ref={textareaRef}
                          value={editableContent}
                          onChange={(e) => setEditableContent(e.target.value)}
                          onBlur={exitEditMode}
                          onKeyDown={handleKeyDown}
                          placeholder="마크다운으로 내용을 편집하세요... (### 제목, **굵게**, *기울임* 등)"
                          className="w-full h-[350px] resize-none border-0 bg-white text-[14px] leading-relaxed font-mono focus:ring-0 focus:outline-none rounded-lg"
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                          }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="p-6 cursor-text hover:bg-gray-100/50 transition-colors duration-200 group min-h-[410px]"
                        onClick={enterEditMode}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            enterEditMode();
                          }
                        }}
                      >
                        <div className="prose max-w-none relative">
                          {/* 편집 힌트 오버레이 */}
                          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <span className="text-[11px] text-gray-400 bg-white px-2 py-1 rounded shadow-sm border">
                              클릭하여 편집
                            </span>
                          </div>
                          
                          <div className="min-h-[350px]">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-lg font-semibold text-gray-900 mb-4 first:mt-0">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-base font-semibold text-gray-800 mb-3 first:mt-0">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-medium text-gray-700 mb-2 first:mt-0">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-[14px] custom:text-[15px] text-gray-700 leading-relaxed mb-3 last:mb-0">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="my-3 space-y-1 list-disc ml-4 pl-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="my-3 space-y-1 list-decimal ml-4 pl-2">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-[14px] custom:text-[15px] text-gray-700 leading-relaxed">
                                    {children}
                                  </li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-gray-600">
                                    {children}
                                  </em>
                                ),
                                code: ({ children, ...props }) => {
                                  const isInline = !props.node?.position;
                                  return isInline ? (
                                    <code className="px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded text-sm font-mono">
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto my-3 border border-gray-200">
                                      <code className="text-gray-800">{children}</code>
                                    </pre>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="pl-4 py-2 my-3 border-l-3 border-gray-300 bg-white rounded-r text-gray-600">
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {editableContent}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            {/* 확인 안내 메시지 */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-[13px] custom:text-[14px] font-normal text-gray-700">
                  내용을 확인하셨나요?
                </p>
                <p className="text-[11px] custom:text-[12px] text-gray-500">
                  위 내용을 클릭하여 수정하거나, 확인 후 진행해주세요.
                </p>
              </div>
            </div>
            
            {/* 다음 단계 버튼 */}
            {result && (
              <Button 
                onClick={handleConfirm}
                className="text-[14px] custom:text-[15px] bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2"
              >
                다음 단계로 진행
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 