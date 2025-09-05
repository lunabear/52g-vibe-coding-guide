'use client';

import { useState, useEffect, Suspense } from 'react';
import { track } from '@vercel/analytics';
import { ArrowLeft, ChevronRight, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { misoAPI } from '@/lib/miso-api';
import MISOLoading from '@/components/common/MISOLoading';
import WorkflowVisualization from '@/components/common/WorkflowVisualization';
import YamlWorkflowVisualizer from '@/components/common/YamlWorkflowVisualizer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WorkflowNode } from '@/types/prd.types';
import { cn } from '@/lib/utils';
import { loadMiniAllySession, saveMisoDesignToSession, getMisoDesignFromSession, type MisoDesignData } from '@/lib/mini-ally-utils';
import { EXTERNAL_LINKS } from '@/lib/links';
import { MisoSkipConfirmModal } from '@/components/common/MisoSkipConfirmModal';

function MisoGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const journeyId = searchParams.get('journey_id') || undefined;
  const journeyOrigin = searchParams.get('origin') || (journeyId ? 'chat' : undefined);
  const journeyIntent = searchParams.get('intent') || undefined;
  const [expectedInput, setExpectedInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [desiredAction, setDesiredAction] = useState('');
  const [userExperience, setUserExperience] = useState('');
  const [misoAppType, setMisoAppType] = useState('');
  const [explanation, setExplanation] = useState('');
  const [flow, setFlow] = useState<WorkflowNode[]>([]);
  const [flowYaml, setFlowYaml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoadingMisoApp, setIsLoadingMisoApp] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [showPromptTooltip, setShowPromptTooltip] = useState(false);
  const [showKnowledgeTooltip, setShowKnowledgeTooltip] = useState(false);
  const [showSkipConfirmModal, setShowSkipConfirmModal] = useState(false);
  const [showV0GuideModal, setShowV0GuideModal] = useState(false);
  const [showWorkflowGuideModal, setShowWorkflowGuideModal] = useState(false);
  const [showPromptGuideModal, setShowPromptGuideModal] = useState(false);
  const [showKnowledgeGuideModal, setShowKnowledgeGuideModal] = useState(false);
  const [showMiniAllyInlineSummary, setShowMiniAllyInlineSummary] = useState(false);
  const [miniAllyProjectData, setMiniAllyProjectData] = useState<any>(null);
  const [isCanceled, setIsCanceled] = useState(false);

  // Mini-Ally 세션 체크 및 MISO 설계 데이터 로드
  useEffect(() => {
    const fromMiniAlly = searchParams.get('fromMiniAlly') === 'true';
    // Mini-Ally 세션 데이터 로드 (있을 때만 배너/요약 표시)
    const miniAllySession = loadMiniAllySession();
    if (miniAllySession?.projectData) {
      setMiniAllyProjectData(miniAllySession.projectData);
    }
    
    // 항상 MISO 설계 데이터 확인 (새로고침 시에도 데이터 유지)
    const savedMisoDesign = getMisoDesignFromSession();
    if (savedMisoDesign) {
      console.log('📋 MISO Generator - 이전 설계 데이터 발견:', savedMisoDesign);
      setExpectedInput(savedMisoDesign.inputData);
      setExpectedOutput(savedMisoDesign.resultData);
      setDesiredAction(savedMisoDesign.businessLogic);
      setUserExperience(savedMisoDesign.referenceData);
      setMisoAppType(savedMisoDesign.misoAppType === 'agent' ? '챗봇 대화형식' : '단일 결과물 생성');
      
      // agentPrompt가 있으면 프롬프트와 지식도 복원
      if (savedMisoDesign.agentPrompt) {
        setPrompt(savedMisoDesign.agentPrompt);
        setEditablePrompt(savedMisoDesign.agentPrompt);
      }
      if (savedMisoDesign.knowledge) {
        setKnowledge(savedMisoDesign.knowledge);
      }
    }
    
    if (fromMiniAlly) {
      const session = loadMiniAllySession();
      
      if (session) {
        console.log('📊 MISO Generator - Mini-Ally 세션 데이터:', {
          '타겟 사용자': session.projectData.personaProfile,
          '불편함 시점': session.projectData.painPointContext,
          '불편함 이유': session.projectData.painPointReason,
          '핵심 문제': session.projectData.coreProblemStatement,
          '솔루션 이름': session.projectData.solutionNameIdea,
          '솔루션 메커니즘': session.projectData.solutionMechanism,
          '기대 효과': session.projectData.expectedOutcome
        });
        
      } else {
        console.log('⚠️ MISO Generator - Mini-Ally 세션을 찾을 수 없습니다.');
      }
    }
  }, [searchParams]);

  // 여정 랜딩 이벤트
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('journey_ctx');
      const ctx = stored ? JSON.parse(stored) : {};
      const payload = {
        feature_area: 'miso',
        journey_id: journeyId || ctx?.journey_id,
        journey_origin: journeyOrigin || ctx?.journey_origin,
        journey_intent: journeyIntent || ctx?.journey_intent,
      } as const;
      if (payload.journey_id) {
        track('journey_landed', payload);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 폼 유효성 검사
  const canSubmit = () => {
    return expectedInput.trim() && expectedOutput.trim() && desiredAction.trim() && userExperience.trim() && misoAppType.trim();
  };

  // XML 태그로 조합된 쿼리 생성 (워크플로우용)
  const generateQuery = () => {
    return `<input>${expectedInput.trim()}</input><output>${expectedOutput.trim()}</output><action>${desiredAction.trim()}</action><experience>${userExperience.trim()}</experience>`;
  };

  // XML 태그로 조합된 쿼리 생성 (미소 앱용)
  const generateMisoAppQuery = () => {
    return `<inputData>${expectedInput.trim()}</inputData><resultData>${expectedOutput.trim()}</resultData><businessLogic>${desiredAction.trim()}</businessLogic><referenceData>${userExperience.trim()}</referenceData>`;
  };


  const handleMisoAppSubmit = async () => {
    if (!canSubmit()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    // MISO 설계 데이터를 세션에 저장
    const misoDesignData: MisoDesignData = {
      inputData: expectedInput.trim(),
      resultData: expectedOutput.trim(),
      businessLogic: desiredAction.trim(),
      referenceData: userExperience.trim(),
      misoAppType: misoAppType === '챗봇 대화형식' ? 'agent' : 'workflow'
    };
    saveMisoDesignToSession(misoDesignData);

    // 5번 질문이 '단일 결과물 생성'인 경우 워크플로우 생성 로직 실행
    if (misoAppType === '단일 결과물 생성') {
      try {
        const stored = sessionStorage.getItem('journey_ctx');
        const ctx = stored ? JSON.parse(stored) : {};
        const base = {
          feature_area: 'miso',
          journey_id: journeyId || ctx?.journey_id,
          journey_origin: journeyOrigin || ctx?.journey_origin,
          journey_intent: journeyIntent || ctx?.journey_intent,
        } as const;
        track('miso_workflow_run_started', base);
      } catch {}
      const query = generateQuery();
      setIsLoading(true);
      setError(null);
      setExplanation('');
      setFlow([]);
      setFlowYaml('');

      try {
        const result = await misoAPI.runMisoWorkflowWithType(query, 'workflow', null);
        if (result.explanation.startsWith('Error:')) {
          setError(result.explanation);
          try {
            const stored = sessionStorage.getItem('journey_ctx');
            const ctx = stored ? JSON.parse(stored) : {};
            const base = {
              feature_area: 'miso',
              journey_id: journeyId || ctx?.journey_id,
              journey_origin: journeyOrigin || ctx?.journey_origin,
              journey_intent: journeyIntent || ctx?.journey_intent,
            } as const;
            track('miso_workflow_run_failed', base);
          } catch {}
        } else {
          setExplanation(result.explanation);
          if (result.flow) {
            setFlow(result.flow);
          }
          if (result.flowYaml) {
            setFlowYaml(result.flowYaml);
          }
          try {
            const stored = sessionStorage.getItem('journey_ctx');
            const ctx = stored ? JSON.parse(stored) : {};
            const base = {
              feature_area: 'miso',
              journey_id: journeyId || ctx?.journey_id,
              journey_origin: journeyOrigin || ctx?.journey_origin,
              journey_intent: journeyIntent || ctx?.journey_intent,
            } as const;
            track('miso_workflow_run_succeeded', base);
          } catch {}
        }
      } catch (e) {
        setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
        try {
          const stored = sessionStorage.getItem('journey_ctx');
          const ctx = stored ? JSON.parse(stored) : {};
          const base = {
            feature_area: 'miso',
            journey_id: journeyId || ctx?.journey_id,
            journey_origin: journeyOrigin || ctx?.journey_origin,
            journey_intent: journeyIntent || ctx?.journey_intent,
          } as const;
          track('miso_workflow_run_failed', base);
        } catch {}
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 5번 질문이 '챗봇 대화형식'인 경우 기존 미소 앱 생성 로직 실행
    const query = generateMisoAppQuery();
    const appType = misoAppType === '챗봇 대화형식' ? 'agent' : 'workflow';
    
    // 세션에서 Mini-Ally 데이터 확인하여 optional_context 생성
    let optionalContext = null;
    const session = loadMiniAllySession();
    console.log('🔍 MISO App Submit - 세션 체크:', session);
    
    if (session && session.projectData) {
      const pd = session.projectData;
      console.log('📋 MISO App Submit - projectData:', pd);
      optionalContext = `<personaProfile>${pd.personaProfile || ''}</personaProfile><painPointContext>${pd.painPointContext || ''}</painPointContext><painPointReason>${pd.painPointReason || ''}</painPointReason><coreProblemStatement>${pd.coreProblemStatement || ''}</coreProblemStatement><solutionNameIdea>${pd.solutionNameIdea || ''}</solutionNameIdea><solutionMechanism>${pd.solutionMechanism || ''}</solutionMechanism><expectedOutcome>${pd.expectedOutcome || ''}</expectedOutcome>`;
      console.log('🎯 MISO App Submit - optionalContext 생성됨:', optionalContext);
    } else {
      console.log('⚠️ MISO App Submit - 세션 또는 projectData 없음');
    }
    
    setIsLoadingMisoApp(true);
    try {
      const stored = sessionStorage.getItem('journey_ctx');
      const ctx = stored ? JSON.parse(stored) : {};
      const base = {
        feature_area: 'miso',
        journey_id: journeyId || ctx?.journey_id,
        journey_origin: journeyOrigin || ctx?.journey_origin,
        journey_intent: journeyIntent || ctx?.journey_intent,
      } as const;
      track('miso_workflow_run_started', base);
    } catch {}
    setError(null);
    setExplanation('');
    setFlow([]);
    setFlowYaml('');
    setPrompt('');

    try {
      const result = await misoAPI.runMisoWorkflowWithType(query, appType, optionalContext);
      
      // 에러 체크
      if (result.explanation && result.explanation.startsWith('Error:')) {
        setError(result.explanation);
      } else if (result.prompt) {
        // MISO 앱의 경우 prompt가 있음
        setPrompt(result.prompt);
        setEditablePrompt(result.prompt);
        
        // knowledge가 있으면 설정
        if (result.knowledge) {
          setKnowledge(result.knowledge);
        }
        
        // prompt와 knowledge를 세션에 저장
        const updatedMisoDesignData: MisoDesignData = {
          inputData: expectedInput.trim(),
          resultData: expectedOutput.trim(),
          businessLogic: desiredAction.trim(),
          referenceData: userExperience.trim(),
          misoAppType: misoAppType === '챗봇 대화형식' ? 'agent' : 'workflow',
          agentPrompt: result.prompt,
          knowledge: result.knowledge
        };
        saveMisoDesignToSession(updatedMisoDesignData);
        try {
          const stored = sessionStorage.getItem('journey_ctx');
          const ctx = stored ? JSON.parse(stored) : {};
          const base = {
            feature_area: 'miso',
            journey_id: journeyId || ctx?.journey_id,
            journey_origin: journeyOrigin || ctx?.journey_origin,
            journey_intent: journeyIntent || ctx?.journey_intent,
          } as const;
          track('miso_workflow_run_succeeded', base);
        } catch {}
      } else {
        // prompt가 없으면 에러
        setError('MISO 앱 프롬프트를 생성하지 못했습니다.');
        try {
          const stored = sessionStorage.getItem('journey_ctx');
          const ctx = stored ? JSON.parse(stored) : {};
          const base = {
            feature_area: 'miso',
            journey_id: journeyId || ctx?.journey_id,
            journey_origin: journeyOrigin || ctx?.journey_origin,
            journey_intent: journeyIntent || ctx?.journey_intent,
          } as const;
          track('miso_workflow_run_failed', base);
        } catch {}
      }
    } catch (e) {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
      try {
        const stored = sessionStorage.getItem('journey_ctx');
        const ctx = stored ? JSON.parse(stored) : {};
        const base = {
          feature_area: 'miso',
          journey_id: journeyId || ctx?.journey_id,
          journey_origin: journeyOrigin || ctx?.journey_origin,
          journey_intent: journeyIntent || ctx?.journey_intent,
        } as const;
        track('miso_workflow_run_failed', base);
      } catch {}
    } finally {
      setIsLoadingMisoApp(false);
    }
  };

  // 프롬프트 편집 시작
  const handleStartEditPrompt = () => {
    setIsEditingPrompt(true);
  };

  // 프롬프트 편집 저장
  const handleSavePrompt = () => {
    setPrompt(editablePrompt);
    setIsEditingPrompt(false);
    
    // 세션에 수정된 프롬프트 저장
    const updatedMisoDesignData: MisoDesignData = {
      inputData: expectedInput.trim(),
      resultData: expectedOutput.trim(),
      businessLogic: desiredAction.trim(),
      referenceData: userExperience.trim(),
      misoAppType: misoAppType === '챗봇 대화형식' ? 'agent' : 'workflow',
      agentPrompt: editablePrompt
    };
    saveMisoDesignToSession(updatedMisoDesignData);
  };

  // 프롬프트 편집 취소
  const handleCancelEditPrompt = () => {
    setEditablePrompt(prompt);
    setIsEditingPrompt(false);
  };

  // 바이브코딩 설계하기 버튼 클릭 핸들러
  const handleVibeCodingClick = () => {
    // MISO 앱설계 완료 상태 확인
    const isMisoCompleted = prompt || explanation;
    
    if (!isMisoCompleted) {
      // MISO 앱설계가 완료되지 않았으면 확인 모달 띄우기
      setShowSkipConfirmModal(true);
      return;
    }
    
    // MISO 앱설계가 완료되었으면 바로 이동
    proceedToVibeCoding();
  };

  // 바이브코딩으로 이동하는 실제 함수
  const proceedToVibeCoding = () => {
    const fromMiniAlly = searchParams.get('fromMiniAlly') === 'true';
    
    if (fromMiniAlly) {
      router.push('/prd-generator?fromMiniAlly=true&fromMisoGenerator=true');
    } else {
      router.push('/prd-generator?fromMisoGenerator=true');
    }
  };

  // 로딩 취소 핸들러
  const handleCancelProcessing = () => {
    setIsLoading(false);
    setIsLoadingMisoApp(false);
    setIsCanceled(true);
    // 필요 시 진행 중인 요청 AbortController 연결 가능
  };

  // 텍스트에리어 자동 높이 조절 함수
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const lineHeight = 24; // 대략적인 줄 높이
    const minRows = 3;
    const maxRows = 10;
    
    // 높이를 초기화하여 정확한 scrollHeight를 계산
    textarea.style.height = 'auto';
    
    // 줄 수 계산
    const rows = Math.min(Math.max(Math.ceil(textarea.scrollHeight / lineHeight), minRows), maxRows);
    
    // 높이 설정
    textarea.style.height = `${rows * lineHeight}px`;
  };

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* 왼쪽 패널 - 입력 영역 */}
      <div className="w-full lg:w-[40%] h-1/2 lg:h-full bg-[#FAFAFA] flex flex-col">
        {/* 왼쪽 헤더 */}
        <div className="h-auto lg:h-[88px] px-4 lg:px-6 py-4 lg:py-0 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-10 w-10 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
            <h2 className="text-[18px] lg:text-[22px] font-light text-gray-900 tracking-tight">MISO 설계 도우미</h2>
          </div>
        </div>

        {/* 미니엘리 배너는 콘텐츠 헤더 아래로 이동 */}

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-4 lg:px-8 py-8">
            {/* 헤더 */}
            <div className="mb-12">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center flex-shrink-0 border-2 border-gray-200 rounded-xl overflow-hidden">
                  <img 
                    src="/assets/minian-making.png" 
                    alt="Minian의 MISO 설계실" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xl lg:text-2xl font-medium text-gray-900 mb-3">MISO 설계실 ✨</div>
                  <div className="text-[14px] lg:text-[16px] text-gray-600 font-light leading-relaxed">
                  서비스가 어떻게 작동하면 좋을지 알려주세요. 
                  <br /> MISO활용 가이드를 만들어 줄게요!
                  
                  </div>
                </div>
              </div>
              {/* 미니엘리 배너 - 콘텐츠 헤더 아래 */}
              {miniAllyProjectData && (
                <div className="px-0 lg:px-0 py-0 mb-6">
                  <button
                    type="button"
                    onClick={() => setShowMiniAllyInlineSummary(true)}
                    className="w-full group bg-blue-50/60 hover:bg-blue-50 rounded-2xl p-4 flex items-center justify-between border border-blue-100 hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white overflow-hidden border border-blue-200 flex-shrink-0">
                        <img
                          src="/assets/mini_ally_default.png"
                          alt="Mini Ally"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-blue-800">
                        미니 앨리와 정리한 내용 확인하기
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 설문 폼 */}
            <div className="space-y-10">
              {/* 1. 예상 입력 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">1</span>
                  </div>
                                     <div className="flex-1">
                     <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                      사용자는 처음에 무엇을 입력하나요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 font-light">
                      👉 서비스 시작할 때 입력하는 내용
                      </span>
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={expectedInput}
                        onChange={(e) => {
                          setExpectedInput(e.target.value);
                          handleTextareaResize(e);
                        }}
                        placeholder="예: 이름 입력, 상품 검색, 위치 선택, 사진 업로드"
                        rows={3}
                        className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none font-light"
                        disabled={isLoading}
                        style={{ minHeight: '72px', maxHeight: '240px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setExpectedInput('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 예상 출력 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">2</span>
                  </div>
                                     <div className="flex-1">
                     <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                      서비스를 통해 무엇을 받게 되나요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 font-light">
                      👉 사용자가 얻게 되는 &apos;최종 결과&apos;
                      </span>
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={expectedOutput}
                        onChange={(e) => {
                          setExpectedOutput(e.target.value);
                          handleTextareaResize(e);
                        }}
                        placeholder="예: 추천 상품 목록, 날씨 정보, 분석 결과, 번역문"
                        rows={3}
                        className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none font-light"
                        disabled={isLoading}
                        style={{ minHeight: '72px', maxHeight: '240px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setExpectedOutput('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 원하는 동작 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">3</span>
                  </div>
                                     <div className="flex-1">
                     <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                        그 결과를 만들기 위해 서비스는 어떤 기능이 필요한가요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 font-light">
                      👉 서비스가 자동으로 처리하는 일
                      </span>
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={desiredAction}
                        onChange={(e) => {
                          setDesiredAction(e.target.value);
                          handleTextareaResize(e);
                        }}
                        placeholder="예: 입력 분석, 조건에 맞는 결과 검색, 이미지 변환"
                        rows={3}
                        className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none font-light"
                        disabled={isLoading}
                        style={{ minHeight: '72px', maxHeight: '240px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setDesiredAction('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. 참조 데이터 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">4</span>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                        서비스가 참고해야 하는 자료는 무엇인가요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 font-light">
                        👉 결과를 만들 때 반드시 근거로 삼아야 하는 자료나 규칙
                      </span>
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={userExperience}
                        onChange={(e) => {
                          setUserExperience(e.target.value);
                          handleTextareaResize(e);
                        }}
                        placeholder="예: 사내 규정 문서, 제품 매뉴얼, 고객 응대 가이드"
                        rows={3}
                        className="w-full px-0 py-2 text-base border-0 border-b border-gray-200 focus:border-black focus:outline-none transition-colors bg-transparent resize-none font-light"
                        disabled={isLoading}
                        style={{ minHeight: '72px', maxHeight: '240px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setUserExperience('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. 서비스 경험 형식 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-medium text-gray-600">5</span>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-4">
                      <span className="text-base lg:text-lg font-medium text-gray-900 leading-relaxed">
                        서비스를 어떤 형식으로 이용하나요?
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <div className="space-y-4">
                      {/* 대화형식 선택 */}
                      <div 
                        className={cn(
                          "border-2 rounded-xl p-4 cursor-pointer transition-all",
                          misoAppType === '챗봇 대화형식' 
                            ? "border-blue-300 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setMisoAppType('챗봇 대화형식')}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                            misoAppType === '챗봇 대화형식'
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          )}>
                            {misoAppType === '챗봇 대화형식' && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">💬</span>
                              <span className="font-medium text-gray-900">챗봇 대화형식</span>
                            </div>
                            <p className="text-sm text-gray-600 font-light">
                              사용자와 AI가 대화를 통해 결과물이 제공되는 방식입니다.<br />
                              질문에 대한 답변 후 추가 질문이 이어집니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 보고서 형식 선택 */}
                      <div 
                        className={cn(
                          "border-2 rounded-xl p-4 cursor-pointer transition-all",
                          misoAppType === '단일 결과물 생성' 
                            ? "border-blue-300 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => {
                          setMisoAppType('단일 결과물 생성');
                          setShowWorkflowGuideModal(true);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                            misoAppType === '단일 결과물 생성'
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          )}>
                            {misoAppType === '단일 결과물 생성' && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">📄</span>
                              <span className="font-medium text-gray-900">단일 결과물 생성</span>
                            </div>
                            <p className="text-sm text-gray-600 font-light">
                              사용자가 하나의 완성된 결과물을 받는 방식입니다.<br />
                              분석 보고서, 정리된 문서 등을 생성합니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMisoAppType('잘 모르겠습니다')}
                        className="text-sm text-gray-500 hover:text-black transition-colors font-light"
                      >
                        잘 모르겠어요 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 에러 표시 */}
            {error && (
              <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-1">문제가 발생했습니다</p>
                <p className="text-xs text-red-600 font-light">{error}</p>
              </div>
            )}
          </div>

          {/* 하단 고정 버튼 */}
          <div className="bg-white border-t border-gray-100 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-light">
                {[expectedInput, expectedOutput, desiredAction, userExperience, misoAppType].filter(v => v.trim().length > 0).length}/5 질문 답변 완료
              </span>
              <Button 
                onClick={handleMisoAppSubmit}
                disabled={isLoading || isLoadingMisoApp || !canSubmit()}
                className={cn(
                  "text-[14px] lg:text-[16px] px-6 py-3 rounded-md transition-all font-medium",
                  canSubmit() && !isLoading && !isLoadingMisoApp
                    ? "bg-gray-900 hover:bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {(isLoading || isLoadingMisoApp) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>설계 중...</span>
                  </div>
                ) : (
                  <span>미소 앱 설계하기</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 패널 - 결과 영역 */}
      <div className="w-full lg:w-[60%] h-1/2 lg:h-full bg-white border-l lg:border-l border-t lg:border-t-0 border-gray-100 flex flex-col">
        {/* 헤더 */}
        <div className="h-auto lg:h-[88px] px-4 lg:px-6 py-4 lg:py-0 flex items-center justify-between border-b border-gray-100">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-[16px] lg:text-[18px] font-medium text-gray-900">MISO 앱 설계</h2>
              {(() => {
               const savedDesign = getMisoDesignFromSession();
               const misoAppType = savedDesign?.misoAppType;
               if (misoAppType === 'agent') {
                 return <span className="px-2 py-0.5 text-[10px] lg:text-[11px] font-medium bg-red-100 text-red-700 rounded-full">Agent</span>;
               } else if (misoAppType === 'workflow') {
                 return <span className="px-2 py-0.5 text-[10px] lg:text-[11px] font-medium bg-green-100 text-green-700 rounded-full">Workflow</span>;
               }
               return null;
             })()}
            </div>
          </div>
          {(() => {
            const savedDesign = getMisoDesignFromSession();
            const isWorkflowType = savedDesign?.misoAppType === 'workflow';
            
            if (isWorkflowType && explanation) {
              // 워크플로우 타입이고 결과가 있을 때 v0 연결 버튼 표시
              return (
                <Button
                  onClick={() => setShowV0GuideModal(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  워크플로우를 v0에 연결해 보고 싶으신가요?
                </Button>
              );
            } else if (!isWorkflowType) {
              // 에이전트 타입일 때만 바이브코딩 버튼 표시
              return (
                <Button
                  onClick={handleVibeCodingClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  바이브코딩 설계하기
                </Button>
              );
            }
            return null;
          })()}
        </div>
         
        {/* 결과 영역 */}
        <div className="flex-1 overflow-hidden">

            {(isLoading || isLoadingMisoApp) && (
              <div className="h-full flex flex-col items-center justify-center px-8">
                <div className="w-28 h-28 mb-6 rounded-full overflow-hidden border border-blue-100 shadow-sm flex items-center justify-center">
                  <img
                    src="/assets/miso_processing_realtime.gif"
                    alt={isLoadingMisoApp ? '미소 앱 설계 로딩' : '워크플로우 설계 로딩'}
                    className="w-full h-full object-cover"
                  />
                </div>
               <div className="text-center max-w-md">
                 <h3 className="text-[18px] lg:text-[20px] font-medium text-gray-900 mb-3">
                   {isLoadingMisoApp ? '🎨 미소 앱을 설계하고 있습니다' : '⚙️ 워크플로우를 설계하고 있습니다'}
                 </h3>
                 <p className="text-[14px] lg:text-[15px] text-gray-600 font-light leading-relaxed mb-4">
                   {isLoadingMisoApp ? (
                     <>
                       AI가 입력하신 정보를 분석하여<br />
                       최적의 미소 앱 프롬프트를 생성하고 있습니다.
                     </>
                   ) : (
                     <>
                       AI가 입력하신 정보를 분석하여<br />
                       맞춤형 워크플로우를 설계하고 있습니다.
                     </>
                   )}
                 </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                   <div className="flex gap-1">
                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                   </div>
                   <span className="text-[12px] text-blue-700 font-medium">
                     최대 3분 정도 소요될 수 있습니다
                   </span>
                 </div>
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelProcessing}
                      className="px-4 py-2 text-sm border-gray-300 hover:bg-gray-100"
                    >
                      취소
                    </Button>
                  </div>
               </div>
             </div>
           )}

          {!isLoading && !isLoadingMisoApp && !explanation && !prompt && !error && (
            <div className="h-full px-6 py-8 min-h-0">
              <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0`}>
                {/* 왼쪽: 미니 앨리 요약 (열렸을 때만 렌더링) */}
                {showMiniAllyInlineSummary && miniAllyProjectData ? (
                  <div className="order-2 xl:order-1 border border-blue-100 bg-blue-50/40 rounded-xl p-4 h-full min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-blue-900 font-medium">미니 앨리 요약</div>
                        <button
                          type="button"
                          onClick={() => setShowMiniAllyInlineSummary(false)}
                          className="p-1 rounded hover:bg-blue-100 transition-colors"
                          aria-label="닫기"
                        >
                          <X className="w-4 h-4 text-blue-700" />
                        </button>
                      </div>
                      <div className="space-y-3 text-[14px] text-gray-800">
                        {miniAllyProjectData.personaProfile && (
                          <div>
                            <div className="text-gray-600 text-xs mb-1">타겟 사용자</div>
                            <div className="bg-white rounded-md border border-blue-100 p-3">{miniAllyProjectData.personaProfile}</div>
                          </div>
                        )}
                        {miniAllyProjectData.painPointContext && (
                          <div>
                            <div className="text-gray-600 text-xs mb-1">문제 상황</div>
                            <div className="bg-white rounded-md border border-blue-100 p-3">{miniAllyProjectData.painPointContext}</div>
                          </div>
                        )}
                        {miniAllyProjectData.painPointReason && (
                          <div>
                            <div className="text-gray-600 text-xs mb-1">문제의 원인</div>
                            <div className="bg-white rounded-md border border-blue-100 p-3">{miniAllyProjectData.painPointReason}</div>
                          </div>
                        )}
                        {miniAllyProjectData.coreProblemStatement && (
                          <div>
                            <div className="text-gray-600 text-xs mb-1">핵심 문제</div>
                            <div className="bg-white rounded-md border border-blue-100 p-3 font-medium">{miniAllyProjectData.coreProblemStatement}</div>
                          </div>
                        )}
                        {miniAllyProjectData.solutionNameIdea && (
                          <div>
                            <div className="text-gray-600 text-xs mb-1">아이디어 이름</div>
                            <div className="bg-white rounded-md border border-blue-100 p-3">{miniAllyProjectData.solutionNameIdea}</div>
                          </div>
                        )}
                        {miniAllyProjectData.solutionMechanism && (
                          <div>
                            <div className="text-gray-600 text-xs mb-1">작동 방식</div>
                            <div className="bg-white rounded-md border border-blue-100 p-3">{miniAllyProjectData.solutionMechanism}</div>
                          </div>
                        )}
                        {miniAllyProjectData.expectedOutcome && (
                          <div>
                            <div className="text-gray-600 text-xs mb-1">기대 효과</div>
                            <div className="bg-white rounded-md border border-blue-100 p-3">{miniAllyProjectData.expectedOutcome}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 오른쪽: 분석 결과 안내 영역 (항상 렌더링, 닫히면 전체 확장) */}
                <div className={`order-1 xl:order-2 ${showMiniAllyInlineSummary && miniAllyProjectData ? 'xl:col-span-1' : 'xl:col-span-2'} flex flex-col items-center justify-center text-center px-6 border border-dashed border-gray-200 rounded-xl`}>
                  <div className="w-40 h-40 lg:w-48 lg:h-48 mx-auto mb-6 p-2">
                    <img
                      src="/assets/minian-drawing.png"
                      alt="MISO Minian"
                      className="w-full h-full object-contain object-center"
                    />
                  </div>
                  <h3 className="text-[20px] lg:text-[24px] font-light text-gray-900 mb-3 text-center">
                    분석 결과가 여기에 표시됩니다
                  </h3>
                  <p className="text-[14px] lg:text-[16px] text-gray-500 leading-relaxed font-light text-center">
                    왼쪽 질문에 답변해주시면<br />
                    맞춤형 워크플로우를 설계해드립니다
                  </p>
                </div>
              </div>
            </div>
          )}

           {!isLoading && !isLoadingMisoApp && error && (
             <div className="h-full flex flex-col items-center justify-center text-center px-8">
               <div className="w-32 h-32 mx-auto mb-6">
                 <img
                   src="/assets/mini-kyle-miso-error.png"
                   alt="MISO Kyle Error"
                   className="w-full h-full object-contain"
                 />
               </div>
               <div className="max-w-sm">
                 <h3 className="text-base font-medium text-red-800 mb-2">
                   분석에 실패했습니다
                 </h3>
                 <p className="text-sm text-red-600 font-light">
                   다시 시도하거나 질문을 더 구체적으로 작성해보세요
                 </p>
               </div>
             </div>
           )}

          {explanation && (
            <div className="h-full overflow-y-auto">
              <div className="mx-auto px-4 lg:px-8 py-8 space-y-6">
                {/* 설명 섹션 */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="mb-4">
                    <p className="text-[12px] lg:text-[13px] text-gray-600 leading-relaxed flex items-center gap-1.5 flex-wrap">
                      <span className="text-gray-500">MISO에 로그인 하신 뒤</span>
                      <span className="font-medium bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">플레이그라운드</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">앱 만들기</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">새로 만들기</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium bg-green-50 border border-green-300 text-green-700 px-2 py-0.5 rounded">워크플로우</span>
                      <span className="text-gray-700">에서 아래 내용을 참조하여 구현하세요</span>
                    </p>
                  </div>
                  <div className="prose prose-sm max-w-none text-[14px] lg:text-[16px] font-light leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-5 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4 first:mt-0">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="my-3 space-y-1 list-disc ml-4 pl-2">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-700 leading-relaxed">
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {explanation}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* YAML 워크플로우 시각화 섹션 */}
                {flowYaml && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <YamlWorkflowVisualizer yamlContent={flowYaml} />
                  </div>
                )}
                
                {/* 워크플로우 시각화 */}
                {flow.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <WorkflowVisualization flow={flow} explanation={explanation} />
                  </div>
                )}
              </div>
            </div>
          )}

          {prompt && (
            <div className="h-full overflow-y-auto">
              <div className="h-full flex gap-6 p-6">
                {/* 좌측: 프롬프트 영역 (2/3) */}
                <div className="flex-[2] min-w-0 overflow-hidden">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-gray-900">
                          미소 앱 프롬프트
                        </h3>
                        <div className="relative">
                          <button
                            onClick={() => setShowPromptTooltip(!showPromptTooltip)}
                            onMouseEnter={() => setShowPromptTooltip(true)}
                            onMouseLeave={() => setShowPromptTooltip(false)}
                            className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 hover:border-gray-600 hover:text-gray-600 flex items-center justify-center text-xs"
                          >
                            ?
                          </button>
                          {showPromptTooltip && (
                            <div className="absolute right-0 lg:left-0 lg:right-auto top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                              <div className="relative">
                                <div className="absolute -top-5 right-2 lg:left-2 lg:right-auto w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-gray-900"></div>
                                MISO 에이전트의 프롬프트 영역에 아래와 같이 프롬프트를 작성해 주세요. <br />
                                필요한 경우 우측의 &apos;수정하기&apos; 버튼으로 프롬프트를 바로 수정할 수 있습니다.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditingPrompt ? (
                          <>
                            <button
                              onClick={() => setShowPromptGuideModal(true)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              프롬프트 작성 가이드
                            </button>
                            <button
                              onClick={handleStartEditPrompt}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              수정하기
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(prompt);
                                // 복사 완료 피드백
                                const button = document.getElementById('copy-btn');
                                if (button) {
                                  const originalText = button.textContent;
                                  button.textContent = '✓ 복사됨';
                                  button.classList.add('bg-green-100', 'text-green-700');
                                  setTimeout(() => {
                                    button.textContent = originalText || '';
                                    button.classList.remove('bg-green-100', 'text-green-700');
                                  }, 2000);
                                }
                              }}
                              id="copy-btn"
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              복사
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleCancelEditPrompt}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              취소
                            </button>
                            <button
                              onClick={handleSavePrompt}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              저장하기
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                      {isEditingPrompt ? (
                        <textarea
                          value={editablePrompt}
                          onChange={(e) => setEditablePrompt(e.target.value)}
                          className="w-full h-full p-4 text-gray-700 text-sm leading-relaxed border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      ) : (
                        <div className="h-full overflow-y-auto p-4 border border-gray-200 rounded-lg">
                          <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed break-words">
                            {prompt}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 우측: 지식 및 도구 영역 (1/3) */}
                <div className="flex-[1] min-w-0 overflow-hidden">
                  <div className="space-y-4">
                    {/* 지식 영역 */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200 h-80">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-gray-900">
                            참조할 지식
                          </h3>
                          <div className="relative">
                            <button
                              onClick={() => setShowKnowledgeTooltip(!showKnowledgeTooltip)}
                              onMouseEnter={() => setShowKnowledgeTooltip(true)}
                              onMouseLeave={() => setShowKnowledgeTooltip(false)}
                              className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 hover:border-gray-600 hover:text-gray-600 flex items-center justify-center text-xs"
                            >
                              ?
                            </button>
                            {showKnowledgeTooltip && (
                              <div className="absolute right-0 lg:left-0 lg:right-auto top-6 z-10 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                <div className="relative">
                                  <div className="absolute -top-5 right-2 lg:left-2 lg:right-auto w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-gray-900"></div>
                                  MISO 에이전트가 답변을 하기 위해 반드시 참조해야하는 문서(데이터)를 참조할 지식에 설정해 주어야 합니다.<br />
                                  참조할 지식 설정 방법은 &apos;지식 업로드 가이드&apos;를 확인해 주세요.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowKnowledgeGuideModal(true)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          지식 업로드 가이드
                        </button>
                      </div>
                      {knowledge ? (
                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {knowledge}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          지식 영역은 현재 구현 중입니다.
                        </div>
                      )}
                    </div>
                    
                    {/* 도구 영역 */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200 h-80">
                      <h3 className="text-base font-medium text-gray-900 mb-4">
                        도구
                      </h3>
                      <div className="text-gray-500 text-sm">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MISO 스킵 확인 모달 */}
      <MisoSkipConfirmModal
        isOpen={showSkipConfirmModal}
        onClose={() => setShowSkipConfirmModal(false)}
        onConfirm={proceedToVibeCoding}
        onCancel={() => {}}
      />
      
      {/* v0 연결 가이드 모달 */}
      {showV0GuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">v0와 워크플로우 연결하기</h2>
              <button
                onClick={() => setShowV0GuideModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  공유 받으신 노션에서 <strong>&quot;[해커톤] MISO와 v0 연결&quot;</strong> 문서를 참조하셔서 구현한 워크플로우와 v0를 연동하는 가이드를 확인하실 수 있습니다.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>📍 문서 위치:</strong>
                </p>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <p className="text-sm text-gray-700 font-mono">
                    [해커톤] 해커 리모트 플레이그라운드 → 해커톤 툴 사용 꿀팁 → <strong>[해커톤] MISO와 v0 연결</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowV0GuideModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 워크플로우 구현 가이드 모달 */}
      {showWorkflowGuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">워크플로우 구현 가이드</h2>
              <button
                onClick={() => setShowWorkflowGuideModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed mb-3">
                  미소 워크플로우 구현이 처음이시라면 먼저 영상을 통해 학습하신 뒤 시작해 보시는 것을 강력히 추천드립니다.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <a 
                    href="https://gs52g.goorm.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    gs52g.goorm.io
                  </a>
                  에서 워크플로우 구현 가이드 영상을 보실 수 있습니다.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>📍 가이드 영상 위치:</strong>
                </p>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <p className="text-sm text-gray-700 font-mono">
                    <a 
                      href="https://gs52g.goorm.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      gs52g.goorm.io
                    </a>
                    {' → '}
                    <strong>나도 이제 MISO 전문가!</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowWorkflowGuideModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 프롬프트 작성 가이드 모달 */}
      {showPromptGuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">프롬프트 작성 가이드</h2>
              <button
                onClick={() => setShowPromptGuideModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>📍 가이드 위치:</strong>
                </p>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <p className="text-sm text-gray-700 font-mono">
                    <strong>MISO</strong> → <strong>학습하기</strong> → <strong>미소 학습하기</strong> → <strong>프롬프트 작성 가이드</strong>
                  </p>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  위의 문서에서 자세한 프롬프팅 방법을 확인해 보실 수 있습니다.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowPromptGuideModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 지식 업로드 가이드 모달 */}
      {showKnowledgeGuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">지식 업로드 가이드</h2>
              <button
                onClick={() => setShowKnowledgeGuideModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>📍 가이드 위치:</strong>
                </p>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <p className="text-sm text-gray-700 font-mono">
                    <strong>MISO</strong> → <strong>학습하기</strong> → <strong>6. 지식</strong> → <strong>지식 구성하기</strong>
                  </p>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                위의 문서에서 자세한 프롬프팅 방법을 확인해 보실 수 있습니다.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowKnowledgeGuideModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MisoGeneratorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <MisoGeneratorContent />
    </Suspense>
  );
}