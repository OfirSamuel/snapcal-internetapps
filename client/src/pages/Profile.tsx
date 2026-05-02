import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Newspaper, User, Settings, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../lib/authApi';
import { fetchPosts, deletePost } from '../lib/api';
import { EditPostModal } from '../components/EditPostModal';
import type { Meal } from '../types';

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
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<Meal[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

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

  const loadPosts = useCallback(async (page: number) => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    setLoadingPosts(true);
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const res = await fetchPosts(page, userId);
      const fetched: Meal[] = (res.data as any[]).map((p: any) => ({
        id: p._id,
        userId: p.author?._id || p.author,
        user: {
          id: p.author?._id || p.author,
          name: p.author?.username || '',
          username: p.author?.username || '',
          avatar: p.author?.avatar || '',
        },
        imageUrl: p.imageUrl?.startsWith('/uploads/')
          ? `${serverUrl}${p.imageUrl}`
          : p.imageUrl,
        description: p.description || p.mealName || '',
        calories: p.calories,
        protein: p.protein,
        carbs: p.carbs,
        fat: p.fat,
        mealName: p.mealName,
        likes: p.likes?.length ?? 0,
        comments: p.commentsCount ?? 0,
        isLiked: false,
        createdAt: p.createdAt,
      }));
      if (page === 1) {
        setPosts(fetched);
      } else {
        setPosts((prev) => [...prev, ...fetched]);
      }
      setHasMorePosts(fetched.length === 10);
    } catch {
      // silently fail — user still sees profile
    } finally {
      setLoadingPosts(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void loadPosts(1);
    }
  }, [user, loadPosts]);

  const handleLoadMore = () => {
    const nextPage = postsPage + 1;
    setPostsPage(nextPage);
    void loadPosts(nextPage);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleEditPost = (meal: Meal) => {
    setEditingMeal(meal);
  };

  const handleEditSave = (updatedMeal: Meal) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedMeal.id ? updatedMeal : p)));
    setEditingMeal(null);
  };

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

  const totalCalories = posts.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMeals = posts.length;
  const avgCalories = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;
  const totalLikes = posts.reduce((sum, meal) => sum + meal.likes, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen p-6">
        <h1 className="text-2xl font-bold text-lime-500 tracking-tight mb-8">SnapCal</h1>
        <nav className="flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-lime-50 hover:text-lime-600 transition-colors"
          >
            <Newspaper className="w-5 h-5" />
            Feed
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-lime-50 hover:text-lime-600 transition-colors bg-lime-50 text-lime-600"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <button
            onClick={() => setEditProfileOpen(!editProfileOpen)}
            className="text-gray-600 hover:text-lime-600 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 pt-16 md:pt-0">
        {/* Profile Info Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-start gap-6 mb-6">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={displayUsername}
                  className="w-20 h-20 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="flex w-20 h-20 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500">
                  No photo
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{displayUsername}</h2>
                <p className="text-gray-500 mb-4">{displayEmail}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditProfileOpen(!editProfileOpen)}
                    className="bg-lime-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-lime-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalMeals}</p>
                <p className="text-sm text-gray-500">Meals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{avgCalories}</p>
                <p className="text-sm text-gray-500">Avg Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalLikes}</p>
                <p className="text-sm text-gray-500">Total Likes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form (collapsible) */}
        {editProfileOpen && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Edit profile</h3>

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
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
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
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
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

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-lime-500 px-4 py-2 text-sm font-medium text-white hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Meals Grid */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h3 className="font-semibold text-gray-900 mb-4">My Meals</h3>

          {posts.length === 0 && !loadingPosts && (
            <div className="text-center py-12">
              <p className="text-gray-500">No meals yet. Start tracking!</p>
              <Link to="/" className="text-sm text-lime-600 hover:underline mt-2 inline-block">
                Go to Feed to create your first post
              </Link>
            </div>
          )}

          <div className="grid grid-cols-3 gap-1">
            {posts.map((meal) => (
              <div
                key={meal.id}
                className="aspect-square bg-gray-200 cursor-pointer relative group overflow-hidden"
                onClick={() => setSelectedMeal(meal)}
              >
                <img
                  src={meal.imageUrl}
                  alt={meal.description}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <p className="font-bold text-lg">{meal.calories}</p>
                    <p className="text-xs">calories</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loadingPosts && (
            <div className="text-center py-6 text-gray-500 text-sm">Loading posts…</div>
          )}

          {hasMorePosts && posts.length > 0 && !loadingPosts && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMeal.imageUrl}
              alt={selectedMeal.description}
              className="w-full aspect-square object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {selectedMeal.calories} cal
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedMeal.likes} likes • {selectedMeal.comments} comments
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingMeal(selectedMeal);
                      setSelectedMeal(null);
                    }}
                    className="p-2 rounded-lg text-gray-500 hover:text-lime-600 hover:bg-lime-50 transition-colors"
                    aria-label="Edit post"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMeal(null);
                      void handleDeletePost(selectedMeal.id);
                    }}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Delete post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {selectedMeal.protein !== undefined && selectedMeal.carbs !== undefined && selectedMeal.fat !== undefined && (
                <div className="flex items-center gap-6 mb-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <div>
                    <span className="font-medium">Protein:</span> {selectedMeal.protein}g
                  </div>
                  <div>
                    <span className="font-medium">Carbs:</span> {selectedMeal.carbs}g
                  </div>
                  <div>
                    <span className="font-medium">Fat:</span> {selectedMeal.fat}g
                  </div>
                </div>
              )}
              <p className="text-gray-700">{selectedMeal.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingMeal && (
        <EditPostModal
          isOpen={true}
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
