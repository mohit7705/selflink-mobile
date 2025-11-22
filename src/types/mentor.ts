export type MentorMessageRole = 'user' | 'mentor';

export interface MentorChatPayload {
  message: string;
  mode?: string;
  language?: string | null;
}

export interface MentorChatMeta {
  user_flags?: Record<string, unknown>;
  mentor_flags?: Record<string, unknown>;
}

export interface MentorChatResponse {
  session_id: number;
  user_message_id: number;
  mentor_message_id: number;
  mentor_reply: string;
  mode?: string;
  language?: string | null;
  meta: MentorChatMeta;
}

export interface MentorHistoryMessage {
  id: number;
  session_id: number;
  role: MentorMessageRole;
  content: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface MentorHistoryPage {
  next: string | null;
  previous: string | null;
  results: MentorHistoryMessage[];
}
