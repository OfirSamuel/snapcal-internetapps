import { useCallback, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

const emailLooksValid = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleGoogleSuccess = useCallback(
    async (credential: string) => {
      setGoogleSubmitting(true);
      setError(null);
      try {
        await loginWithGoogle(credential);
        navigate('/profile', { replace: true });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message = (err.response?.data as { message?: string })?.message;
          setError(message || 'Google sign-in failed. Please try again.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setGoogleSubmitting(false);
      }
    },
    [loginWithGoogle, navigate]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextFieldErrors: { identifier?: string; password?: string } = {};

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      nextFieldErrors.identifier = 'Email or username is required';
    }

    if (!password) {
      nextFieldErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextFieldErrors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const isEmail = emailLooksValid(trimmedIdentifier);
      await login(
        isEmail
          ? { email: trimmedIdentifier, password }
          : { username: trimmedIdentifier, password }
      );
      navigate('/profile', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string })?.message;
        setError(message || 'Login failed. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-lime-500">SnapCal</h1>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Log in</h2>
          <p className="mt-1 text-sm text-gray-600">Sign in to your SnapCal account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
              />
              {fieldErrors.identifier && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.identifier}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full rounded-md bg-lime-500 px-4 py-2 text-sm font-medium text-white hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <GoogleSignInButton
            flow="signin"
            disabled={submitting || googleSubmitting}
            onSuccess={handleGoogleSuccess}
          />
          {googleSubmitting && (
            <p className="mt-2 text-center text-sm text-gray-500">Signing in with Google…</p>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-lime-600 hover:text-lime-700">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
