import { Heart, MessageCircle } from 'lucide-react';
import type { Meal } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface MealCardProps {
  meal: Meal;
  onLike: (id: string) => void;
  onCommentClick: (id: string) => void;
}

export function MealCard({ meal, onLike, onCommentClick }: MealCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={meal.user.avatar}
          alt={meal.user.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{meal.user.name}</p>
          <p className="text-sm text-gray-500">{meal.user.username}</p>
        </div>
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(meal.createdAt), { addSuffix: true })}
        </p>
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
          <span className="font-medium text-gray-900">{meal.user.username}</span>{' '}
          {meal.description}
        </p>
      </div>
    </div>
  );
}
