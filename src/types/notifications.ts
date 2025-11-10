export interface Notification {
  id: number;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}
