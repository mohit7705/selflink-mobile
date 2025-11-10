import { User } from './user';

export interface ThreadMember {
  id: number;
  user: User;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ThreadParticipantPreview {
  body: string | null;
  created_at: string | null;
}

export interface Thread {
  id: number;
  is_group: boolean;
  title: string | null;
  members: ThreadMember[];
  participants: User[];
  last_message: ThreadParticipantPreview | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateThreadPayload {
  title?: string;
  is_group?: boolean;
  participant_ids: number[];
  initial_message?: string;
}

export interface Message {
  id: number;
  thread: number;
  sender: User;
  body: string;
  type: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface SendMessagePayload {
  thread: number;
  body: string;
  type?: string;
  meta?: Record<string, unknown> | null;
}
