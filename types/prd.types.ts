export interface IPRDStep {
  id: string;
  title: string;
  description: string;
  questions: IQuestion[];
  order: number;
  hasAdditionalQuestions?: boolean;
}

export interface IQuestion {
  id: string;
  text: string;
  placeholder?: string;
  type: QuestionType;
  required: boolean;
  helpText?: string;
}

export enum QuestionType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
}

export interface IPRDData {
  projectOverview: {
    name: string;
    description: string;
    vision: string;
  };
  goalsObjectives: {
    businessGoals: string[];
    userGoals: string[];
    successCriteria: string[];
  };
  targetAudience: {
    primaryUsers: string;
    userPersonas: string[];
    userNeeds: string[];
  };
  keyFeatures: {
    features: IFeature[];
    mvpFeatures: string[];
  };
  userStories: IUserStory[];
  technicalRequirements: {
    techStack: string[];
    integrations: string[];
    constraints: string[];
    performance: string[];
  };
  successMetrics: {
    kpis: string[];
    analytics: string[];
  };
  timeline: {
    phases: IPhase[];
    milestones: IMilestone[];
  };
}

export interface IFeature {
  id: string;
  name: string;
  description: string;
  priority: Priority;
}

export interface IUserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
}

export interface IPhase {
  id: string;
  name: string;
  duration: string;
  deliverables: string[];
}

export interface IMilestone {
  id: string;
  name: string;
  date: string;
  description: string;
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface IExpertQuestions {
  planner: string[];
  designer: string[];
  developer: string[];
}

export interface IExpertAnswer {
  question: string;
  answer: string;
  expert: ExpertType;
}

export enum ExpertType {
  PLANNER = 'planner',
  DESIGNER = 'designer',
  DEVELOPER = 'developer',
}