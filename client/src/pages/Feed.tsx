import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { MealCard } from '../components/MealCard';
import { RecipeOfTheDay } from '../components/RecipeOfTheDay';
import { CreateMealModal } from '../components/CreateMealModal';
import type { Meal } from '../types';
import { initialMeals, recipeOfTheDay } from '../lib/mockData';

export default function Feed() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleLike = (id: string) => {
    setMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.id === id
          ? {
              ...meal,
              isLiked: !meal.isLiked,
              likes: meal.isLiked ? meal.likes - 1 : meal.likes + 1,
            }
          : meal
      )
    );
  };

  const handleCommentClick = (id: string) => {
    console.log('Open comments for', id);
    // Future implementation: CommentsSheet
  };

  const handleCreateMeal = (newMeal: Meal) => {
    setMeals([newMeal, ...meals]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-lime-500 tracking-tight">SnapCal</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="text-lime-500 hover:text-lime-600 transition-colors"
          >
            <PlusCircle className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Recipe of the Day */}
        <RecipeOfTheDay recipe={recipeOfTheDay} />

        {/* Feed */}
        <div className="space-y-4">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onLike={handleLike}
              onCommentClick={handleCommentClick}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <button className="text-gray-500 text-sm font-medium hover:text-lime-500 transition-colors">
            Load more meals
          </button>
        </div>
      </div>

      {/* Create Meal Modal */}
      <CreateMealModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateMeal}
      />
    </div>
  );
}
