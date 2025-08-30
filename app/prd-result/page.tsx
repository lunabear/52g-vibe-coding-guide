'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, Edit2, Save, X, Send, Loader2, Sparkles } from 'lucide-react';
import { DashboardPreview } from '../../components/prd/DashboardPreview';
import { ChatbotPreview } from '../../components/prd/ChatbotPreview';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { usePRDContext } from '@/contexts/PRDContext';
import { THEME_PRESETS, buildTailwindThemeMarkdown } from '@/lib/theme-presets';
import { misoAPI } from '@/lib/miso-api';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ErrorPage } from '@/components/common/ErrorPage';
import { VibeCodingGuideModal } from '@/components/common/VibeCodingGuideModal';
import { loadMiniAllySession, clearMiniAllySession, getMisoDesignFromSession, convertMisoAppTypeToVibeType } from '@/lib/mini-ally-utils';
import { MermaidDiagram } from '@/components/common/MermaidDiagram';
import { FlowChart } from '@/components/common/FlowChart';

export default function PRDResultPage() {
  const router = useRouter();
  const { getAllQuestionsAndAnswers, prdContent, setPRDContent, resetPRD } = usePRDContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMiniAllyFlow, setIsMiniAllyFlow] = useState(false);
  // Heather: 스타일 선택 프리셋과 선택 상태
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const computeScopedCss = (css: string) =>
    css
      .replace(/:root/g, '.theme-preview')
      .replace(/\n\.dark/g, '\n.theme-preview.dark');
  const [previewType, setPreviewType] = useState<'dashboard' | 'chatbot'>('dashboard');
  const extractHsl = (css: string, key: string) => {
    const match = css.match(new RegExp(`--${key}:\\s*([^;]+);`));
    return match ? match[1].trim() : undefined;
  };

  // HEX 팔레트만 주입되는 환경에서, 미리보기의 기존 HSL 기반 클래스와 시각을 유지하기 위한 alias 생성기
  const hexToHslTriplet = (hex: string): string | undefined => {
    const m = hex?.trim().match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    if (!m) return undefined;
    const r = parseInt(m[1], 16) / 255;
    const g = parseInt(m[2], 16) / 255;
    const b = parseInt(m[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    const H = Math.round(h * 360);
    const S = Math.round(s * 100);
    const L = Math.round(l * 100);
    return `${H} ${S}% ${L}%`;
  };

  const buildHslAliasesFromHexPalette = (hexPaletteCss: string): string => {
    // 간단 파서: --token:#RRGGBB;
    const pick = (name: string): string | undefined => {
      const m = hexPaletteCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
      return m ? m[1].trim() : undefined;
    };
    const map: Record<string, string | undefined> = {
      background: hexToHslTriplet(pick('bg-100') || '#ffffff'),
      card: hexToHslTriplet(pick('bg-100') || '#ffffff'),
      border: hexToHslTriplet(pick('bg-300') || '#dddddd'),
      foreground: hexToHslTriplet(pick('text-100') || '#111111'),
      'muted-foreground': hexToHslTriplet(pick('text-200') || '#666666'),
      primary: hexToHslTriplet(pick('primary-100') || '#000000'),
      'primary-foreground': hexToHslTriplet('#ffffff'),
      accent: hexToHslTriplet(pick('accent-100') || '#dddddd'),
      ring: hexToHslTriplet(pick('primary-100') || '#000000'),
    };
    // scope: .theme-preview
    const lines = Object.entries(map)
      .filter(([, v]) => !!v)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join('\n');
    return `.theme-preview {\n${lines}\n}`;
  };

  const renderPreview = () => {
    switch (previewType) {
      case 'dashboard':
        return <DashboardPreview />;
      case 'chatbot':
        return <ChatbotPreview />;
      default:
        return null;
    }
  };

  const renderPreviewType = (type: 'bar' | 'line') => {
    const prev = previewType;
    try {
      // temporarily set type to reuse logic
      // We won't mutate state; call blocks below directly to keep purity
      const data = [20, 60, 40, 80, 55];
      const width = 300; const height = 120; const baseY = 110;
      const chartHeight = 100; const paddingLeft = 20; const paddingRight = 20;
      const step = (width - paddingLeft - paddingRight) / (data.length - 1);
      const points = data.map((v, i) => ({ x: paddingLeft + step * i, y: baseY - (v / 100) * chartHeight }));
      if (type === 'bar') {
        const barWidth = step * 0.5;
        return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
            <line x1="0" y1={baseY} x2={width} y2={baseY} stroke="var(--bg-300)" strokeWidth="1" />
            <line x1={paddingLeft} y1="0" x2={paddingLeft} y2={baseY} stroke="var(--bg-300)" strokeWidth="1" />
            {data.map((v, i) => {
              const x = points[i].x - barWidth / 2; const y = points[i].y; const h = baseY - y;
              return <rect key={i} x={x} y={y} width={barWidth} height={h} fill="var(--accent-100)" />;
            })}
          </svg>
        );
      }
      // line
      const midpoints = points.slice(0, -1).map((p, i) => ({ x: (p.x + points[i + 1].x) / 2, y: (p.y + points[i + 1].y) / 2 }));
      const pathD = [
        `M ${points[0].x},${points[0].y}`,
        ...points.slice(1).map((p, i) => (i < midpoints.length ? ` Q ${p.x},${p.y} ${midpoints[i].x},${midpoints[i].y}` : ` T ${p.x},${p.y}`)),
      ].join('');
      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
          <line x1="0" y1={baseY} x2={width} y2={baseY} stroke="var(--bg-300)" strokeWidth="1" />
          <line x1={paddingLeft} y1="0" x2={paddingLeft} y2={baseY} stroke="var(--bg-300)" strokeWidth="1" />
          <path d={pathD} fill="none" stroke="var(--primary-100)" strokeWidth="2" />
          {points.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--primary-100)" />))}
        </svg>
      );
    } finally {
      void prev;
    }
  };
  const [showExitModal, setShowExitModal] = useState(false);
  const [showVibeCodingModal, setShowVibeCodingModal] = useState(false);
  const [hasClickedVibeCoding, setHasClickedVibeCoding] = useState(false);
  const [showDesignWarningModal, setShowDesignWarningModal] = useState(false);
  // 카드 높이 동기화 (전체 카드 기준)
  const kyleCardRef = useRef<HTMLDivElement | null>(null);
  const heatherCardRef = useRef<HTMLDivElement | null>(null);
  const [syncedCardHeight, setSyncedCardHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const measure = () => {
      const h1 = kyleCardRef.current?.getBoundingClientRect().height || 0;
      const h2 = heatherCardRef.current?.getBoundingClientRect().height || 0;
      const max = Math.max(600, h1, h2); // 최소 높이를 600px로 설정
      setSyncedCardHeight(max);
    };
    // 초기 측정
    measure();
    // ResizeObserver로 동기화
    const ro1 = new ResizeObserver(measure);
    const ro2 = new ResizeObserver(measure);
    if (kyleCardRef.current) ro1.observe(kyleCardRef.current);
    if (heatherCardRef.current) ro2.observe(heatherCardRef.current);
    window.addEventListener('resize', measure);
    return () => {
      try { ro1.disconnect(); } catch {}
      try { ro2.disconnect(); } catch {}
      window.removeEventListener('resize', measure);
    };
  }, [prdContent]);
  
  // 편집 모드 상태
  const [isEditingPRD, setIsEditingPRD] = useState(false);
  // Heather 편집 모드 관련 상태 제거
  
  // 임시 편집 내용
  const [tempPRDContent, setTempPRDContent] = useState('');
  // Heather 임시 편집 내용 제거
  
  // 수정 요청 상태
  const [prdFixRequest, setPRDFixRequest] = useState('');
  // Heather 수정 요청 상태 제거
  const [isPRDFixing, setIsPRDFixing] = useState(false);
  // Heather 수정 중 상태 제거

  // 단일 실행 가드 (StrictMode의 이펙트 중복 실행 및 상태 변화 재실행 방지)
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      try {
        const session = loadMiniAllySession();
        if (session) {
          setIsMiniAllyFlow(true);
        }

        // 이미 결과가 있으면 추가 호출 방지
        if (prdContent) {
          setIsLoading(false);
          return;
        }

        // 단 한 번만 호출
        if (hasRequestedRef.current) return;
        hasRequestedRef.current = true;

        let questionsAndAnswers: Array<{ question: string; answer: string }> = [];

        if (session?.projectData) {
          const projectData = session.projectData;
          const expertAnswers = session.expertAnswers || [];
          questionsAndAnswers = [
            { question: '이 서비스의 핵심 타겟 사용자는 누구인가요?', answer: projectData.personaProfile || '' },
            { question: '사용자는 언제 불편함을 경험하나요?', answer: projectData.painPointContext || '' },
            { question: '왜 이 상황을 불편하게 느끼나요?', answer: projectData.painPointReason || '' },
            { question: '해결해야 할 핵심 문제는 무엇인가요?', answer: projectData.coreProblemStatement || '' },
            { question: '솔루션의 이름은 무엇인가요?', answer: projectData.solutionNameIdea || '' },
            { question: '솔루션이 어떻게 작동하나요?', answer: projectData.solutionMechanism || '' },
            { question: '기대되는 효과는 무엇인가요?', answer: projectData.expectedOutcome || '' },
            ...expertAnswers,
          ];
        } else {
          // 기존 플로우: PRDContext에서 데이터 가져오기
          questionsAndAnswers = getAllQuestionsAndAnswers();
        }

        if (questionsAndAnswers.length === 0) {
          router.push('/');
          return;
        }

        const result = await misoAPI.generatePRD(questionsAndAnswers);
        if (result) {
          setPRDContent(result);
        } else {
          setError('아이디어 구체화에 실패했습니다.');
        }
      } catch (err) {
        console.error('Failed to generate PRD:', err);
        if (err instanceof Error && err.message.includes('fetch')) {
          setError('network');
        } else {
          setError('아이디어 구체화 중 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prdContent]);

  // Heather: MISO 디자인 생성 로직 제거됨 (스타일 선택 UI 사용)

  // 개발자(Bob) 단계는 제거되었습니다

  const handleDownload = async (includeMiso: boolean = false, misoType?: 'chatflow' | 'workflow' | 'both') => {
    const date = new Date().toISOString().split('T')[0];

    // 문서 헤더
    let md = `# 제품 요구사항 문서 (PRD)\n\n`;
    md += `> 이 문서 활용 지침\n\n`;
    md += `- PRD에 따라 시스템을 프로덕션 수준으로 구현합니다.\n`;
    md += `- 초기 단계에서는 목업 데이터를 우선 활용합니다.\n`;
    md += `- 디자인 지침을 준수해 일관된 컬러/타이포그래피를 시스템 전반에 적용합니다.\n`;
    if (includeMiso && misoType) {
      md += `- MISO 연동이 필요한 경우 3. 기술 연동 가이드를 따릅니다.\n`;
    }
    md += `\n`;

    // 목차
    md += `## 목차\n\n`;
    md += `- 1. PRD\n`;
    md += `- 2. 디자인 시스템 가이드\n`;
    if (includeMiso && misoType) {
      md += `- 3. 기술 연동 가이드\n`;
      if (misoType === 'chatflow' || misoType === 'both') {
        md += `  - 3.1 MISO Chatflow\n`;
      }
      if (misoType === 'workflow' || misoType === 'both') {
        md += `  - 3.2 MISO Workflow\n`;
      }
    }
    md += `\n---\n\n`;

    // 1. PRD
    md += `## 1. PRD\n\n`;
    if (prdContent) {
      md += `${prdContent}\n\n`;
    }
    md += `---\n\n`;

    // 2. 디자인 시스템 가이드
    md += `## 2. 디자인 시스템 가이드\n\n`;
    const selectedTheme = THEME_PRESETS.find(t => t.id === selectedThemeId);
    if (selectedTheme) {
      const designGuide = buildTailwindThemeMarkdown(selectedTheme);
      md += `${designGuide}\n\n`;
    } else {
      md += `선택된 디자인 시스템이 없습니다.\n\n`;
    }

    // 3. 기술 연동 가이드 (옵션)
    if (includeMiso && misoType) {
      md += `---\n\n`;
      md += `## 3. 기술 연동 가이드\n\n`;
      const { MISO_CHATFLOW_AGENT_GUIDE, MISO_WORKFLOW_GUIDE } = await import('@/lib/prompts/vibe-coding-guide');
      if (misoType === 'chatflow' || misoType === 'both') {
        md += `### 3.1 MISO Chatflow\n\n${MISO_CHATFLOW_AGENT_GUIDE}\n\n`;
      }
      if (misoType === 'workflow' || misoType === 'both') {
        md += `### 3.2 MISO Workflow\n\n${MISO_WORKFLOW_GUIDE}\n\n`;
      }
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD_${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 홈으로 나가기 핸들러
  const handleGoHome = () => {
    setShowExitModal(true);
  };

  // 모달에서 확인 버튼 클릭
  const handleConfirmExit = () => {
    resetPRD();
    
    // Mini-Ally 세션도 정리
    if (isMiniAllyFlow) {
      clearMiniAllySession();
    }
    
    router.push('/');
  };

  // 모달에서 취소 버튼 클릭
  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // 편집 관련 함수들
  const handleEditPRD = () => {
    setTempPRDContent(prdContent || '');
    setIsEditingPRD(true);
  };

  const handleSavePRD = () => {
    setPRDContent(tempPRDContent);
    setIsEditingPRD(false);
  };

  const handleCancelPRD = () => {
    setIsEditingPRD(false);
    setTempPRDContent('');
  };

  // Heather 편집 관련 핸들러 제거

  // 개발자(Bob) 편집 관련 로직 제거됨

  // 수정 요청 처리 함수들
  const handlePRDFix = async () => {
    if (!prdFixRequest.trim() || !prdContent) return;
    
    setIsPRDFixing(true);
    try {
      const fixedContent = await misoAPI.fixDocument('prd', prdContent, prdFixRequest);
      if (fixedContent) {
        setPRDContent(fixedContent);
        setPRDFixRequest('');
      }
    } catch (error) {
      console.error('Failed to fix PRD:', error);
    } finally {
      setIsPRDFixing(false);
    }
  };

  // Heather 수정 요청 로직 제거

  // 개발자(Bob) 문서 수정 로직 제거됨

  // 전역 로딩 화면 제거: Kyle 카드 내부에 로딩 오버레이를 표시합니다

  if (error) {
    if (error === 'network') {
      return (
        <ErrorPage 
          errorCode="network"
          showHomeButton={true}
          showRetryButton={true}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            window.location.reload();
          }}
        />
      );
    }
    
    return (
      <ErrorPage 
        errorCode="default"
        title={error}
        showHomeButton={true}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                처음으로
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <h1 className="text-lg font-medium text-gray-900">프로젝트 문서</h1>
            </div>
            <div className="flex items-center gap-3">
              {selectedThemeId && (
                <div className="flex items-center gap-2 text-blue-600 animate-bounce">
                  <span className="text-sm font-medium">Click!</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <button
                onClick={() => {
                  setHasClickedVibeCoding(true);
                  if (!selectedThemeId) {
                    setShowDesignWarningModal(true);
                  } else {
                    setShowVibeCodingModal(true);
                  }
                }}
                disabled={!prdContent}
                className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${
                  prdContent && !hasClickedVibeCoding 
                    ? 'bg-blue-600 hover:bg-blue-700 animate-subtle-lift' 
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${
                  prdContent && !hasClickedVibeCoding 
                    ? 'animate-soft-glow' 
                    : ''
                }`} />
                바이브코딩에 적용하기
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 h-screen overflow-hidden">
        <div className="px-6 h-full pb-6">
          {/* 3 Column Layout - Full Width */}
          <div className="grid grid-cols-1 custom:grid-cols-3 gap-6 h-full grid-rows-[minmax(0,1fr)] overflow-hidden">
            
            {/* 기획자 - PRD */}
            <div 
              ref={kyleCardRef}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow relative flex flex-col h-full min-h-0"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 min-h-[112px] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img 
                        src="/assets/mini_kyle_default.png" 
                        alt="기획자 Kyle" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">기획자 Kyle</h3>
                      <p className="text-sm text-gray-600">프로덕트 요구사항 정의</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={isEditingPRD ? handleSavePRD : handleEditPRD}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isEditingPRD ? "저장" : "편집"}
                      disabled={isPRDFixing}
                    >
                      {isEditingPRD ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                    {isEditingPRD && (
                      <button
                        onClick={handleCancelPRD}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-600">완료</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto relative min-h-0">
                <div className="p-6">
                  {isEditingPRD ? (
                    <textarea
                      value={tempPRDContent}
                      onChange={(e) => setTempPRDContent(e.target.value)}
                      className="w-full h-full p-4 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="PRD 내용을 입력하세요..."
                    />
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                      components={{
                      assumption: ({ children }: { children?: React.ReactNode }) => (
                        <div className="pl-4 py-2 my-4 border-l-3 border-blue-400 bg-blue-50 rounded-r">
                          <div className="text-sm text-blue-700">
                            <span className="font-semibold">가정: </span>
                            {children}
                          </div>
                        </div>
                      ),
                      h1: ({ children }: { children?: React.ReactNode }) => (
                        <h1 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }: { children?: React.ReactNode }) => (
                        <h2 className="text-lg font-medium text-gray-800 mt-8 mb-4">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }: { children?: React.ReactNode }) => (
                        <h3 className="text-base font-medium text-gray-700 mt-6 mb-3">
                          {children}
                        </h3>
                      ),
                      p: ({ children }: { children?: React.ReactNode }) => (
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      ul: ({ children }: { children?: React.ReactNode }) => (
                        <ul className="space-y-2 mb-4 list-disc pl-5">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }: { children?: React.ReactNode }) => (
                        <ol className="mb-4 list-decimal pl-5" style={{ listStyleType: 'decimal' }}>
                          {children}
                        </ol>
                      ),
                      li: ({ children }: { children?: React.ReactNode }) => (
                        <li className="text-sm text-gray-600 mb-2" style={{ display: 'list-item', listStyleType: 'inherit' }}>
                          {children}
                        </li>
                      ),
                      strong: ({ children }: { children?: React.ReactNode }) => (
                        <strong className="font-semibold text-gray-800">{children}</strong>
                      ),
                      blockquote: ({ children }: { children?: React.ReactNode }) => (
                        <blockquote className="pl-4 py-2 my-4 border-l-3 border-gray-300 bg-gray-50 rounded-r">
                          <div className="italic text-sm text-gray-600">{children}</div>
                        </blockquote>
                      ),
                      table: ({ children }: { children?: React.ReactNode }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }: { children?: React.ReactNode }) => (
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          {children}
                        </thead>
                      ),
                      th: ({ children }: { children?: React.ReactNode }) => (
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {children}
                        </th>
                      ),
                      td: ({ children }: { children?: React.ReactNode }) => (
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                          {children}
                        </td>
                      ),
                      hr: () => <hr className="my-6 border-gray-200" />,
                      pre: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: any }) => {
                        console.log('Pre element:', { className, children, childrenType: typeof children });
                        
                        // Check if this is a code block wrapper  
                        if (React.isValidElement(children) && (children as React.ReactElement).type === 'code') {
                          const codeEl = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
                          const codeProps = codeEl.props;
                          const codeClassName = codeProps.className ?? '';
                          const match = /language-(\w+)/.exec(codeClassName);
                          const language = match ? match[1] : null;
                          
                          console.log('Pre->Code detected:', { language, codeClassName, codeChildren: codeProps.children });
                          
                          // Handle JSON flowchart
                          if (language === 'json-flowchart' || language === 'flowchart' || language === 'json') {
                            const content = Array.isArray(codeProps.children) ? (codeProps.children as string[]).join('') : (codeProps.children as string | undefined);
                            if (typeof content === 'string') {
                              try {
                                const flowData = JSON.parse(content.trim());
                                // Check if it's actually flowchart data
                                if (flowData.nodes && flowData.edges && Array.isArray(flowData.nodes) && Array.isArray(flowData.edges)) {
                                  console.log('FlowChart rendering:', flowData);
                                  return <FlowChart data={flowData} />;
                                }
                                // If not flowchart data, fall through to regular code block
                              } catch (e) {
                                console.error('JSON parsing error:', e);
                                return (
                                  <div className="bg-red-50 border border-red-200 rounded p-4 my-4">
                                    <p className="text-red-600 text-sm font-semibold mb-2">플로우차트 JSON 파싱 오류</p>
                                    <p className="text-xs text-gray-600 mb-2">언어: {language}</p>
                                    <pre className="text-xs text-red-500 overflow-x-auto">{content}</pre>
                                  </div>
                                );
                              }
                            }
                          }
                          
                          // Handle Mermaid  
                          if (language === 'mermaid') {
                            const content = Array.isArray(codeProps.children) ? (codeProps.children as string[]).join('') : (codeProps.children as string | undefined);
                            if (typeof content === 'string') {
                              return <MermaidDiagram chart={content} />;
                            }
                          }
                        }
                        
                        // Fallback to default pre rendering
                        return (
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto my-4">
                            {children}
                          </pre>
                        );
                      },
                      code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: any }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : null;
                        
                        // Debug log - 제거
                        
                        // Check if it's a JSON flowchart
                        if (language === 'json-flowchart' || language === 'flowchart' || language === 'json') {
                          const content = Array.isArray(children) ? children.join('') : children;
                          if (typeof content === 'string') {
                            try {
                              const flowData = JSON.parse(content.trim());
                              // Check if it's actually flowchart data
                              if (flowData.nodes && flowData.edges && Array.isArray(flowData.nodes) && Array.isArray(flowData.edges)) {
                                console.log('FlowChart data parsed in code block:', flowData);
                                return <FlowChart data={flowData} />;
                              }
                              // If not flowchart data, fall through to regular code block
                            } catch (e) {
                              // Not valid JSON or not flowchart, fall through to regular code block
                            }
                          }
                        }
                        
                        // Check if it's a mermaid code block
                        if (language === 'mermaid' && typeof children === 'string') {
                          return <MermaidDiagram chart={children} />;
                        }
                        
                        const isInline = !props.node?.position;
                        return isInline ? (
                          <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto my-4">
                            <code className="text-xs font-mono text-gray-800">{children}</code>
                          </pre>
                        );
                      },
                    } as any}
                  >
                      {prdContent ? (() => {
                        // Pre-process content to convert json-flowchart to json
                        let processedContent = prdContent.replace(/```json-flowchart/g, '```json');
                        return processedContent;
                      })() : (!error && !isLoading ? '# PRD 문서\n\n내용을 불러올 수 없습니다.' : '')}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
              
              {!prdContent && !error && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4">
                      <img
                        src="/assets/mini_kyle_thinking.png"
                        alt="Kyle thinking"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">아이디어를 정리하고 있어요</h3>
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2].map((index) => (
                        <div
                          key={index}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                          style={{
                            animationDelay: `${index * 0.2}s`,
                            animationDuration: '1.2s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 수정 요청 채팅바 */}
              {prdContent && !isEditingPRD && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={prdFixRequest}
                        onChange={(e) => setPRDFixRequest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePRDFix()}
                        placeholder="Kyle에게 수정을 요청하세요"
                        className="w-full px-4 py-2.5 pr-12 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 transition-all"
                        disabled={isPRDFixing}
                      />
                      <button
                        onClick={handlePRDFix}
                        disabled={isPRDFixing || !prdFixRequest.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {isPRDFixing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 수정 중 오버레이 */}
              {isPRDFixing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4">
                      <img
                        src="/assets/mini_kyle_thinking.png"
                        alt="Kyle thinking"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">문서를 수정하고 있습니다</h3>
                    <div className="flex gap-1 mt-4">
                      {[0, 1, 2].map((index) => (
                        <div
                          key={index}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                          style={{
                            animationDelay: `${index * 0.2}s`,
                            animationDuration: '1.2s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 디자이너 - 페이지 설계 (Heather가 2열 차지) */}
            <div className="custom:col-span-2 relative h-full min-h-0">
              <style
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    const selectedTheme = THEME_PRESETS.find(t => t.id === selectedThemeId);
                    if (!selectedTheme) return '';
                    
                    // 전체 CSS를 theme-preview 스코프로 변환
                    const fullCSS = selectedTheme.css
                      .replace(/:root\s*{/g, '.theme-preview {')
                      .replace(/\.dark\s*{/g, '.theme-preview.dark {');
                    
                    const extra = `\n@keyframes theme-glow {\n  0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.05), 0 0 40px hsl(var(--accent) / 0.03); }\n  50% { box-shadow: 0 0 30px hsl(var(--primary) / 0.08), 0 0 60px hsl(var(--accent) / 0.05); }\n}\n.animate-theme-glow {\n  animation: theme-glow 3s ease-in-out infinite;\n}`;
                    
                    return `${fullCSS}\n${extra}`;
                  })()
                }}
              />
              <div 
              ref={heatherCardRef}
              className="theme-preview rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-500 animate-theme-glow relative flex flex-col h-full min-h-0" 
              style={{ background: 'var(--bg-100)', border: '1px solid var(--bg-300)' }}
            >
              {/* Header */}
              <div
                className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 backdrop-blur-sm min-h-[112px] flex-shrink-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img 
                        src="/assets/mini_heather_default.png" 
                        alt="디자이너 Heather" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-100)' }}>디자이너 Heather</h3>
                      <p className="text-sm" style={{ color: 'var(--text-200)' }}>원하시는 스타일을 선택해주세요</p>
                    </div>
                  </div>
                    {selectedThemeId ? (
                      <div className="text-right max-w-sm">
                        <div className="flex items-center justify-end gap-2 text-sm mb-1">
                          <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ background: 'var(--primary-100)' }}></div>
                          <span className={`font-semibold`} style={{ color: 'var(--text-100)' }}>
                            {THEME_PRESETS.find(t => t.id === selectedThemeId)?.name} 선택됨
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-200)' }}>
                          "{THEME_PRESETS.find(t => t.id === selectedThemeId)?.recommendation}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-right max-w-sm">
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="font-medium text-gray-600">
                            스타일 미선택
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              
              {/* Content: 좌측 프리셋 리스트, 우측 스타일 미리보기 */}
              <div className="relative flex-1 flex flex-col min-h-0">
                <div className="p-6 flex-1 min-h-0 flex flex-col">
                  <div className="grid grid-cols-5 gap-6 flex-1 min-h-0">
                    {/* Preset List */}
                    <div className="col-span-1 flex flex-col min-h-0">
                      <h4 className="text-sm font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2 flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"></div>
                        스타일 프리셋
                      </h4>
                      <div className="space-y-3 overflow-y-auto pr-2 flex-1 min-h-0 px-1 pt-2">
                        {THEME_PRESETS.map(preset => (
                      <button
                            key={preset.id}
                            onClick={() => setSelectedThemeId(selectedThemeId === preset.id ? '' : preset.id)}
                            className={`group w-full text-left border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                              selectedThemeId === preset.id 
                                ? 'border-[hsl(var(--primary))] bg-gradient-to-br from-[hsl(var(--primary))]/5 to-[hsl(var(--accent))]/10 shadow-md shadow-[hsl(var(--primary))]/20' 
                                : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))]/5 hover:border-[hsl(var(--accent))]/50 hover:shadow-[hsl(var(--accent))]/10'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className={`text-sm font-semibold truncate transition-colors ${
                                  selectedThemeId === preset.id ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'
                                }`}>{preset.name}</div>
                                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate group-hover:text-[hsl(var(--foreground))]/70 transition-colors">{preset.description}</div>
                                <div className="mt-3 grid grid-cols-5 gap-1.5">
                                  {['background','foreground','primary','secondary','accent'].map(key => (
                                    <div
                                      key={key}
                                      className="h-4 rounded-md border border-white/50 shadow-sm"
                          style={{
                                        backgroundColor: extractHsl(preset.css, key)
                                          ? `hsl(${extractHsl(preset.css, key)})`
                                          : undefined,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                              <div className={`w-3 h-3 flex-shrink-0 rounded-full transition-all ${
                                selectedThemeId === preset.id 
                                  ? 'bg-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary))]/50' 
                                  : 'bg-[hsl(var(--muted-foreground))]/30 group-hover:bg-[hsl(var(--accent))]/60'
                              }`}></div>
                </div>
                        </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview Panel with scoped theme */}
                    <div className="col-span-4 flex flex-col min-h-0">
                      <div className="flex-shrink-0 mb-4">
                        <h4 className="text-sm font-bold text-[hsl(var(--foreground))] mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))]"></div>
                          실시간 미리보기
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewType('dashboard')}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-300 ${
                              previewType === 'dashboard' 
                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/25' 
                                : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]/10 hover:border-[hsl(var(--accent))]'
                            }`}
                          >
                            대시보드
                          </button>
                          <button
                            onClick={() => setPreviewType('chatbot')}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-300 ${
                              previewType === 'chatbot' 
                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/25' 
                                : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]/10 hover:border-[hsl(var(--accent))]'
                            }`}
                          >
                            AI 챗봇
                          </button>
                        </div>
                      </div>
                      <div className="border-2 border-[hsl(var(--border))] rounded-2xl shadow-lg shadow-[hsl(var(--primary))]/5 bg-[hsl(var(--card))] flex-1 min-h-0 flex flex-col relative">
                        <div className="p-4 flex-1 overflow-hidden" style={{ fontFamily: 'var(--font-sans)' }}>
                          {selectedThemeId ? renderPreview() : null}
                        </div>
                        {!selectedThemeId && (
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                            <div className="flex flex-col items-center text-center px-6">
                              <div className="mb-4">
                                <img
                                  src="/assets/mini_heather_thinking.png"
                                  alt="Heather 안내"
                                  className="w-20 h-20 object-contain"
                                />
                              </div>
                              <h3 className="text-base font-medium text-gray-900">
                                적용을 원하시는 디자인 시스템을 선택해주세요
                              </h3>
                              <p className="mt-2 text-sm text-gray-600">
                                좌측 목록에서 스타일 프리셋을 선택하면 우측에서 미리보기가 갱신됩니다.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-3 px-1 flex items-center gap-2 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></div>
                        선택한 스타일은 ZIP 다운로드에 theme.css로 포함됩니다.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
              
            {/* 개발자(Bob) 섹션 제거됨 */}

          </div>
        </div>
      </main>
      
      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        title="홈으로 돌아가기"
        message="작성 중인 내용이 모두 사라집니다. 정말 홈으로 돌아가시겠습니까?"
        confirmText="홈으로 돌아가기"
        cancelText="계속 보기"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
      
      {/* VibeCoding Guide Modal */}
      <VibeCodingGuideModal
        isOpen={showVibeCodingModal}
        onClose={() => setShowVibeCodingModal(false)}
        onDownload={handleDownload}
        defaultMisoType={(() => {
          const misoDesign = getMisoDesignFromSession();
          return misoDesign?.misoAppType ? convertMisoAppTypeToVibeType(misoDesign.misoAppType) : undefined;
        })()}
      />
      
      {/* Design Selection Warning Modal */}
      <ConfirmModal
        isOpen={showDesignWarningModal}
        title="디자인 미선택"
        message="디자인을 선택하지 않았습니다. 진행하시겠습니까?"
        confirmText="진행하기"
        cancelText="돌아가기"
        onConfirm={() => {
          setShowDesignWarningModal(false);
          setShowVibeCodingModal(true);
        }}
        onCancel={() => setShowDesignWarningModal(false)}
      />
    </div>
  );
}