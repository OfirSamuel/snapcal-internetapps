import { analyzeMeal, generateRecipeOfTheDay } from './ai.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('AI Service', () => {
  const mockGenerateContent = jest.fn();

  beforeEach(() => {
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));
  });

  it('should return nutritional data from Gemini API', async () => {
    const nutritionData = { mealName: 'Grilled Chicken with Rice', calories: 500, protein: 30, carbs: 40, fat: 15 };
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(nutritionData) },
    });

    const result = await analyzeMeal('Grilled chicken with rice');
    expect(result).toEqual(nutritionData);
  });

  it('should extract JSON from markdown-wrapped response', async () => {
    const nutritionData = { mealName: 'Pasta with Tomato Sauce', calories: 350, protein: 20, carbs: 45, fat: 10 };
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => `Here is the analysis:\n\`\`\`json\n${JSON.stringify(nutritionData)}\n\`\`\``,
      },
    });

    const result = await analyzeMeal('Pasta with tomato sauce');
    expect(result).toEqual(nutritionData);
  });

  it('should throw on invalid AI response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Sorry, I cannot analyze that.' },
    });

    await expect(analyzeMeal('???')).rejects.toThrow('Invalid AI response');
  });

  it('should throw on empty description', async () => {
    await expect(analyzeMeal('')).rejects.toThrow('Description is required');
  });

  it('should propagate API errors', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API key invalid'));

    await expect(analyzeMeal('Some meal')).rejects.toThrow('API key invalid');
  });
});

describe('generateRecipeOfTheDay', () => {
  const mockGenerateContent = jest.fn();

  beforeEach(() => {
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));
  });

  it('should return a full recipe from Gemini API', async () => {
    const recipeData = {
      title: 'Quinoa Power Bowl',
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 14,
      cookTime: '20 min',
      ingredients: ['1 cup quinoa', '200g chicken breast', '1 avocado'],
      instructions: ['Cook quinoa according to package', 'Grill chicken', 'Assemble bowl'],
    };
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(recipeData) },
    });

    const result = await generateRecipeOfTheDay('2026-05-02');
    expect(result.title).toBe('Quinoa Power Bowl');
    expect(result.calories).toBe(420);
    expect(result.protein).toBe(28);
    expect(result.ingredients).toHaveLength(3);
    expect(result.instructions).toHaveLength(3);
    expect(result.cookTime).toBe('20 min');
  });

  it('should throw on invalid recipe response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Not valid JSON at all' },
    });

    await expect(generateRecipeOfTheDay('2026-05-02')).rejects.toThrow('Invalid AI response');
  });

  it('should throw on missing recipe fields', async () => {
    const incomplete = { title: 'Oats', calories: 300 };
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(incomplete) },
    });

    await expect(generateRecipeOfTheDay('2026-05-02')).rejects.toThrow('Invalid AI response');
  });
});
