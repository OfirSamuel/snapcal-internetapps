import { useState, useRef } from 'react';
import { X, Upload, Loader2, Camera } from 'lucide-react';
import { estimateCaloriesFromImage } from '../lib/aiAnalyzer';
import type { AIResult } from '../lib/aiAnalyzer';
import type { Meal } from '../types';
import { currentUser } from '../lib/mockData';
import { createPost } from '../lib/api';

interface CreateMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meal: Meal) => void;
}

export function CreateMealModal({ isOpen, onClose, onSubmit }: CreateMealModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setAnalysis(null);
    setAiError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-trigger AI analysis
    setAnalyzing(true);
    try {
      const result = await estimateCaloriesFromImage(file);
      setAnalysis(result);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'AI analysis failed. Please try again.';
      setAiError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageFile(null);
    setAnalysis(null);
    setAiError(null);
    setAnalyzing(false);
  };

  const handleRetryAnalysis = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setAiError(null);
    try {
      const result = await estimateCaloriesFromImage(imageFile);
      setAnalysis(result);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'AI analysis failed. Please try again.';
      setAiError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !analysis) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('calories', analysis.calories.toString());
      formData.append('protein', analysis.protein.toString());
      formData.append('carbs', analysis.carbs.toString());
      formData.append('fat', analysis.fat.toString());
      formData.append('mealName', analysis.mealName);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await createPost(formData);
      const post = response.data;

      const newMeal: Meal = {
        id: post._id,
        userId: currentUser.id,
        user: currentUser,
        imageUrl: `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${post.imageUrl}`,
        description: post.description || analysis.mealName,
        calories: post.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: post.createdAt || new Date().toISOString(),
      };

      onSubmit(newMeal);

      // Reset form
      setImageFile(null);
      setImageUrl('');
      setDescription('');
      setAnalysis(null);
      setAiError(null);
      onClose();
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Create Meal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Photo
            </label>
            {imageUrl ? (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Meal preview"
                  className="w-full h-full object-cover"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                    <span className="text-white font-medium text-sm">Scanning meal...</span>
                  </div>
                )}
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-lime-500 hover:text-lime-500 transition-colors bg-gray-50 hover:bg-lime-50/50"
              >
                <Camera className="w-12 h-12" />
                <span className="text-sm font-medium">Upload a meal photo to scan</span>
                <span className="text-xs text-gray-400">AI will automatically detect nutritional info</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* AI Error */}
          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700 mb-2">{aiError}</p>
              <button
                onClick={handleRetryAnalysis}
                className="text-sm font-medium text-red-600 hover:text-red-800 underline"
              >
                Retry analysis
              </button>
            </div>
          )}

          {/* AI Results */}
          {analysis && (
            <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-lime-700">Detected Meal</span>
                <span className="text-sm font-semibold text-gray-900">{analysis.mealName}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Calories</span>
                <span className="text-2xl font-bold text-gray-900">
                  {analysis.calories} kcal
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 bg-white/50 p-2 rounded border border-lime-100">
                <div>
                  <span className="font-medium text-gray-800">Protein:</span> {analysis.protein}g
                </div>
                <div>
                  <span className="font-medium text-gray-800">Carbs:</span> {analysis.carbs}g
                </div>
                <div>
                  <span className="font-medium text-gray-800">Fat:</span> {analysis.fat}g
                </div>
              </div>
            </div>
          )}

          {/* Description (optional) */}
          {imageFile && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note about your meal..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none bg-white"
                rows={3}
              />
            </div>
          )}

          {/* Publish Button */}
          <button
            onClick={handleSubmit}
            disabled={!imageFile || !analysis || submitting}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {submitting ? 'Publishing...' : 'Publish to Feed'}
          </button>
        </div>
      </div>
    </div>
  );
}
