# PRD Generator - AI 기반 제품 기획서 생성기

MISO AI와 함께 당신의 아이디어를 체계적인 제품 기획서(PRD)로 만들어드립니다.

## 🎯 주요 기능

- **8단계 구조화된 질문 플로우**: 프로젝트 개요부터 타임라인까지 체계적인 질문 구성
- **MISO AI 인사이트**: 답변을 분석하여 추가적인 맞춤형 질문 생성
- **미니멀한 UI/UX**: 산만함 없이 집중할 수 있는 깔끔한 인터페이스
- **전문적인 PRD 생성**: MISO AI가 모든 답변을 종합하여 완성도 높은 문서 작성
- **마크다운 다운로드**: 생성된 PRD를 .md 파일로 즉시 저장 가능

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.0 이상
- pnpm (권장) 또는 npm
- MISO API 키 ([MISO 콘솔](https://console.miso.holdings)에서 발급)

### 설치

```bash
# 저장소 클론
git clone https://github.com/gsenrdx/prd-generator.git

# 디렉토리 이동
cd prd-generator

# 의존성 설치 (pnpm 권장)
pnpm install
# 또는
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_MISO_API_KEY=your-miso-api-key
NEXT_PUBLIC_MISO_ENDPOINT=https://api.holdings.miso.gs/ext/v1
```

### 개발 서버 실행

```bash
pnpm dev
# 또는
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 프로덕션 빌드

```bash
pnpm build
pnpm start
```

## 📱 사용 방법

1. **시작하기**: 메인 페이지에서 "시작하기" 버튼 클릭
2. **8단계 질문에 답하기**: 
   - 📋 프로젝트 개요 - 프로젝트의 기본 정보
   - 🎯 목표 및 목적 - 달성하고자 하는 것
   - 👥 타겟 오디언스 - 주요 사용자 정의
   - ⭐ 핵심 기능 - 주요 기능 설명
   - 📖 사용자 스토리 - 사용 시나리오
   - 🔧 기술 요구사항 - 기술적 제약사항
   - 📊 성공 지표 - 측정 가능한 목표
   - 📅 타임라인 - 일정 및 마일스톤
3. **MISO AI 인사이트**: 마지막 단계에서 AI가 추가 질문 생성
4. **PRD 생성**: 모든 답변을 바탕으로 완성도 높은 문서 작성
5. **다운로드**: 생성된 PRD를 마크다운 파일로 저장

## 🛠 기술 스택

- **프레임워크**: Next.js 15.3.5 (App Router)
- **언어**: TypeScript 5.8
- **스타일링**: Tailwind CSS 3.4
- **UI 컴포넌트**: shadcn/ui
- **애니메이션**: Framer Motion 12
- **상태 관리**: React Context API
- **AI 통합**: MISO Workflow API
- **마크다운**: react-markdown, remark-gfm, rehype-raw
- **아이콘**: Lucide React

## 📁 프로젝트 구조

```
prd-generator/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 메인 페이지
│   ├── prd-generator/     # PRD 생성 플로우 페이지
│   └── prd-result/        # PRD 결과 페이지
├── components/            # 재사용 가능한 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트 (Header, Footer)
├── contexts/             # React Context providers
│   └── PRDContext.tsx    # PRD 상태 관리
├── hooks/                # 커스텀 React hooks
├── lib/                  # 유틸리티 및 API 클라이언트
│   ├── miso-api.ts      # MISO API 통합
│   └── prd-questions.ts  # 질문 데이터
└── types/                # TypeScript 타입 정의
```

## 🤝 기여하기

프로젝트 개선에 기여하고 싶으시다면:

1. 이 저장소를 Fork하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🏢 개발

**52g** - 5pen 2nnovation Group

## 🔗 관련 링크

- [MISO Holdings](https://miso.holdings)
- [52g 공식 홈페이지](https://52g.co.kr)

---

Made with ❤️ by 52g × Powered by MISO AI