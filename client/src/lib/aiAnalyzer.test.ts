import { describe, it, expect, vi } from 'vitest';
import { estimateCalories } from './aiAnalyzer';

vi.mock('./api', () => ({
  analyzeWithAI: vi.fn(),
}));

import { analyzeWithAI } from './api';

describe('aiAnalyzer', () => {
  it('should call backend API and return nutritional data', async () => {
    const mockData = { calories: 500, protein: 30, carbs: 40, fat: 15 };
    (analyzeWithAI as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockData });

    const result = await estimateCalories('Chicken rice');

    expect(result).toEqual(mockData);
    expect(analyzeWithAI).toHaveBeenCalledWith('Chicken rice');
  });

  it('should propagate API errors', async () => {
    (analyzeWithAI as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));

    await expect(estimateCalories('Bad request')).rejects.toThrow('Network Error');
  });
});
