import request from 'supertest';
import app from '../../app';
import * as aiService from './ai.service';

jest.mock('./ai.service');

describe('AI Controller', () => {
  const mockAnalyzeMeal = aiService.analyzeMeal as jest.MockedFunction<typeof aiService.analyzeMeal>;

  it('should return 200 and nutritional data on valid request', async () => {
    const nutritionData = { calories: 500, protein: 30, carbs: 40, fat: 15 };
    mockAnalyzeMeal.mockResolvedValue(nutritionData);

    const response = await request(app)
      .post('/api/ai/analyze')
      .send({ description: 'Chicken rice' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(nutritionData);
    expect(mockAnalyzeMeal).toHaveBeenCalledWith('Chicken rice');
  });

  it('should return 400 if description is missing', async () => {
    const response = await request(app)
      .post('/api/ai/analyze')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Description is required');
  });

  it('should return 400 if description is empty string', async () => {
    const response = await request(app)
      .post('/api/ai/analyze')
      .send({ description: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Description is required');
  });

  it('should return 400 if description exceeds 1000 characters', async () => {
    const response = await request(app)
      .post('/api/ai/analyze')
      .send({ description: 'a'.repeat(1001) });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Description must be under 1000 characters');
  });

  it('should return 500 when AI service throws', async () => {
    mockAnalyzeMeal.mockRejectedValue(new Error('Gemini API error'));

    const response = await request(app)
      .post('/api/ai/analyze')
      .send({ description: 'Something' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Gemini API error');
  });
});
