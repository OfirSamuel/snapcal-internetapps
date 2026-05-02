/** User shape returned by auth and profile APIs (Mongoose may include _id). */
export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

export interface LoginBody {
  email?: string;
  username?: string;
  password: string;
}

/** Response from POST /api/auth/register and POST /api/auth/login */
export interface AuthTokensResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Response from POST /api/auth/google (placeholder) */
export interface GoogleAuthResponse extends AuthTokensResponse {
  note?: string;
}

/** Response from POST /api/auth/refresh */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileMeResponse {
  user: User;
}

export interface UpdateProfileBody {
  username?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}
