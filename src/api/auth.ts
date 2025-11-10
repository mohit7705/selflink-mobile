import { apiClient } from './client';
import { AuthResponse, LoginPayload, RefreshResponse, RegisterPayload } from '@types/auth';
import { User } from '@types/user';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login/', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register/', payload);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me/');
  return data;
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh/', {
    refresh: refreshToken,
  });
  return data;
}
