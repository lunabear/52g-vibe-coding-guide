// 외부 링크 관리
export const EXTERNAL_LINKS = {
  // v0 관련 링크
  V0_INTRODUCTION_GUIDE: 'https://www.notion.so/gsholdings/v0-22cf800bd1c180cb98e3cd0cdcf00a7f?source=copy_link#22cf800bd1c18091af9df33e41300a11',
  V0_DOCUMENT_UPLOAD_GUIDE: 'https://www.notion.so/gsholdings/v0-22cf800bd1c180cb98e3cd0cdcf00a7f?source=copy_link#22cf800bd1c180368788e44bc7d430a3',
} as const;

// 링크 타입 정의
export type ExternalLinkKeys = keyof typeof EXTERNAL_LINKS; 