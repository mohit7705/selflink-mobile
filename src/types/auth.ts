import { User } from './user';

export interface AuthTokens {
  token: string;
  refreshToken?: string | null;
  message?: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  handle?: string;
  intention?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place_city?: string;
  birth_place_country?: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken?: string | null;
  message?: string;
}
