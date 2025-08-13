// 외부 링크 관리
export const EXTERNAL_LINKS = {
  // v0 관련 링크
  V0_INTRODUCTION_GUIDE: 'https://www.notion.so/gsholdings/v0-24ef800bd1c1802abf33f71d0cdc6e02?v=247f800bd1c18151a819000cad02fcd8&source=copy_link#24ef800bd1c180579ad9f4a67ff8174c',
  V0_DOCUMENT_UPLOAD_GUIDE: 'https://www.notion.so/gsholdings/v0-24ef800bd1c1802abf33f71d0cdc6e02?v=247f800bd1c18151a819000cad02fcd8&source=copy_link#24ef800bd1c180579ad9f4a67ff8174c',
  // MISO 관련 링크
  PROMPT_WRITING_GUIDE: 'https://miso-52g.gitbook.io/miso-manual/study/prompt',
  KNOWLEDGE_UPLOAD_GUIDE: 'https://miso-52g.gitbook.io/miso-manual/manual/6./build-knowledge',
} as const;

// 링크 타입 정의
export type ExternalLinkKeys = keyof typeof EXTERNAL_LINKS; 