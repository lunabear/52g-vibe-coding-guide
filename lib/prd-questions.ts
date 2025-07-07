import { IPRDStep, QuestionType } from '@/types/prd.types';

export const PRD_STEPS: IPRDStep[] = [
  {
    id: 'empathy',
    title: '👤 사용자 이해하기',
    description: '누가 이걸 쓸까요?',
    order: 1,
    questions: [
      {
        id: 'target-user',
        text: '이 서비스가 꼭 필요한 사람을 한 명 떠올려보세요. 그 사람은 누구인가요?',
        placeholder: '예: 매일 새벽 4시에 일어나서 매장 준비하는 우리 동네 GS25 사장님',
        helpText: '실제로 아는 사람을 떠올리면 더 좋아요!',
        type: QuestionType.TEXTAREA,
        required: true,
      },
    ],
  },
  {
    id: 'pain',
    title: '😫 불편한 순간',
    description: '언제 가장 답답한가요?',
    order: 2,
    questions: [
      {
        id: 'pain-moment',
        text: '그 사람이 "아 진짜 짜증나!" 하고 외치는 순간은 언제인가요?',
        placeholder: '예: 금요일 저녁, 맥주가 다 떨어졌는데 발주를 깜빡했을 때',
        helpText: '구체적인 상황을 그려보세요',
        type: QuestionType.TEXTAREA,
        required: true,
      },
    ],
  },
  {
    id: 'dream',
    title: '✨ 꿈꾸는 변화',
    description: '어떻게 바뀌면 좋을까요?',
    order: 3,
    questions: [
      {
        id: 'ideal-solution',
        text: '만약 마법이 있다면, 그 불편함을 어떻게 해결해주고 싶나요?',
        placeholder: '예: 스마트폰만 보면 "오늘 맥주 10박스 더 시키세요!"라고 알아서 알려주는 것',
        helpText: '상상력을 마음껏 발휘하세요!',
        type: QuestionType.TEXTAREA,
        required: true,
      },
    ],
  },
  {
    id: 'insight',
    title: '🎯 MISO의 인사이트',
    description: '더 깊이 들어가볼까요?',
    order: 4,
    questions: [], // MISO API가 사용자 경험 기반 추가 질문 생성
  },
];