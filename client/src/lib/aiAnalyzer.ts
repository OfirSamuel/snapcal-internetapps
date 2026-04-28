import { analyzeWithAI } from './api';

export async function estimateCalories(description: string) {
  const response = await analyzeWithAI(description);
  return response.data;
}
