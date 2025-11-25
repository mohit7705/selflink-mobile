import { User } from './user';

export type SoulmatchComponents = {
  astro?: number;
  matrix?: number;
  psychology?: number;
  lifestyle?: number;
};

export type SoulmatchResult = {
  user: Pick<User, 'id' | 'name' | 'handle' | 'photo'>;
  user_id?: number; // some endpoints may return user_id instead of nested user
  score: number;
  components: SoulmatchComponents;
  tags: string[];
  mentor_text?: string;
};
