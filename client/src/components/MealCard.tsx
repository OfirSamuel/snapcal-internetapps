import { Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import type { Meal } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface MealCardProps {
  meal: Meal;
  onLike: (id: string) => void;
  onCommentClick: (id: string) => void;
  onEdit?: (meal: Meal) => void;
  onDelete?: (id: string) => void;
}

export function MealCard({ meal, onLike, onCommentClick, onEdit, onDelete }: MealCardProps) {
  const displayName = meal.user.name || meal.user.username || 'Unknown User';
  const username = meal.user.username || '';
  const avatarSrc =
    meal.user.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username || displayName)}`;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={avatarSrc}
          alt={displayName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{displayName}</p>
          <p className="text-sm text-gray-500">{username}</p>
        </div>
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(meal.createdAt), { addSuffix: true })}
        </p>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 ml-2">
            {onEdit && (
              <button
                onClick={() => onEdit(meal)}
                className="p-1.5 rounded-md text-gray-400 hover:text-lime-600 hover:bg-lime-50 transition-colors"
                aria-label="Edit post"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(meal.id)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-100 cursor-pointer overflow-hidden group">
        <img
          src={meal.imageUrl}
          alt={meal.description}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Actions and Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(meal.id)}
              className="flex items-center gap-2 transition-colors group outline-none"
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  meal.isLiked
                    ? 'fill-lime-500 text-lime-500 scale-110'
                    : 'text-gray-700 group-hover:text-lime-500 active:scale-95'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">{meal.likes}</span>
            </button>
            <button
              onClick={() => onCommentClick(meal.id)}
              className="flex items-center gap-2 transition-colors group outline-none active:scale-95"
            >
              <MessageCircle className="w-6 h-6 text-gray-700 group-hover:text-lime-500" />
              <span className="text-sm font-medium text-gray-700">{meal.comments}</span>
            </button>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{meal.calories}</p>
            <p className="text-xs text-gray-500">calories</p>
          </div>
        </div>

        {/* Macros */}
        {meal.protein !== undefined && meal.carbs !== undefined && meal.fat !== undefined && (
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
            <div>
              <span className="font-medium">P:</span> {meal.protein}g
            </div>
            <div>
              <span className="font-medium">C:</span> {meal.carbs}g
            </div>
            <div>
              <span className="font-medium">F:</span> {meal.fat}g
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-medium text-gray-900">{username}</span>{' '}
          {meal.description}
        </p>
      </div>
    </div>
  );
}
