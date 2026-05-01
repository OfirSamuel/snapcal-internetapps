import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  description?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealName?: string;
  imageUrl: string;
  author: mongoose.Types.ObjectId;
  likes: string[];
  commentsCount: number;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  description: { type: String },
  calories: { type: Number, required: true },
  protein: { type: Number },
  carbs: { type: Number },
  fat: { type: Number },
  mealName: { type: String },
  imageUrl: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: String }],
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IPost>('Post', PostSchema);
