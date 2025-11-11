import { apiClient } from './client';
import { PersonalMapInput, PersonalMapProfile, ProfileUpdateInput, User } from '@schemas/user';

export async function listUsers(query?: string): Promise<User[]> {
  const url = query ? `/users/?q=${encodeURIComponent(query)}` : '/users/';
  const { data } = await apiClient.get<User[]>(url);
  return data;
}

export async function getUserProfile(id: number | string): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${id}/`);
  return data;
}

export async function getUserById(id: number): Promise<User> {
  return getUserProfile(id);
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me/');
  return data;
}

export async function updateCurrentUser(payload: ProfileUpdateInput): Promise<User> {
  const { data } = await apiClient.patch<User>('/users/me/', payload);
  return data;
}

export type PersonalMapPayload = PersonalMapInput & {
  avatarFile?: {
    uri: string;
    name: string;
    type: string;
  };
};

export async function getPersonalMapProfile(): Promise<PersonalMapProfile> {
  const { data } = await apiClient.get<PersonalMapProfile>('/me/profile/');
  return data;
}

export async function savePersonalMapProfile(payload: PersonalMapPayload): Promise<PersonalMapProfile> {
  const { avatarFile, ...rest } = payload;
  if (avatarFile) {
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      formData.append(key, String(value));
    });
    formData.append('avatar_image', {
      uri: avatarFile.uri,
      name: avatarFile.name,
      type: avatarFile.type,
    } as any);
    const { data } = await apiClient.patch<PersonalMapProfile>('/me/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await apiClient.patch<PersonalMapProfile>('/me/profile/', rest);
  return data;
}

export async function followUser(userId: number | string): Promise<void> {
  await apiClient.post(`/users/${userId}/follow/`, {});
}

export async function unfollowUser(userId: number | string): Promise<void> {
  await apiClient.delete(`/users/${userId}/follow/`);
}

export async function listFollowers(userId: number): Promise<User[]> {
  const { data } = await apiClient.get<User[]>(`/users/${userId}/followers/`);
  return data;
}

export async function listFollowing(userId: number): Promise<User[]> {
  const { data } = await apiClient.get<User[]>(`/users/${userId}/following/`);
  return data;
}

export interface UserSummary {
  id: number;
  handle: string;
  name: string;
  photo: string;
}

export async function searchUsers(query: string): Promise<UserSummary[]> {
  if (!query.trim()) {
    return [];
  }
  // Endpoint powered by apps/search/urls.py -> /search/users/
  const { data } = await apiClient.get<UserSummary[]>(`/search/users/?q=${encodeURIComponent(query)}`);
  return data;
}
