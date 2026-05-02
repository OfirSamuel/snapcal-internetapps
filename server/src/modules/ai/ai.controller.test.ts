import request from 'supertest';
import app from '../../app';
import * as aiService from './ai.service';
import { Recipe } from './recipe.model';
import { connectTestDB, clearTestDB, disconnectTestDB } from '../../test/testDb';

jest.mock('./ai.service');

describe('AI Controller', () => {
  const mockAnalyzeMeal = aiService.analyzeMeal as jest.MockedFunction<typeof aiService.analyzeMeal>;

  it('should return 200 and nutritional data on valid request', async () => {
    const nutritionData = { mealName: 'Chicken Rice', calories: 500, protein: 30, carbs: 40, fat: 15 };
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

describe('GET /api/ai/recipe-of-the-day', () => {
  const mockGenerateRecipe = aiService.generateRecipeOfTheDay as jest.MockedFunction<typeof aiService.generateRecipeOfTheDay>;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  const mockRecipe = {
    title: 'Test Recipe',
    calories: 400,
    cookTime: '15 min',
    protein: 30,
    carbs: 40,
    fat: 12,
    ingredients: ['ingredient 1', 'ingredient 2'],
    instructions: ['step 1', 'step 2'],
  };

  it('should generate and return a new recipe if none exists for today', async () => {
    mockGenerateRecipe.mockResolvedValue(mockRecipe);

    const response = await request(app).get('/api/ai/recipe-of-the-day');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Test Recipe');
    expect(response.body.ingredients).toHaveLength(2);
    expect(response.body.instructions).toHaveLength(2);
    expect(mockGenerateRecipe).toHaveBeenCalledTimes(1);
  });

  it('should return cached recipe on subsequent calls', async () => {
    mockGenerateRecipe.mockResolvedValue(mockRecipe);

    await request(app).get('/api/ai/recipe-of-the-day');
    mockGenerateRecipe.mockClear();

    const response = await request(app).get('/api/ai/recipe-of-the-day');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Test Recipe');
    expect(mockGenerateRecipe).not.toHaveBeenCalled();
  });

  it('should return 500 when AI generation fails', async () => {
    mockGenerateRecipe.mockRejectedValue(new Error('AI generation failed'));

    const response = await request(app).get('/api/ai/recipe-of-the-day');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('AI generation failed');
  });
});
