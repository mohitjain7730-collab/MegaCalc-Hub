
export interface Option {
  text: string;
  score: number;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export enum QuizState {
  Start,
  InProgress,
  Finished,
}

export enum ResultCategory {
  Fit = "Financially Fit",
  Stable = "Moderately Stable",
  Improvement = "Needs Improvement",
}

export interface UserAnswer {
  question: string;
  answer: string;
}
