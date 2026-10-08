/**
 * Standalone seed script for 50 balanced mock feedbacks (Badminton & Pickleball only)
 * Rating distribution: 20x 5★, 22x 4★, 8x 3★ (Average ~4.24★)
 * Gender-matched avatars: 100% accurate (25 Nam, 25 Nữ)
 * Usage: node scripts/seed-feedbacks.js [--reset]
 */

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');
const { generate50Feedbacks } = require('./generate-mock-feedbacks');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('courtmate');
    const collection = db.collection('feedbacks');

    const shouldReset = process.argv.includes('--reset') || true;

    if (shouldReset) {
      await collection.deleteMany({});
      console.log('Cleaned old feedbacks from collection.');
    }

    const mockFeedbacks = generate50Feedbacks();
    await collection.insertMany(mockFeedbacks);

    const counts = {
      five: mockFeedbacks.filter(f => f.rating === 5).length,
      four: mockFeedbacks.filter(f => f.rating === 4).length,
      three: mockFeedbacks.filter(f => f.rating === 3).length,
    };
    const avgRating = (mockFeedbacks.reduce((acc, f) => acc + f.rating, 0) / mockFeedbacks.length).toFixed(2);

    console.log(`Inserted ${mockFeedbacks.length} balanced mock feedbacks (100% Cầu lông & Pickleball) into 'feedbacks' collection.`);
    console.log(`Rating breakdown: 5★ = ${counts.five}, 4★ = ${counts.four}, 3★ = ${counts.three} (Average: ${avgRating}★)`);

    await collection.createIndex({ createdAt: -1 });
    console.log('Index on createdAt: -1 verified.');

    const finalCount = await collection.countDocuments();
    console.log(`Total feedbacks in database: ${finalCount}`);
  } catch (err) {
    console.error('Error seeding feedbacks:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
