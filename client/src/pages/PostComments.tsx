import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createComment, fetchCommentsByPost, fetchPostById } from '../lib/api';
import type { PostComment } from '../types';

const serverBase = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

function commentAuthorLabel(comment: PostComment): string {
  return comment.author?.username || comment.author?.email || 'Unknown user';
}

function commentAuthorAvatar(comment: PostComment): string {
  const a = comment.author;
  const seed = encodeURIComponent(a?.username || a?.email || 'user');
  const raw = a?.avatarUrl || a?.avatar || '';
  if (raw.startsWith('/uploads/')) return `${serverBase}${raw}`;
  return raw || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

export default function PostComments() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState<{
    imageUrl: string;
    description?: string;
    calories: number;
    authorUsername: string;
    commentsCount: number;
  } | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadComments = useCallback(async (id: string) => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const res = await fetchCommentsByPost(id);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCommentsError('Failed to load comments.');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!postId) {
      setPostError('Missing post.');
      return;
    }

    const load = async () => {
      setPostError(null);
      try {
        const res = await fetchPostById(postId);
        const p = res.data;
        const rel = p.imageUrl as string;
        const imageUrl = rel.startsWith('http') ? rel : `${serverBase}${rel}`;
        setPost({
          imageUrl,
          description: p.description,
          calories: p.calories,
          authorUsername: p.author?.username || 'Unknown',
          commentsCount: p.commentsCount ?? 0,
        });
      } catch {
        setPost(null);
        setPostError('This post could not be found.');
      }
    };

    void load();
    void loadComments(postId);
  }, [postId, loadComments]);

  const handleSubmit = async () => {
    if (!postId) return;
    const trimmed = text.trim();
    if (!trimmed) {
      setSubmitError('Comment cannot be empty.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await createComment(postId, trimmed);
      const created = response.data as PostComment;
      setComments((prev) => [created, ...prev]);
      setText('');
      setPost((prev) =>
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to post comment.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Comments</h1>
          <Link to="/" className="ml-auto text-sm font-medium text-lime-600 hover:text-lime-700">
            Feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {postError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{postError}</p>
        )}

        {post && (
          <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="aspect-video bg-gray-100">
              <img src={post.imageUrl} alt={post.description || 'Meal'} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-800">{post.authorUsername}</span>
                {' · '}
                {post.calories} cal
                {' · '}
                {post.commentsCount} comments
              </p>
              {post.description && (
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{post.description}</p>
              )}
            </div>
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500">Discussion</h2>
          {commentsLoading && <p className="text-sm text-gray-500">Loading comments...</p>}
          {commentsError && <p className="text-sm text-red-600">{commentsError}</p>}

          {!commentsLoading && !commentsError && comments.length === 0 && (
            <p className="text-sm text-gray-500">No comments yet. Be the first to comment.</p>
          )}

          {!commentsLoading &&
            !commentsError &&
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <img
                  src={commentAuthorAvatar(comment)}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full bg-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{commentAuthorLabel(comment)}</p>
                  <p className="mt-0.5 text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))}
        </section>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {!isAuthenticated ? (
            <p className="text-sm text-gray-500">
              <Link to="/login" className="font-medium text-lime-600 hover:text-lime-700">
                Log in
              </Link>{' '}
              to add a comment.
            </p>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
                rows={3}
              />
              {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || !postId || !!postError}
                className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
