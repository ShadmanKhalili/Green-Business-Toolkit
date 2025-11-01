export enum QuestionCategory {
  RESOURCE_EFFICIENCY = "সম্পদ ব্যবহার",
  WASTE_POLLUTION = "বর্জ্য ও দূষণ",
  CLIMATE_CHANGE = "জলবায়ু পরিবর্তন",
  SOCIAL_RESPONSIBILITY = "সামাজিক দায়বদ্ধতা",
  BUSINESS_MANAGEMENT = "ব্যবসায় ব্যবস্থাপনা ও ক্রমাগত উন্নয়ন",
}

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  options: ScoreOption[]; // Each question will have its specific options
}

export interface Answer {
  questionId: string;
  score: number;
  text: string; // Question text for context
  category: QuestionCategory; 
}

export interface ScoreOption {
  value: number;
  label: string;
}

export enum EmployeeCountRange {
  ONE_TO_TWO = "১-২ জন",
  THREE_TO_FIVE = "৩-৫ জন",
  SIX_TO_TEN = "৬-১০ জন",
  MORE_THAN_TEN = "১০+ জন",
  UNKNOWN = "অজানা"
}

export interface PreAssessmentData {
  businessName: string;
  businessType: string;
  location: string;
  mainChallengeOrGoal: string;
  employeeCount: EmployeeCountRange;
  businessDescription?: string; 
}

export interface ResultsDisplayProps {
  score: number;
  maxPossibleScore: number;
  recommendations: string;
  isLoadingRecommendations: boolean;
  onRestart: () => void;
  answers: Answer[];
  preAssessmentData: PreAssessmentData | null; 
}

export interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, score: number) => void;
  currentValue?: number;
  onGoBack: () => void;
  isFirstQuestion: boolean;
}

export interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  onJump: (index: number) => void;
  isDisabled: boolean;
}
