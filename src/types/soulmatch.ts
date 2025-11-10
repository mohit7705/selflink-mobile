import { User } from './user';

export interface SoulMatchProfile {
  target: User;
  score: number;
  breakdown: Record<string, unknown> | null;
}
