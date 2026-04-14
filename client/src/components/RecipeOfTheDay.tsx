import { Clock, Flame } from 'lucide-react';
import type { Recipe } from '../types';

interface RecipeOfTheDayProps {
  recipe: Recipe;
}

export function RecipeOfTheDay({ recipe }: RecipeOfTheDayProps) {
  return (
    <div className="bg-gradient-to-r from-lime-500 to-green-500 rounded-xl overflow-hidden mb-6 shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5">
      <div className="flex items-center gap-4 p-4">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-20 h-20 rounded-lg object-cover bg-white/20"
        />
        <div className="flex-1 text-white">
          <p className="text-xs font-medium uppercase tracking-wide opacity-90 mb-1">
            Recipe of the Day
          </p>
          <h3 className="font-semibold text-lg mb-2 leading-tight">{recipe.title}</h3>
          <div className="flex items-center gap-4 text-sm opacity-95">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              <span>{recipe.calories} cal</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.cookTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
