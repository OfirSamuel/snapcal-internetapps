import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysisResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const analyzeMeal = async (description: string): Promise<AIAnalysisResult> => {
  if (!description) {
    throw new Error('Description is required');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Estimate the nutritional content of the following meal: "${description}". Return ONLY a JSON object with these exact keys: "calories", "protein", "carbs", "fat". All values must be numbers. No additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;

  if (
    typeof parsed.calories !== 'number' ||
    typeof parsed.protein !== 'number' ||
    typeof parsed.carbs !== 'number' ||
    typeof parsed.fat !== 'number'
  ) {
    throw new Error('Invalid AI response');
  }

  return {
    calories: parsed.calories,
    protein: parsed.protein,
    carbs: parsed.carbs,
    fat: parsed.fat,
  };
};
