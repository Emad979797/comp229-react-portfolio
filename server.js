import dotenv from 'dotenv';
dotenv.config({ path: new URL('./.env', import.meta.url).pathname });
import mongoose from 'mongoose';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Set JWT_SECRET to at least 32 random characters in .env');
if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env');
const { default: app } = await import('./server/express.js');
try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'Portfolio', serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB database: Portfolio');
  const port = Number(process.env.PORT) || 3000;
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(port, error => error ? reject(error) : resolve(listener));
    listener.on('error', reject);
  });
  console.log(`Portfolio server running on port ${port}`);
  async function shutdown() { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error('Startup failed. Check the database connection and whether PORT is available. Error:', error.code || error.name);
  await mongoose.disconnect();
  process.exitCode = 1;
}
