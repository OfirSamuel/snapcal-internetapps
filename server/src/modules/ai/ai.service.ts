import { GoogleGenerativeAI } from '@google/generative-ai';

export interface RecipeOfTheDayResult {
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
}

export interface AIAnalysisResult {
  mealName: string;
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Estimate the nutritional content of the following meal: "${description}". Return ONLY a JSON object with these exact keys: "mealName", "calories", "protein", "carbs", "fat". "mealName" should be a short descriptive name of the meal. All numeric values must be numbers. No additional text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseAIResponse(text);
};

export const analyzeMealImage = async (imageBuffer: Buffer, mimeType: string): Promise<AIAnalysisResult> => {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Image is required');
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}. Allowed: ${allowedMimeTypes.join(', ')}`);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Analyze this meal image and estimate its nutritional content. Return ONLY a JSON object with these exact keys: "mealName", "calories", "protein", "carbs", "fat". "mealName" should be a short descriptive name of the detected meal (e.g., "Grilled Chicken with Rice"). "calories" is total kcal. "protein", "carbs", "fat" are in grams. All numeric values must be numbers. No additional text.`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();

  return parseAIResponse(text);
};

function parseAIResponse(text: string): AIAnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response: no JSON found');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed.mealName !== 'string' ||
    typeof parsed.calories !== 'number' ||
    typeof parsed.protein !== 'number' ||
    typeof parsed.carbs !== 'number' ||
    typeof parsed.fat !== 'number'
  ) {
    throw new Error('Invalid AI response: missing or invalid fields');
  }

  return {
    mealName: parsed.mealName,
    calories: parsed.calories,
    protein: parsed.protein,
    carbs: parsed.carbs,
    fat: parsed.fat,
  };
}

export const generateRecipeOfTheDay = async (date: string): Promise<RecipeOfTheDayResult> => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a professional nutritionist. Generate a unique healthy recipe for the date ${date}. The recipe should be nutritious, easy to make, and appealing. Return ONLY a JSON object with these exact keys:
- "title": a catchy recipe name (string)
- "calories": total kcal per serving (number)
- "protein": grams of protein per serving (number)
- "carbs": grams of carbs per serving (number)
- "fat": grams of fat per serving (number)
- "cookTime": total preparation and cooking time (string, e.g. "25 min")
- "ingredients": array of ingredient strings with quantities (e.g. ["200g chicken breast", "1 cup brown rice"])
- "instructions": array of step-by-step instruction strings (e.g. ["Preheat oven to 180°C", "Season the chicken"])

No additional text, only the JSON object.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response: no JSON found for recipe');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed.title !== 'string' ||
    typeof parsed.calories !== 'number' ||
    typeof parsed.protein !== 'number' ||
    typeof parsed.carbs !== 'number' ||
    typeof parsed.fat !== 'number' ||
    typeof parsed.cookTime !== 'string' ||
    !Array.isArray(parsed.ingredients) ||
    !Array.isArray(parsed.instructions)
  ) {
    throw new Error('Invalid AI response: missing or invalid recipe fields');
  }

  return {
    title: parsed.title,
    calories: parsed.calories,
    protein: parsed.protein,
    carbs: parsed.carbs,
    fat: parsed.fat,
    cookTime: parsed.cookTime,
    ingredients: parsed.ingredients,
    instructions: parsed.instructions,
  };
};
