import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  avatar: string;
  avatarUrl?: string;
  passwordHash?: string;
  googleId?: string;
  refreshToken?: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String },
  avatar: { type: String, default: '' }, // kept for existing posts populate compatibility
  avatarUrl: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  refreshToken: { type: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
