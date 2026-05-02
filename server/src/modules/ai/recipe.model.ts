import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  calories: number;
  cookTime: string;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  generatedDate: string;
  createdAt: Date;
}

const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    calories: { type: Number, required: true },
    cookTime: { type: String, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    generatedDate: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

recipeSchema.index({ generatedDate: 1 }, { unique: true });

export const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);
