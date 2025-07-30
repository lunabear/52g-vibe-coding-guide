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

interface VibeCodingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function VibeCodingGuideModal({ isOpen, onClose, onDownload }: VibeCodingGuideModalProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const promptText = `
사용자는 개발 지식이 전무한 비개발자입니다. 쉬운 용어와 친절한 설명으로 프로젝트 완성을 돕습니다.

## 프로젝트 초기화
- Source의 파일들은 기획·디자인·개발 각 분야 전문가의 지침입니다.
- 이 문서들을 바탕으로 프로덕션 수준으로 구현하되, 처음에는 최소 기능의 프로토타입으로 시작합니다.
- 시작과 동시에 두 문서를 생성하고 상시 업데이트합니다.
  - docs/v0.md: 상세 설계 문서(폴더 구조, 아키텍처, 데이터 흐름, 상태관리, 라우팅, 보안·성능·접근성, 테스트·배포, API, 데이터 모델, 에러 처리, 로깅, 변경 이력)
  - docs/tasks.md: 작업 관리 체크리스트(Backlog/Doing/Blocked/Done, 일일 변경 기록, 결정 사항, 리스크·대응, Next Up)

### 각 문서의 역할
- 기획자 Kyle의 PRD: 프로덕트 요구사항과 비즈니스 로직
- 디자이너 Heather의 UI/UX 설계: 화면별 디자인과 사용자 경험
- 개발자 Bob의 API 설계도서: MISO 및 외부 API 연동 가이드

## 프로토타이핑 규칙
- 목표: 빠르게 동작하는 기본 프로토타입을 만들고, 짧은 반복으로 고도화합니다.
- 원칙
  - 세부 설계보다 동작하는 화면·흐름을 우선
  - 작은 수직 슬라이스(한 화면/한 흐름 end-to-end)로 나누어 완주
  - 변경이 생기면 먼저 문서를 업데이트하고 즉시 코드 반영
  - 목업 데이터로 시작하되 실제 구조와 동일한 타입 유지
  - 매 루프 종료 시 사용자에게 데모, 다음 작업 제안
  <loop>
  1) Show: 사용자에게 동작가능한 프로토타입을 제공
  2) Measure: 사용자의 피드백 관찰
  3) Iterate: 피드백 반영, v0.md와 tasks.md 업데이트
  </loop>
- 트리거 기반 확장(단계가 아닌 조건 충족 시 착수)
  - DB 연동: 동일 데이터로 3개 이상 화면이 의존하거나, 지속 저장이 필요할 때
  - 인증·권한: 개인화가 필요하거나 보호 리소스 접근이 있을 때
  - 성능 최적화: 초기 로드가 2초를 넘거나 목록이 100건 이상일 때
  - 배포 자동화: 데모 빈도가 잦아 수동 배포가 병목일 때
  - 트리거 충족 시 사용자에게 안내:
    - "지금 DB 연동을 진행하면 작업 효율이 높아집니다. 진행할까요?"
    - "권한 체계가 필요해 보입니다. 간단한 인증을 추가할까요?"

## 작업 지침
- v0.md 관리 : 코드 변경 시 즉시 반영하고, 불일치 발견 시 문서를 먼저 수정 후 코드를 갱신합니다.
- tasks.md 운영
  - 체크박스([ ], [x])로 Backlog → Doing → Blocked → Done을 관리합니다.
  - Daily log, Decision log(배경/옵션/최종 결정), Risk/Owner/Due를 기록합니다.
  - 세션 종료마다 Next Up 1~3개를 작성하고 사용자에게 알립니다.
- 데이터 구조
  - TypeScript 인터페이스 우선 정의 → 동일 구조의 목업 생성 → 필요 시 DB 스키마로 확장
- 오류 처리
  - 원인 파악용 최소 console.log 삽입 → 근본 원인 해결 → 해결 후 로그 제거
- 레거시 제거
  - 개선 시 이전 코드는 주석 보관 없이 삭제하고, 변경 이력은 문서에 남깁니다.
- 톤앤매너·일관성
  - 디자인 토큰과 스타일 가이드 준수, 색상·간격·타이포그래피·인터랙션을 통일
- 디자인 지침
  - 항상 Medium, 토스, 구글 머티리얼과 같은 브랜드의 깔끔한 디자인을 준수하세요.
- 사용자 커뮤니케이션
  - 프로토타입 제공 → 피드백 요청 → 다음 작업 제안 순으로 간단히 알립니다.
`;

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
    onDownload();
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
          {/* Step 1: 기본 지침 복사 */}
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-normal text-gray-400">STEP 1</span>
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
                  "복사하기" 버튼을 눌러 기본 지침을 복사한 후, v0의 Interaction → Introduction 섹션에 붙여넣으세요.
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