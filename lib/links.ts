// 외부 링크 관리
export const EXTERNAL_LINKS = {
  // v0 관련 링크
  V0_INTRODUCTION_GUIDE: 'https://gsholdings.notion.site/link1-24cf800bd1c180738c24fa11b1ac975d?source=copy_link',
  V0_DOCUMENT_UPLOAD_GUIDE: 'https://gsholdings.notion.site/link2-24cf800bd1c1800095b9d25cead70944?source=copy_link',
  // MISO 관련 링크
  PROMPT_WRITING_GUIDE: 'https://miso-52g.gitbook.io/miso-manual/study/prompt',
  KNOWLEDGE_UPLOAD_GUIDE: 'https://miso-52g.gitbook.io/miso-manual/manual/6./build-knowledge',
} as const;

// 링크 타입 정의
export type ExternalLinkKeys = keyof typeof EXTERNAL_LINKS; 