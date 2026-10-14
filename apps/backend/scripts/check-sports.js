const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  const sports = await db.collection('tournaments').distinct('sport');
  console.log('SPORTS_IN_DB:', sports);

  const nonTarget = await db.collection('tournaments').find({
    sport: { $nin: ['BADMINTON', 'PICKLEBALL'] }
  }, { projection: { title: 1, sport: 1 } }).toArray();

  console.log('NON_TARGET_COUNT:', nonTarget.length);
  console.log('NON_TARGET_SAMPLES:', nonTarget);

  const total = await db.collection('tournaments').countDocuments();
  console.log('TOTAL_TOURNAMENTS:', total);

  await client.close();
}

check().catch(console.error);
