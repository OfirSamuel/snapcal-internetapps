import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LoginBody, RegisterBody, User } from '../types/auth';
import { getMyProfile, loginUser, loginWithGoogle as exchangeGoogleCredential, registerUser } from '../lib/authApi';
import { clearTokens, getAccessToken, setTokens } from '../lib/authStorage';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (body: LoginBody) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setAccessToken(null);
      return;
    }

    setAccessToken(token);

    try {
      const { user: nextUser } = await getMyProfile();
      setUser(nextUser);
    } catch {
      clearTokens();
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      await fetchMe();
      if (active) {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [fetchMe]);

  const login = useCallback(async (body: LoginBody) => {
    setLoading(true);
    try {
      const data = await loginUser(body);
      setTokens(data.accessToken, data.refreshToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (body: RegisterBody) => {
    setLoading(true);
    try {
      const data = await registerUser(body);
      setTokens(data.accessToken, data.refreshToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const data = await exchangeGoogleCredential(credential);
      setTokens(data.accessToken, data.refreshToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(
    () => Boolean(user && accessToken),
    [user, accessToken]
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      fetchMe,
    }),
    [user, accessToken, isAuthenticated, loading, login, register, loginWithGoogle, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
