import { X, Flame, Clock, Dumbbell, Wheat, Droplets, UtensilsCrossed } from 'lucide-react';
import type { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-lime-500 to-green-500 rounded-t-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-lime-100 mb-1">
                Recipe of the Day
              </p>
              <h2 className="text-xl font-bold text-white">{recipe.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white transition-colors shadow-md"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Macros Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MacroCard icon={<Flame className="w-4 h-4 text-orange-500" />} label="Calories" value={`${recipe.calories}`} unit="kcal" />
            <MacroCard icon={<Dumbbell className="w-4 h-4 text-blue-500" />} label="Protein" value={`${recipe.protein}`} unit="g" />
            <MacroCard icon={<Wheat className="w-4 h-4 text-amber-500" />} label="Carbs" value={`${recipe.carbs}`} unit="g" />
            <MacroCard icon={<Droplets className="w-4 h-4 text-purple-500" />} label="Fat" value={`${recipe.fat}`} unit="g" />
          </div>

          {/* Cook Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{recipe.cookTime}</span>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-500 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
            <ol className="space-y-2">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lime-100 text-lime-700 font-semibold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function MacroCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold text-gray-900">{value}<span className="text-xs font-normal text-gray-500 ml-0.5">{unit}</span></p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
