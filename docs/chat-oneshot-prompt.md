아래 지시를 그대로 수행하여 Next.js App Router 기반의 `MISO` 채팅 페이지(`/chat`)와 관련 API 연동을 완성하세요. 모든 코드는 TypeScript로 작성하고, 스타일은 Tailwind CSS 유틸리티 클래스만 사용하며, 가능한 모든 UI 요소에 shadcn/ui 컴포넌트를 사용합니다. 컴포넌트는 반드시 Client Component(`"use client"`)로 작성합니다. 접근성 준수, 반응형 동작, 에러 처리, UX 디테일까지 구현합니다.

## 목표
- /chat 화면에서 사용자가 텍스트 메시지와 이미지 파일을 이용해 MISO와 채팅할 수 있습니다.
- 대화 목록 조회/선택/생성, 대화 이름 변경, 대화 삭제가 가능합니다.
- MISO Agent API와 스트리밍(SSE)으로 연동하여 보조 응답을 실시간으로 표기합니다.
- 이미지 드래그앤드롭/파일선택/붙여넣기 업로드, 업로드 진행 상태, 썸네일 미리보기와 확대 미리보기가 가능합니다.
- 보조 응답 내 `[ACTION:generate_prd]...[/ACTION]`, `[ACTION:generate_miso]...[/ACTION]` 형식의 액션 버튼을 파싱/렌더링하고, 클릭 시 MISO Summary 모달과 연동하여 다음 단계로 진입합니다.
- 모바일/데스크톱 반응형 레이아웃과 자연스러운 전환, 키보드 조작(Enter 전송, Shift+Enter 줄바꿈), 메시지 복사, 토스트 안내 등 섬세한 UX를 제공합니다.

## 기술 스택 및 규칙
- 프레임워크: Next.js App Router
- 언어: TypeScript (모든 props/state/함수 인자에 명시적 타입)
- 스타일: Tailwind CSS만 사용 (inline styles/CSS Modules 금지)
- UI: shadcn/ui 컴포넌트 사용 (Button, Card, Input, Textarea, Dialog, DropdownMenu, ScrollArea 등)
- 아이콘: lucide-react
- Markdown 렌더링: react-markdown + remark-gfm
- 접근성: 시맨틱 태그, 아이콘 버튼에 `aria-label`/`title` 제공

## 타입 정의
다음 타입을 기반으로 구현하세요.

```ts
type ChatRole = 'user' | 'assistant';

type AttachedFile = {
  id: string;
  name: string;
  size: number;
  type: string; // MIME
  uploadedId?: string; // MISO 업로드 ID
  url?: string; // 미리보기 DataURL
  isUploading?: boolean;
};

type Message = {
  id: string;
  content: string;
  role: ChatRole;
  timestamp: Date;
  isStreaming?: boolean; // 보조 응답 스트리밍 표시
  attachments?: AttachedFile[]; // user 메시지의 첨부 썸네일
};

type Conversation = {
  id: string;
  name: string;
  updatedAt: Date;
};

type ProjectData = {
  personaProfile: string;
  painPointContext: string;
  painPointReason: string;
  coreProblemStatement: string;
  solutionNameIdea: string;
  solutionMechanism: string;
  expectedOutcome: string;
};
```

## 환경 변수
다음 환경 변수를 서버/클라이언트 브리지 API에서 사용합니다.
- `MISO_AGENT_ENDPOINT` (예: `https://api.miso.ai/agent`)
- `MISO_AGENT_API_KEY` (Bearer)

## API 계약 (Next.js Route Handlers)
모든 서버 라우트는 Next.js App Router의 `app/api/**/route.ts`로 구현하고, 클라이언트는 반드시 이 내부 API를 통해 호출합니다.

- `POST /api/chat`
  - Body: `{ query?: string, conversationId?: string, userId: string, files?: Array<{ type: 'image', transfer_method: 'local_file', upload_file_id: string }> }`
  - 동작: MISO `/chat`로 프록시, `mode: 'streaming'`, `auto_gen_name: true`. 텍스트 없이 파일만 있을 경우 `query`는 `"이미지 내용을 분석해줘."`로 대체. 응답은 SSE 스트림을 그대로 중계(`Content-Type: text/event-stream`).
  - SSE 이벤트 처리 기준: `agent_message`(append), `message_replace`(replace). 초기에 `conversation_id` 수신 시 현재 대화 ID로 반영.

- `GET /api/chat?userId=...&lastId=...&limit=...`
  - 동작: MISO `/conversations` 프록시. 정렬은 `-updated_at` 기본. 결과를 `{ data }` 그대로 반환.

