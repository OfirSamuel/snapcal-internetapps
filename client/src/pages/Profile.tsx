import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../lib/authApi';

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, fetchMe, logout } = useAuth();

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; avatarUrl?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoadingProfile(true);
      try {
        await fetchMe();
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  const displayEmail = user?.email ?? '—';
  const displayUsername = user?.username ?? '—';
  const imageSrc = user?.avatarUrl || user?.avatar || null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const nextErrors: { username?: string; avatarUrl?: string } = {};
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      nextErrors.username = 'Username cannot be empty';
    }

    const trimmedAvatar = avatarUrl.trim();
    if (trimmedAvatar && !isValidHttpUrl(trimmedAvatar)) {
      nextErrors.avatarUrl = 'Enter a valid http(s) URL or leave blank';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await updateMyProfile({
        username: trimmedUsername,
        avatarUrl: trimmedAvatar,
      });
      await fetchMe();
      setSuccess('Profile saved successfully.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string })?.message;
        setError(message || 'Could not save profile. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Your profile</h1>
              <p className="mt-1 text-sm text-gray-600">View and update your account details.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Log out
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                className="h-20 w-20 shrink-0 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500">
                No photo
              </div>
            )}
            <div className="min-w-0 text-sm">
              <p className="font-medium text-gray-900">{displayUsername}</p>
              <p className="text-gray-600">{displayEmail}</p>
              {(user?.avatarUrl || user?.avatar) && (
                <p className="mt-1 truncate text-xs text-gray-500" title={user?.avatarUrl || user?.avatar}>
                  {user?.avatarUrl ? 'Avatar URL set' : 'Legacy avatar field'}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-medium text-gray-900">Edit profile</h2>

            <div>
              <label htmlFor="profile-username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="profile-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="profile-avatar-url" className="block text-sm font-medium text-gray-700">
                Avatar URL (optional)
              </label>
              <input
                id="profile-avatar-url"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
              {fieldErrors.avatarUrl && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.avatarUrl}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
