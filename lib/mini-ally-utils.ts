interface ProjectData {
  personaProfile: string | null;
  painPointContext: string | null;
  painPointReason: string | null;
  coreProblemStatement: string | null;
  solutionNameIdea: string | null;
  solutionMechanism: string | null;
  expectedOutcome: string | null;
}

interface MisoDesignData {
  inputData: string;
  resultData: string;
  businessLogic: string;
  referenceData: string;
  misoAppType: 'agent' | 'workflow';
  agentPrompt?: string;
}

interface MiniAllySession {
  type: 'miniAlly';
  timestamp: string;
  projectData: ProjectData;
  step: 'expert-questions' | 'prd-result' | 'miso-design';
  expertAnswers?: Array<{
    question: string;
    answer: string;
    expert: 'planner' | 'designer' | 'developer';
  }>;
  misoDesign?: MisoDesignData;
}

/**
 * ProjectData를 miso API용 context 형태로 변환
 */
export function convertProjectDataToContext(projectData: ProjectData): Record<string, string> {
  return {
    'target-user': projectData.personaProfile || '',
    'pain-moment': projectData.painPointContext || '',
    'pain-reason': projectData.painPointReason || '',
    'core-problem': projectData.coreProblemStatement || '',
    'solution-name': projectData.solutionNameIdea || '',
    'solution-mechanism': projectData.solutionMechanism || '',
    'expected-outcome': projectData.expectedOutcome || ''
  };
}

/**
 * SessionStorage에 mini-ally 세션 저장
 */
export function saveMiniAllySession(projectData: ProjectData, step: MiniAllySession['step'] = 'expert-questions') {
  const session: MiniAllySession = {
    type: 'miniAlly',
    timestamp: new Date().toISOString(),
    projectData,
    step
  };
  
  sessionStorage.setItem('prdSession', JSON.stringify(session));
}

/**
 * SessionStorage에서 mini-ally 세션 불러오기
 */
export function loadMiniAllySession(): MiniAllySession | null {
  try {
    const sessionData = sessionStorage.getItem('prdSession');
    if (!sessionData) return null;
    
    const session: MiniAllySession = JSON.parse(sessionData);
    
    // 타입 및 유효성 검사
    if (session.type !== 'miniAlly' || !session.projectData || !session.timestamp) {
      return null;
    }
    
    // 24시간 이내 데이터만 유효
    const timeDiff = Date.now() - new Date(session.timestamp).getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) {
      clearMiniAllySession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to load mini-ally session:', error);
    clearMiniAllySession();
    return null;
  }
}

/**
 * mini-ally 세션에 전문가 답변 업데이트
 */
export function updateMiniAllySessionAnswers(expertAnswers: MiniAllySession['expertAnswers']) {
  const session = loadMiniAllySession();
  if (!session) return;
  
  session.expertAnswers = expertAnswers;
  session.timestamp = new Date().toISOString();
  
  sessionStorage.setItem('prdSession', JSON.stringify(session));
}

/**
 * mini-ally 세션 단계 업데이트
 */
export function updateMiniAllySessionStep(step: MiniAllySession['step']) {
  const session = loadMiniAllySession();
  if (!session) return;
  
  session.step = step;
  session.timestamp = new Date().toISOString();
  
  sessionStorage.setItem('prdSession', JSON.stringify(session));
}

/**
 * SessionStorage에서 mini-ally 세션 삭제
 */
export function clearMiniAllySession() {
  sessionStorage.removeItem('prdSession');
}

/**
 * 세션이 mini-ally 타입인지 확인
 */
export function isMiniAllySession(): boolean {
  const session = loadMiniAllySession();
  return session !== null;
}

/**
 * 세션의 경과 시간을 사용자 친화적 형태로 반환
 */
export function getSessionTimeAgo(session: MiniAllySession): string {
  const timeDiff = Date.now() - new Date(session.timestamp).getTime();
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return '방금 전';
  }
}

/**
 * MISO 설계 데이터를 세션에 저장
 */
export function saveMisoDesignToSession(misoDesignData: MisoDesignData) {
  const session = loadMiniAllySession();
  if (session) {
    // 기존 mini-ally 세션이 있으면 업데이트
    session.misoDesign = misoDesignData;
    session.timestamp = new Date().toISOString();
    sessionStorage.setItem('prdSession', JSON.stringify(session));
  } else {
    // MISO 설계만 있는 세션 생성
    const newSession = {
      type: 'miso',
      timestamp: new Date().toISOString(),
      misoDesign: misoDesignData
    };
    sessionStorage.setItem('prdSession', JSON.stringify(newSession));
  }
}

/**
 * 세션에서 MISO 설계 데이터 가져오기
 */
export function getMisoDesignFromSession(): MisoDesignData | null {
  try {
    const sessionData = sessionStorage.getItem('prdSession');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    return session.misoDesign || null;
  } catch (error) {
    console.error('Failed to get MISO design from session:', error);
    return null;
  }
}

export type { ProjectData, MiniAllySession, MisoDesignData };