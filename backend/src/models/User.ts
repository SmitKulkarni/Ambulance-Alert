import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  role: string;
  department: string;
  status: string;
  last_active: Date;
  organization_id?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, default: 'System Admin' },
  department: { type: String, required: true, default: 'General' },
  status: { type: String, required: true, default: 'Active' },
  last_active: { type: Date, default: Date.now },
  organization_id: { type: String }
});

export const User = mongoose.model<IUser>('User', UserSchema);
