import { IPRDStep, QuestionType } from '@/types/prd.types';

export const PRD_STEPS: IPRDStep[] = [
  {
    id: 'empathy',
    title: '👤 Understand the user',
    description: 'Who will use this?',
    order: 1,
    questions: [
      {
        id: 'target-user',
        text: 'Think of one person who desperately needs this service. Who are they?',
        placeholder: 'e.g., A local GS25 owner who wakes up at 4 AM to prepare the store',
        helpText: 'It helps to picture someone you actually know.',
        type: QuestionType.TEXTAREA,
        required: true,
      },
    ],
  },
  {
    id: 'pain',
    title: '😫 Painful moments',
    description: 'When is it most frustrating?',
    order: 2,
    questions: [
      {
        id: 'pain-moment',
        text: 'When would that person shout, "This is so annoying!"?',
        placeholder: 'e.g., Friday evening, beer runs out and purchase order was forgotten',
        helpText: 'Describe a concrete scenario.',
        type: QuestionType.TEXTAREA,
        required: true,
      },
    ],
  },
  {
    id: 'dream',
    title: '✨ Desired change',
    description: 'What should improve?',
    order: 3,
    questions: [
      {
        id: 'ideal-solution',
        text: 'What features or services would solve that pain point?',
        placeholder: 'e.g., Automatic purchase alerts on low stock with one-click ordering; sales data analysis to predict what and how much to stock',
        helpText: 'Think of concrete features, apps, or services — and how they should work.',
        type: QuestionType.TEXTAREA,
        required: true,
      },
    ],
  },
  {
    id: 'insight',
    title: '🎯 MISO Insights',
    description: 'Shall we dive deeper?',
    order: 4,
    questions: [], // MISO API가 사용자 경험 기반 추가 질문 생성
  },
];