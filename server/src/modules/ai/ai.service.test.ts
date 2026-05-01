import { analyzeMeal } from './ai.service';
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
    const nutritionData = { calories: 500, protein: 30, carbs: 40, fat: 15 };
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(nutritionData) },
    });

    const result = await analyzeMeal('Grilled chicken with rice');
    expect(result).toEqual(nutritionData);
  });

  it('should extract JSON from markdown-wrapped response', async () => {
    const nutritionData = { calories: 350, protein: 20, carbs: 45, fat: 10 };
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
