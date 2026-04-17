import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  avatar: string;
  email: string;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
