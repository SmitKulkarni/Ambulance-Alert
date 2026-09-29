import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://smitkulkarni176_db_user:Ri6bCi9elyzXXuD8@cluster0.jommuwz.mongodb.net/?appName=Cluster0';

export async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB] Connected successfully.');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    // Don't exit process, just log it so PostgreSQL can still run
  }
}

export const mongooseConnection = mongoose.connection;
