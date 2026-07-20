const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://root:examplepassword@localhost:27018/courtmate?authSource=admin');

  // Get all users
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  if (!users.length) {
    console.log('No users found');
    process.exit(1);
  }

  // Get diverse tournaments by sport - pick one of each type
  const sports = ['PICKLEBALL', 'BADMINTON', 'TENNIS', 'FOOTBALL'];
  const selectedTournaments = [];

  for (const sport of sports) {
    const t = await mongoose.connection.db.collection('tournaments').findOne({
      sport,
      status: { $in: ['UPCOMING', 'OPEN', 'IN_PROGRESS'] },
      matchDates: { $exists: true, $not: { $size: 0 } },
    });
    if (t) selectedTournaments.push(t);
  }

  // Also add Night Challenge (different from regular Pickleball Open)
  const nightChallenge = await mongoose.connection.db.collection('tournaments').findOne({
    title: { $regex: 'Night Challenge' },
    status: { $in: ['UPCOMING', 'OPEN', 'IN_PROGRESS'] },
  });
  if (nightChallenge && !selectedTournaments.find(t => t._id.equals(nightChallenge._id))) {
    selectedTournaments.push(nightChallenge);
  }

  console.log('Selected tournaments:', selectedTournaments.map(t => `${t.sport}: ${t.title}`));

  if (!selectedTournaments.length) {
    console.log('No eligible tournaments found');
    process.exit(1);
  }

  const registrations = [];

  for (const user of users) {
    await mongoose.connection.db.collection('registrations').deleteMany({ playerId: user._id.toString() });

    for (const t of selectedTournaments) {
      registrations.push({
        tournamentId: t._id.toString(),
        playerId: user._id.toString(),
        categoryId: t.categories?.[0]?.id || 'unknown',
        status: 'PAID',
        amount: 5000,
        paymentMethod: 'PAYOS',
        paymentTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  if (registrations.length > 0) {
    const res = await mongoose.connection.db.collection('registrations').insertMany(registrations);
    console.log(`Inserted ${res.insertedCount} registrations for ${users.length} users.`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
