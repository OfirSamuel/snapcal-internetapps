import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createComment, fetchCommentsByPost } from '../lib/api';
import type { PostComment } from '../types';

interface CommentsModalProps {
  isOpen: boolean;
  postId: string | null;
  onClose: () => void;
  onCommentAdded: (postId: string) => void;
}

export function CommentsModal({ isOpen, postId, onClose, onCommentAdded }: CommentsModalProps) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !postId) {
      return;
    }

    const loadComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchCommentsByPost(postId);
        setComments(response.data);
      } catch {
        setError('Failed to load comments.');
      } finally {
        setLoading(false);
      }
    };

    void loadComments();
  }, [isOpen, postId]);

  if (!isOpen || !postId) return null;

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setSubmitError('Comment cannot be empty.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await createComment(postId, trimmed);
      setComments((prev) => [response.data, ...prev]);
      setText('');
      onCommentAdded(postId);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to post comment.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {loading && <p className="text-sm text-gray-500">Loading comments...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && comments.length === 0 && (
            <p className="text-sm text-gray-500">No comments yet. Be the first to comment.</p>
          )}

          {!loading && !error && comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => {
                const authorName =
                  comment.author?.username || comment.author?.email || 'Unknown user';
                return (
                  <div key={comment._id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-900">{authorName}</p>
                    <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          {!isAuthenticated ? (
            <p className="text-sm text-gray-500">Log in to add a comment.</p>
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
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
