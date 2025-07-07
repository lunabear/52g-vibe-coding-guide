# PRD Generator

AI 기반 단계별 PRD(Product Requirements Document) 생성 도구

## 특징

- 단계별 질문을 통한 체계적인 PRD 작성
- 실시간 진행률 표시
- 깔끔한 UI/UX
- TypeScript와 Next.js 기반

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Context API

## 시작하기

### 개발 환경 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인 가능

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm run start
```

## 프로젝트 구조

```
prd-generator/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── prd/              # PRD-specific components
│   └── common/           # Shared components
├── contexts/             # React contexts
├── types/                # TypeScript type definitions
└── lib/                  # Utility functions and data
```

## 배포

Vercel을 통해 쉽게 배포 가능:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/prd-generator)