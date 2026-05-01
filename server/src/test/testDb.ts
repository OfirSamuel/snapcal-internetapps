import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectTestDB = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

export const clearTestDB = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  const clearPromises = Object.values(collections).map((collection) => collection.deleteMany({}));
  await Promise.all(clearPromises);
};

export const disconnectTestDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};
