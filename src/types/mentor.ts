export interface MentorSession {
  id: number;
  question: string;
  answer: string;
  sentiment: string;
  created_at: string;
}

export interface MentorProfile {
  tone: string;
  level: string;
  preferences: Record<string, unknown> | null;
}

export interface DailyTask {
  id: number;
  task: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}
