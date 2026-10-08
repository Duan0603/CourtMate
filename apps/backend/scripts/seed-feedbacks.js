/**
 * Standalone seed script for 100 positive 5-star feedbacks (Badminton & Pickleball only)
 * Usage: node scripts/seed-feedbacks.js [--reset]
 */

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');
const { generate100Feedbacks } = require('./generate-mock-feedbacks');

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

    const mockFeedbacks = generate100Feedbacks();
    await collection.insertMany(mockFeedbacks);
    console.log(`Inserted ${mockFeedbacks.length} positive 5-star feedbacks (100% Cầu lông & Pickleball) into 'feedbacks' collection.`);

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
