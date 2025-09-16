export interface ITemplate {
  id: string;
  title: string;
  author: string;
  downloads: string;
  thumbnailUrl: string;
  category?: string;
  description?: string;
  longDescription?: string;
  v0ProjectUrl?: string;
  misoYamlUrl?: string;
  organization?: string;
}

export const templates: ITemplate[] = [
  {
    id: '1',
    title: '이커머스 스토어 기본 템플릿',
    author: '김미소',
    downloads: '1.2K',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    category: '이커머스',
    description: '상품 목록/상세, 장바구니, 결제 연동 등 전자상거래 핵심 흐름을 빠르게 구현할 수 있는 범용 템플릿입니다.',
    longDescription: '이 템플릿은 상품 카탈로그, 검색/필터, 장바구니, 주문/결제 흐름을 포함합니다. UI 컴포넌트와 API 인터페이스가 분리되어 있어 다른 결제/재고 시스템으로 교체가 용이합니다. 반응형 레이아웃과 접근성 가이드라인을 기본 제공합니다.',
    v0ProjectUrl: 'https://v0.dev/example-ecommerce',
    misoYamlUrl: '/templates/ecommerce-workflow.yaml',
    organization: '바이브코딩 팀'
  },
  {
    id: '2',
    title: '고객지원 챗봇 템플릿',
    author: '이플로',
    downloads: '856',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&h=400&fit=crop',
    category: '챗봇',
    description: 'FAQ 자동응답, 상담 이관, 히스토리 저장 등 고객지원 시나리오에 필요한 기본 기능을 포함한 챗봇 템플릿입니다.',
    longDescription: 'FAQ 지식베이스 기반 응답, 키워드 라우팅, 상담원 이관, 대화 로그 저장 및 검색을 제공합니다. 멀티 채널(웹/모바일) 대응과 컨텍스트 유지 전략 샘플을 포함합니다.',
    misoYamlUrl: '/templates/customer-support-chatbot.yaml',
    organization: 'MISO 팀'
  },
  {
    id: '3',
    title: '운영 대시보드 템플릿',
    author: '박클라우드',
    downloads: '742',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    category: '대시보드',
    description: '차트/테이블/필터/내보내기 등 운영 지표 모니터링에 필요한 공통 구성요소로 이루어진 기본 대시보드입니다.',
    longDescription: 'KPI 카드, 시계열 차트, 카테고리 분포, 테이블 페이징/정렬/필터, CSV 내보내기를 기본 제공합니다. 역할 기반 접근제어(RBAC)와 즐겨찾기 레이아웃 저장 예시가 포함됩니다.\n\n```bash\n# 예시: 대시보드 개발 서버 실행\npnpm dev\n```\n\n![대시보드 스크린샷](https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop)\n',
    v0ProjectUrl: 'https://v0.dev/example-dashboard',
    misoYamlUrl: '/templates/admin-dashboard.yaml',
    organization: '클라우드랩'
  },
  {
    id: '4',
    title: '주문 처리 자동화 워크플로우',
    author: '정모바일',
    downloads: '623',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
    category: '자동화',
    description: '주문 접수→검증→재고 확인→결제 처리→배송 요청까지 단계별 자동화를 구성한 워크플로우 템플릿입니다.',
    longDescription: '이벤트 기반으로 주문 수명주기를 관리합니다. 실패 재시도/보상 트랜잭션, SLA 모니터링, 외부 ERP/택배 연동 훅을 위한 확장 포인트를 포함합니다.\n\n**플로우 차트**\n\n1. 주문 접수\n2. 유효성 검사\n3. 재고 확인\n4. 결제 처리\n5. 배송 요청\n\n![주문 처리 플로우](https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?q=80&w=1200&auto=format&fit=crop)\n',
    misoYamlUrl: '/templates/order-management.yaml',
    organization: '모바일옵스'
  },
  {
    id: '5',
    title: '기업 웹사이트(포트폴리오) 템플릿',
    author: '최인공',
    downloads: '512',
    thumbnailUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
    category: '웹사이트',
    description: '회사 소개, 서비스, 사례, 블로그, 문의 섹션으로 구성된 범용 기업 웹사이트 템플릿입니다.',
    longDescription: '검색엔진최적화(SEO) 기본 태그, 오픈그래프/트위터 카드 메타, 다국어 i18n 구조, 폼 제출/검증 예시를 포함합니다. 디자인 시스템 토큰으로 손쉬운 커스텀이 가능합니다.\n\n> 팁: 페이지 속도 개선을 위해 이미지에는 `next/image`를 사용하세요.\n\n![웹사이트 스크린샷](https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=1200&auto=format&fit=crop)\n',
    v0ProjectUrl: 'https://v0.dev/example-portfolio',
    organization: '인공지능 스튜디오'
  },
  {
    id: '6',
    title: '마케팅 리드 분석 파이프라인',
    author: '강마켓',
    downloads: '438',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
    category: '데이터분석',
    description: '유입 채널별 리드 수집, 정제, 스코어링, 대시보드 시각화까지 일련의 분석 플로우를 제공하는 템플릿입니다.',
    longDescription: '수집(ETL) → 정제/변환 → 스코어링 → 시각화까지 기본 파이프라인을 제공합니다. 배치/스트리밍 구성 예시와 데이터 품질 체크리스트를 포함합니다.\n\n```sql\n-- 예시: 일별 리드 요약 뷰\nCREATE VIEW daily_leads AS\nSELECT date_trunc(\'day\', created_at) AS day, COUNT(*) AS lead_count\nFROM leads\nGROUP BY 1;\n```\n\n![분석 대시보드](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop)\n',
    misoYamlUrl: '/templates/lead-generation-bot.yaml',
    organization: '마켓랩'
  }
];