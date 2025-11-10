import { apiClient } from './client';
import { PersonalMapInput, PersonalMapProfile, ProfileUpdateInput, User } from '@types/user';

export async function listUsers(query?: string): Promise<User[]> {
  const url = query ? `/users/?q=${encodeURIComponent(query)}` : '/users/';
  const { data } = await apiClient.get<User[]>(url);
  return data;
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${id}/`);
  return data;
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

export async function followUser(userId: number): Promise<{ following: boolean }> {
  const { data } = await apiClient.post<{ following: boolean }>(`/users/${userId}/follow/`);
  return data;
}

export async function unfollowUser(userId: number): Promise<{ following: boolean }> {
  const { data } = await apiClient.delete<{ following: boolean }>(`/users/${userId}/follow/`);
  return data;
}

export async function listFollowers(userId: number): Promise<User[]> {
  const { data } = await apiClient.get<User[]>(`/users/${userId}/followers/`);
  return data;
}

export async function listFollowing(userId: number): Promise<User[]> {
  const { data } = await apiClient.get<User[]>(`/users/${userId}/following/`);
  return data;
}
