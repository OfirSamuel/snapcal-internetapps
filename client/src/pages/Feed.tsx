import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { MealCard } from '../components/MealCard';
import { RecipeOfTheDay } from '../components/RecipeOfTheDay';
import { CreateMealModal } from '../components/CreateMealModal';
import type { Meal } from '../types';
import { recipeOfTheDay } from '../lib/mockData';
import { fetchPosts } from '../lib/api';

export default function Feed() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const response = await fetchPosts(page);
        const newMeals: Meal[] = response.data.map((post: any) => ({
          id: post._id,
          userId: post.author._id,
          user: {
            id: post.author._id,
            name: post.author.username,
            username: post.author.username,
            avatar: post.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          },
          imageUrl: `http://localhost:3001${post.imageUrl}`,
          description: post.description,
          calories: post.calories,
          likes: post.likes.length,
          comments: post.commentsCount,
          isLiked: false,
          createdAt: post.createdAt,
        }));
        
        if (newMeals.length === 0) setHasMore(false);
        setMeals((prev) => (page === 1 ? newMeals : [...prev, ...newMeals]));
      } catch (error) {
        console.error('Failed to load posts', error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

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
          {hasMore ? (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              className="text-gray-500 text-sm font-medium hover:text-lime-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more meals'}
            </button>
          ) : (
            <p className="text-gray-400 text-sm font-medium">No more meals to load</p>
          )}
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
