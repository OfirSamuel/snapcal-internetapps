import api from './api';
import type {
  AuthTokensResponse,
  GoogleAuthResponse,
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

/** Placeholder Google endpoint — body shape can evolve when real OAuth is added. */
export const loginWithGooglePlaceholder = async (body: {
  email: string;
  username: string;
}): Promise<GoogleAuthResponse> => {
  const { data } = await api.post<GoogleAuthResponse>('/auth/google', body);
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

export const updateMyProfile = async (body: UpdateProfileBody): Promise<UpdateProfileResponse> => {
  const { data } = await api.put<UpdateProfileResponse>('/profile/me', body);
  return data;
};
