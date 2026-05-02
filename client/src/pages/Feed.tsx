import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Newspaper, User } from 'lucide-react';
import { MealCard } from '../components/MealCard';
import { RecipeOfTheDay } from '../components/RecipeOfTheDay';
import { RecipeDetailModal } from '../components/RecipeDetailModal';
import { CreateMealModal } from '../components/CreateMealModal';
import type { Meal, Recipe } from '../types';
import { fetchPosts, fetchRecipeOfTheDay } from '../lib/api';

export default function Feed() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  useEffect(() => {
    fetchRecipeOfTheDay()
      .then((res) => setRecipe(res.data))
      .catch((err) => console.error('Failed to load recipe of the day', err));
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const response = await fetchPosts(page);
        const newMeals: Meal[] = response.data.map((post: any) => ({
          id: post._id,
          userId: post.author?._id || 'unknown',
          user: {
            id: post.author?._id || 'unknown',
            name: post.author?.username || 'Unknown User',
            username: post.author?.username || 'unknown',
            avatar:
              post.author?.avatarUrl ||
              post.author?.avatar ||
              'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown',
          },
          imageUrl: `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${post.imageUrl}`,
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
    navigate(`/posts/${id}/comments`);
  };

  const handleCreateMeal = (newMeal: Meal) => {
    setMeals([newMeal, ...meals]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen p-6">
        <h1 className="text-2xl font-bold text-lime-500 mb-8">SnapCal</h1>
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-lime-50 text-lime-600">
            <Newspaper className="w-5 h-5" />
            Feed
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-lime-50"
          >
            <PlusCircle className="w-5 h-5" />
            Create Meal
          </button>

          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-lime-50"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>
        </nav>
      </aside>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto p-6">
          {recipe && (
            <RecipeOfTheDay recipe={recipe} onClick={() => setRecipeModalOpen(true)} />
          )}

          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onLike={handleLike}
              onCommentClick={handleCommentClick}
            />
          ))}

          {!loading && !hasMore && meals.length > 0 && (
            <p className="text-center text-sm text-gray-500 py-6">No more meals to load</p>
          )}
          {!loading && !hasMore && meals.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-6">No meals to show yet.</p>
          )}
        </div>
      </main>

      <CreateMealModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateMeal}
      />

      {recipeModalOpen && recipe && (
        <RecipeDetailModal
          recipe={recipe}
          onClose={() => setRecipeModalOpen(false)}
        />
      )}
    </div>
  );
}
