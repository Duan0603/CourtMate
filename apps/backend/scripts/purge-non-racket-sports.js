const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function purgeNonTargetSports() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log('--- PURGE INITIATED: ONLY KEEPING BADMINTON & PICKLEBALL ---');

  // 1. Identify non-target tournaments
  const nonTargetTournaments = await db.collection('tournaments').find({
    sport: { $nin: ['BADMINTON', 'PICKLEBALL'] }
  }, { projection: { _id: 1, title: 1, sport: 1 } }).toArray();

  console.log(`Found ${nonTargetTournaments.length} non-target tournaments to remove.`);

  if (nonTargetTournaments.length > 0) {
    const nonTargetIds = nonTargetTournaments.map(t => t._id);
    const nonTargetIdStrings = nonTargetIds.map(id => id.toString());

    // 2. Remove registrations associated with these tournaments
    const regDeleteResult = await db.collection('registrations').deleteMany({
      $or: [
        { tournamentId: { $in: nonTargetIds } },
        { tournamentId: { $in: nonTargetIdStrings } }
      ]
    });
    console.log(`Deleted ${regDeleteResult.deletedCount} registrations related to non-target tournaments.`);

    // 3. Remove tournaments
    const tourDeleteResult = await db.collection('tournaments').deleteMany({
      _id: { $in: nonTargetIds }
    });
    console.log(`Deleted ${tourDeleteResult.deletedCount} non-target tournaments.`);
  }

  // 4. Verify results
  const remainingSports = await db.collection('tournaments').distinct('sport');
  const remainingCount = await db.collection('tournaments').countDocuments();
  console.log('REMAINING_SPORTS_IN_DB:', remainingSports);
  console.log('TOTAL_REMAINING_TOURNAMENTS:', remainingCount);

  await client.close();
  console.log('--- PURGE COMPLETE ---');
}

purgeNonTargetSports().catch(console.error);
