const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');

async function migrateTournaments() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log('--- MIGRATING TOURNAMENT DATA & COVERS ---');

  // 1. Delete non-target (football, tennis, etc.)
  const nonTarget = await db.collection('tournaments').find({
    sport: { $nin: ['BADMINTON', 'PICKLEBALL'] }
  }).toArray();

  if (nonTarget.length > 0) {
    const ids = nonTarget.map(t => t._id);
    const idStrs = ids.map(id => id.toString());
    await db.collection('registrations').deleteMany({
      $or: [{ tournamentId: { $in: ids } }, { tournamentId: { $in: idStrs } }]
    });
    const delResult = await db.collection('tournaments').deleteMany({ _id: { $in: ids } });
    console.log(`Deleted ${delResult.deletedCount} non-racket tournaments.`);
  }

  // 2. Badminton Covers (Real tournament photos)
  const badCovers = [
    '/tournaments/badminton-1.jpg',
    '/tournaments/badminton-2.jpg',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521537634581-0dced2fed2a8?auto=format&fit=crop&w=1200&q=80'
  ];

  const badTournaments = await db.collection('tournaments').find({ sport: 'BADMINTON' }).toArray();
  for (let i = 0; i < badTournaments.length; i++) {
    const cover = badCovers[i % badCovers.length];
    await db.collection('tournaments').updateOne(
      { _id: badTournaments[i]._id },
      { $set: { coverImage: cover } }
    );
  }
  console.log(`Updated ${badTournaments.length} Badminton tournaments with authentic badminton tournament covers.`);

  // 3. Pickleball Covers (Real tournament championship photos)
  const pickCovers = [
    '/tournaments/pickleball-1.jpg',
    '/tournaments/pickleball-2.jpg'
  ];

  const pickTournaments = await db.collection('tournaments').find({ sport: 'PICKLEBALL' }).toArray();
  for (let i = 0; i < pickTournaments.length; i++) {
    const cover = pickCovers[i % pickCovers.length];
    await db.collection('tournaments').updateOne(
      { _id: pickTournaments[i]._id },
      { $set: { coverImage: cover } }
    );
  }
  console.log(`Updated ${pickTournaments.length} Pickleball tournaments with authentic pickleball championship covers.`);

  const remaining = await db.collection('tournaments').countDocuments();
  console.log(`TOTAL ACTIVE TOURNAMENTS IN DB: ${remaining}`);

  await client.close();
  console.log('--- TOURNAMENT IMAGE MIGRATION COMPLETE ---');
}

migrateTournaments().catch(console.error);
