import { useState, useRef } from 'react';
import { X, Upload, Sparkles, Loader2 } from 'lucide-react';
import { estimateCalories } from '../lib/aiAnalyzer';
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
  const [analysis, setAnalysis] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!description) return;
    
    setAnalyzing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = estimateCalories(description);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!imageFile || !description || !analysis) return;

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('calories', analysis.calories.toString());
      formData.append('image', imageFile);

      const response = await createPost(formData);
      const post = response.data;

      const newMeal: Meal = {
        id: post._id,
        userId: currentUser.id,
        user: currentUser,
        imageUrl: `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${post.imageUrl}`,
        description: post.description,
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
      onClose();
    } catch (error) {
      console.error('Failed to create post', error);
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
                <button
                  onClick={() => {
                    setImageUrl('');
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-lime-500 hover:text-lime-500 transition-colors bg-gray-50 hover:bg-lime-50/50"
              >
                <Upload className="w-10 h-10" />
                <span className="text-sm font-medium">Upload Photo</span>
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

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grilled chicken breast with 200g white rice and steamed broccoli"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none bg-white"
              rows={4}
            />
          </div>

          {/* AI Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!description || analyzing}
            className="w-full bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-lg px-6 py-3 font-medium flex items-center justify-center gap-2 hover:from-lime-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-md shadow-lime-500/20"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze with AI
              </>
            )}
          </button>

          {/* Results */}
          {analysis && (
            <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">AI Estimate</span>
                <span className="text-2xl font-bold text-gray-900">
                  {analysis.calories} cal
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

          {/* Publish Button */}
          <button
            onClick={handleSubmit}
            disabled={!imageFile || !description || !analysis}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Publish to Feed
          </button>
        </div>
      </div>
    </div>
  );
}