- `GET /api/messages?conversationId=...&userId=...&firstId=...&limit=...`
  - 동작: MISO `/messages` 프록시. 최신순으로 오는 결과를 오래된 순으로 정렬하여, 각 항목의 `query`를 user 메시지, `answer`를 assistant 메시지로 분해해 `{ messages }` 배열로 반환.

- `POST /api/files/upload`
  - 동작: MISO `/files/upload`로 멀티파트 업로드. 응답의 `id`만 프런트에 전달해 이후 `files[]` 페이로드에 `upload_file_id`로 사용.

- `DELETE /api/conversations/[conversationId]`
  - Body: `{ userId: string }`
  - 동작: MISO `/conversations/{id}` 삭제.

- `POST /api/conversations/[conversationId]`
  - Body: `{ userId: string, name: string }`
  - 동작: MISO `/conversations/{id}/rename` 호출(내부 구현에서 `auto_generate: false`).

- `POST /api/miso/mini-ally-summary`
  - Body: `{ documentType: 'chat', currentContent: string, fixRequest: 'mini_ally_summary' }`
  - 응답: `ProjectData`와 동일한 스키마 필드 포함. 실패 시 에러 JSON.

## UI/UX 사양
- 레이아웃
  - 좌측: 사이드바(대화 목록), 우측: 메인 채팅 영역. 모바일에서는 사이드바가 오버레이로 동작하며, 디폴트 숨김.
  - 상단 헤더: 아바타/타이틀, 모바일 홈 버튼. 사이드바 헤더에는 뒤로가기, 타이틀("대화 목록"), 새 대화 버튼(+), 모바일 닫기(X).

- 사이드바(대화 목록)
  - 대화 항목 클릭 시 해당 대화 선택 및 메시지 로드.
  - 각 항목 우측의 메뉴: 이름 변경, 삭제.
  - 이름 변경: Dialog(Input + 확인/취소).
  - 삭제: 파괴적 액션 Dialog(되돌릴 수 없음 안내).
  - 하단 액션 카드 2종
    - "MISO 설계하기": `[ACTION:generate_miso]` 트리거
    - "바이브코딩 설계하기": `[ACTION:generate_prd]` 트리거

- 메인 채팅 영역
  - 빈 상태: 시간대별 인삿말과 가이드 문구를 한국어로 표기, 소개 일러스트 노출.
  - 메시지 리스트: ScrollArea로 스크롤, 사용자 메시지는 우측 정렬 검정 버블, 보조 응답은 좌측 아바타 + Markdown 렌더링.
  - Markdown 렌더링: `react-markdown` + `remark-gfm` 사용. 제목, 목록, 코드블록, 인라인코드, blockquote에 Tailwind 클래스를 커스텀 적용.
  - 보조 응답에 포함된 `[ACTION:...]...[/ACTION]` 구문을 파싱하여 인라인 액션 카드로 렌더. 클릭 시 MISO Summary 흐름으로 진입.
  - 각 메시지 우측 상단에 복사 버튼(툴팁/aria 포함). 클릭 시 클립보드 복사 및 토스트.

- 입력 영역
  - Textarea: Enter 전송, Shift+Enter 줄바꿈. 붙여넣기 시 이미지가 있으면 업로드 흐름으로 전환(텍스트 붙여넣기 방지), 없으면 기본 텍스트.
  - 첨부: 클립/버튼으로 이미지 선택, 드래그앤드롭 지원, 클립보드 이미지 붙여넣기 지원.
  - 업로드 UX: 썸네일/파일칩 렌더, 업로드 중 스피너 오버레이, 개별 삭제, 이미지 클릭 시 확대 미리보기 Dialog.
  - 전송 버튼은 입력이 있거나 첨부가 있을 때 활성화. 로딩/업로드 중 비활성화.

- 반응형
  - `md` 미만: 사이드바 오버레이 + 토글 버튼, 헤더에 홈 버튼 노출. 그 외는 고정 320px 사이드바.

- 토스트
  - 성공/오류/가이드 메시지를 sonner로 노출(예: 업로드 N개 첨부됨, 요약 생성 성공/실패, 대화 시작 필요 등).

## 동작 흐름 상세
1) 초기화
  - `getUserId()`로 익명 사용자 식별자 확보.
  - `/api/chat?userId=...`로 대화 목록 로드.

2) 대화 선택/생성
  - 항목 클릭: `currentConversationId` 설정 후 `/api/messages?conversationId=...&userId=...`로 메시지 로드(오래된 순 정렬).
  - 새 대화: `currentConversationId`를 `null`로 초기화하고 메시지 리스트 비움.

