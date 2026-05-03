import api from './api';
import type {
  AuthTokensResponse,
  LoginBody,
  ProfileMeResponse,
  RefreshResponse,
  RegisterBody,
  UpdateProfileBody,
  UpdateProfileResponse,
} from '../types/auth';

export const registerUser = async (body: RegisterBody): Promise<AuthTokensResponse> => {
  const { data } = await api.post<AuthTokensResponse>('/auth/register', body);
  return data;
};

export const loginUser = async (body: LoginBody): Promise<AuthTokensResponse> => {
  const { data } = await api.post<AuthTokensResponse>('/auth/login', body);
  return data;
};

export const loginWithGoogle = async (credential: string): Promise<AuthTokensResponse> => {
  const { data } = await api.post<AuthTokensResponse>('/auth/google', { credential });
  return data;
};

export const refreshSession = async (refreshToken: string): Promise<RefreshResponse> => {
  const { data } = await api.post<RefreshResponse>('/auth/refresh', { refreshToken });
  return data;
};

export const getMyProfile = async (): Promise<ProfileMeResponse> => {
  const { data } = await api.get<ProfileMeResponse>('/profile/me');
  return data;
};

export const updateMyProfile = async (body: UpdateProfileBody | FormData): Promise<UpdateProfileResponse> => {
  const isFormData = body instanceof FormData;
  const { data } = await api.put<UpdateProfileResponse>('/profile/me', body, isFormData ? {
    headers: { 'Content-Type': 'multipart/form-data' },
  } : undefined);
  return data;
};
