import { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import type { Meal } from '../types';
import { updatePost } from '../lib/api';

interface EditPostModalProps {
  isOpen: boolean;
  meal: Meal;
  onClose: () => void;
  onSave: (updatedMeal: Meal) => void;
}

export function EditPostModal({ isOpen, meal, onClose, onSave }: EditPostModalProps) {
  const [description, setDescription] = useState(meal.description);
  const [calories, setCalories] = useState(String(meal.calories));
  const [protein, setProtein] = useState(String(meal.protein ?? ''));
  const [carbs, setCarbs] = useState(String(meal.carbs ?? ''));
  const [fat, setFat] = useState(String(meal.fat ?? ''));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(meal.imageUrl);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError(null);

    const cal = Number(calories);
    if (!cal || cal <= 0) {
      setError('Calories must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('calories', String(cal));
      if (protein) formData.append('protein', protein);
      if (carbs) formData.append('carbs', carbs);
      if (fat) formData.append('fat', fat);
      if (imageFile) formData.append('image', imageFile);

      const response = await updatePost(meal.id, formData);
      const post = response.data;

      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const updatedMeal: Meal = {
        ...meal,
        description: post.description ?? description.trim(),
        calories: post.calories ?? cal,
        protein: post.protein ?? (protein ? Number(protein) : undefined),
        carbs: post.carbs ?? (carbs ? Number(carbs) : undefined),
        fat: post.fat ?? (fat ? Number(fat) : undefined),
        imageUrl: post.imageUrl?.startsWith('/uploads/')
          ? `${serverUrl}${post.imageUrl}`
          : meal.imageUrl,
      };

      onSave(updatedMeal);
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to update post.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Photo
            </label>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={imagePreview}
                alt="Meal preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Change image"
              >
                <Camera className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="edit-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 resize-none"
              placeholder="Describe your meal..."
            />
          </div>

          {/* Nutritional Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-calories" className="block text-sm font-medium text-gray-700 mb-1">
                Calories *
              </label>
              <input
                id="edit-calories"
                type="number"
                min="1"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
              />
            </div>
            <div>
              <label htmlFor="edit-protein" className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                id="edit-protein"
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
              />
            </div>
            <div>
              <label htmlFor="edit-carbs" className="block text-sm font-medium text-gray-700 mb-1">
                Carbs (g)
              </label>
              <input
                id="edit-carbs"
                type="number"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
              />
            </div>
            <div>
              <label htmlFor="edit-fat" className="block text-sm font-medium text-gray-700 mb-1">
                Fat (g)
              </label>
              <input
                id="edit-fat"
                type="number"
                min="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-lime-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
