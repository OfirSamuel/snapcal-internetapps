import { analyzeImageWithAI, analyzeWithAI } from './api';

export interface AIResult {
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function estimateCaloriesFromImage(imageFile: File): Promise<AIResult> {
  const response = await analyzeImageWithAI(imageFile);
  return response.data;
}

export async function estimateCalories(description: string): Promise<AIResult> {
  const response = await analyzeWithAI(description);
  return response.data;
}
