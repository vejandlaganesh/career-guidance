export interface User {
  id: string;
  fullName: string;
  email: string;
  classLevel: string;
  interests: string[];
  skills: string[];
  preferredSubjects: string[];
  careerInterests: string[];
  role?: "student" | "admin";
}

export interface QuizQuestion {
  id: number;
  q: string;
  hint?: string;
  type: "single" | "multi";
  options: {
    label: string;
    tags: Record<string, number>;
  }[];
}

export interface QuizAttempt {
  answers: Record<number, number[] | number>;
  vector: Record<string, number> | null;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
}

export interface SavedCareer {
  careerId: string;
  savedAt: string;
}