3) 메시지 전송(SSE)
  - 사용자가 텍스트 또는 첨부를 포함해 전송하면, 즉시 user 메시지를 추가하고 보조 메시지(빈/스트리밍 상태)를 추가.
  - 첨부 파일 중 업로드 완료 항목의 `uploadedId`를 `files[]` 페이로드로 변환.
  - `/api/chat` POST → SSE 수신. 첫 `conversation_id` 수신 시 상태 반영. `agent_message`는 누적 append, `message_replace`는 전체 교체. 스트림 종료 시 `isStreaming=false`로 전환.
  - 완료 후 입력 포커스 유지, 대화 목록 새로고침.

4) 파일 업로드
  - 파일 선택/드롭/붙여넣기 시 미리보기 DataURL을 만들어 낙관적으로 썸네일을 렌더하고, 병렬로 `/api/files/upload` 호출.
  - 성공 시 해당 항목의 `uploadedId` 세팅 + `isUploading=false`. 실패 시 해당 임시 항목 제거 + 토스트 오류.
  - 업로드 완료 후 입력 필드의 파일 리스트 초기화(on-send), 메시지 내 썸네일은 유지.

5) 액션 버튼 흐름
  - 보조 응답 또는 사이드바 카드에서 액션 트리거 시, 먼저 대화 유무 검사(없으면 토스트 안내).
  - 메시지 전체를 `User:`/`Assistant:` 합쳐 컨텍스트 문자열로 만들고 `/api/miso/mini-ally-summary` 호출.
  - 응답의 `ProjectData`로 모달을 채우고, 확인 시 세션 저장/다음 페이지로 이동(모달 내부 로직에서 처리).

6) 대화 관리
  - 삭제: `/api/conversations/{id}` DELETE 후 현재 선택된 대화였으면 해제/리스트 갱신.
  - 이름 변경: `/api/conversations/{id}` POST(내부에서 rename) 성공 시 리스트 갱신.

## 파서/유틸 요구사항
- ACTION 파서: 정규식 `\[ACTION:([^\]]+)\]([^\[]+)\[/ACTION\]`로 텍스트와 액션 구간을 분리해 순서대로 렌더.
- 스크롤 고정: 메시지 변경 시 하단으로 스크롤.
- 모바일 감지: `window.innerWidth < 768` 기준으로 사이드바 토글 상태 초기화 및 리사이즈 리스너 관리.
- ObjectURL/DataURL 정리: 컴포넌트 언마운트 시 생성한 URL을 모두 해제.

## 에러/엣지 케이스 처리
- 텍스트/첨부 모두 없는 전송은 차단.
- 업로드 중에는 전송 비활성화.
- SSE 파싱 실패 시 안전하게 무시하고 스트림 지속.
- 서버 응답 비정상 시 보조 메시지(스트리밍용 임시) 제거 및 포커스 복구.
- 메시지/목록 로드 중 로딩 일러스트/스켈레톤 노출.

## 접근성/시맨틱
- 아이콘 버튼에 `aria-label`, `title` 제공.
- Dialog/DropdownMenu는 키보드 탐색 가능해야 함.
- 이미지에 대체 텍스트 제공.

## 품질 기준(완료 정의)
- 데스크톱/모바일에서 모든 주요 플로우가 정상 동작.
- 스트리밍 표시, 복사, 토스트, 업로드 진행/미리보기/삭제, 이미지 확대 미리보기까지 확인.
- 대화 목록 CRUD(조회/선택/이름변경/삭제) 동작 확인.
- 액션 카드/버튼 → 요약 모달 → 다음 단계 진입 흐름 동작.
- 타입스크립트 오류/린트 오류 없음. UI는 Tailwind + shadcn/ui만 사용.

## 구현 시 참고 문구(한국어 UI 텍스트)
- 빈 상태 인삿말/가이드: 시간대별로 한국어 문구 사용.
- 토스트: "먼저 대화를 시작해주세요", "요약이 완성되었습니다", "요약 생성에 실패했습니다", "N개 파일이 첨부되었습니다", "메시지를 복사했습니다" 등.
- 버튼/라벨: "대화 목록", "이름 변경", "삭제", "MISO 설계하기", "바이브코딩 설계하기", "시작하기 →" 등.

위 사양을 정확히 반영해 /chat 전 기능과 MISO 연동을 완성하세요. 세부 클래스명/동작은 상기 요구사항과 일치해야 합니다.


