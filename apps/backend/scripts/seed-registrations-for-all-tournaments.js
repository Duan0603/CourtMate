/**
 * Seed registrations for all remaining tournaments (especially the 32 original tournaments)
 * so that EVERY tournament has realistic registrations and joinedSlots.
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin';

const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const MIDDLE_NAMES_MALE = ['Văn', 'Hữu', 'Đức', 'Quốc', 'Minh', 'Thành', 'Tuấn', 'Công', 'Gia', 'Trọng'];
const MIDDLE_NAMES_FEMALE = ['Thị', 'Ngọc', 'Thảo', 'Phương', 'Mai', 'Thanh', 'Khánh', 'Như', 'Hồng', 'Tuyết'];
const FIRST_NAMES_MALE = ['Huy', 'Nam', 'Hoàng', 'Duy', 'Bảo', 'Khoa', 'Tùng', 'Việt', 'Sơn', 'Dũng', 'Long', 'Kiên', 'Hải', 'Quân', 'Thịnh', 'Trí', 'Đạt'];
const FIRST_NAMES_FEMALE = ['Linh', 'Trang', 'Hương', 'Vy', 'Trâm', 'Ngọc', 'Nhi', 'Hà', 'My', 'Chi', 'Phương', 'Lan', 'Quỳnh', 'Châu', 'Tú', 'Yến'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  const prefixes = ['0905', '0914', '0935', '0979', '0983', '0903', '0913', '0932', '0968'];
  const prefix = getRandomItem(prefixes);
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${suffix}`;
}

function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '.');
}

function generateMoreUsers(count = 60) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.35;
    const lastName = getRandomItem(LAST_NAMES);
    const middleName = isMale ? getRandomItem(MIDDLE_NAMES_MALE) : getRandomItem(MIDDLE_NAMES_FEMALE);
    const firstName = isMale ? getRandomItem(FIRST_NAMES_MALE) : getRandomItem(FIRST_NAMES_FEMALE);
    const fullName = `${lastName} ${middleName} ${firstName}`;

    const email = `${removeAccents(firstName)}.${removeAccents(lastName)}${Math.floor(100 + Math.random() * 900)}@gmail.com`;

    users.push({
      _id: new ObjectId(),
      email,
      name: fullName,
      role: 'USER',
      preferences: {
        profileType: 'PLAYER',
        sports: [getRandomItem(['BADMINTON', 'PICKLEBALL', 'TENNIS', 'FOOTBALL'])],
        location: 'Da Nang',
        skillLevel: getRandomItem(['Beginner', 'Intermediate', 'Advanced']),
        district: getRandomItem(['Hải Châu', 'Sơn Trà', 'Cẩm Lệ', 'Ngũ Hành Sơn', 'Thanh Khê', 'Liên Chiểu']),
        clubName: 'CLB Thể thao Phong trào Đà Nẵng'
      },
      phone: getRandomPhone(),
      isVerified: Math.random() > 0.7,
      bookmarkedTournaments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return users;
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('courtmate');

  // 1. Approve existing pending registrations for Donex and other tournaments
  const pendingUpdate = await db.collection('registrations').updateMany(
    { status: 'PENDING' },
    { $set: { status: 'APPROVED', updatedAt: new Date() } }
  );
  console.log(`Updated ${pendingUpdate.modifiedCount} pending registrations to APPROVED.`);

  // 2. Add extra users to have a pool of ~200 players
  const currentUsers = await db.collection('users').find({}).toArray();
  console.log(`Current users in DB: ${currentUsers.length}`);

  if (currentUsers.length < 200) {
    const extraUsers = generateMoreUsers(65);
    const existingEmails = new Set(currentUsers.map(u => u.email));
    const toInsert = extraUsers.filter(u => !existingEmails.has(u.email));
    if (toInsert.length > 0) {
      await db.collection('users').insertMany(toInsert);
      console.log(`Inserted ${toInsert.length} additional player users.`);
    }
  }

  const allPlayers = await db.collection('users').find({ 'preferences.profileType': 'PLAYER' }).toArray();
  console.log(`Total player pool available: ${allPlayers.length}`);

  // 3. Find all tournaments with low confirmed registrations (< 5)
  const tournaments = await db.collection('tournaments').find({}).toArray();
  console.log(`Total tournaments in system: ${tournaments.length}`);

  let totalNewRegistrations = 0;

  for (const t of tournaments) {
    const existingRegs = await db.collection('registrations').find({ tournamentId: t._id.toString() }).toArray();
    const confirmedCount = existingRegs.filter(r => r.status === 'APPROVED' || r.status === 'PAID').length;
    const existingPlayerIds = new Set(existingRegs.map(r => r.playerId));

    const slots = t.slotsLimit || 32;

    // Target fill rate: 50% to 75%
    let target = 0;
    if (slots >= 200) {
      target = Math.floor(slots * 0.6); // e.g. ~153 for 256
    } else if (slots >= 100) {
      target = Math.floor(slots * 0.65); // e.g. ~80 for 128
    } else if (slots >= 50) {
      target = Math.floor(slots * 0.7); // e.g. ~35 for 50
    } else {
      target = Math.floor(slots * 0.75); // e.g. ~18 for 24, ~24 for 32
    }

    target = Math.max(8, Math.min(target, slots - 2));

    if (confirmedCount < target) {
      const needed = target - confirmedCount;
      const availablePlayers = allPlayers.filter(p => !existingPlayerIds.has(p._id.toString()));
      const shuffled = [...availablePlayers].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, needed);

      const newRegs = selected.map(player => {
        const isPaid = Math.random() < 0.25;
        const hasPartner = ['BADMINTON', 'PICKLEBALL'].includes(t.sport) || Math.random() > 0.5;
        const partnerName = hasPartner 
          ? `${getRandomItem(LAST_NAMES)} ${getRandomItem(MIDDLE_NAMES_MALE)} ${getRandomItem(FIRST_NAMES_MALE)}`
          : undefined;

        return {
          _id: new ObjectId(),
          tournamentId: t._id.toString(),
          playerId: player._id.toString(),
          playerName: player.name,
          partnerName,
          contactPhone: player.phone || getRandomPhone(),
          skillLevel: getRandomItem(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
          status: isPaid ? 'PAID' : 'APPROVED',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 15 + 1) * 86400000),
          updatedAt: new Date()
        };
      });

      if (newRegs.length > 0) {
        await db.collection('registrations').insertMany(newRegs);
        totalNewRegistrations += newRegs.length;
      }

      const totalConfirmedNow = confirmedCount + newRegs.length;
      await db.collection('tournaments').updateOne(
        { _id: t._id },
        { 
          $set: { 
            joinedSlots: totalConfirmedNow,
            slotsLimit: slots,
            updatedAt: new Date()
          } 
        }
      );

      console.log(`✓ [${t.title.slice(0, 35).padEnd(36)}] Slots: ${slots} | Added: ${newRegs.length} | Total Confirmed: ${totalConfirmedNow}`);
    } else {
      // Just ensure joinedSlots matches DB count
      await db.collection('tournaments').updateOne(
        { _id: t._id },
        { $set: { joinedSlots: confirmedCount } }
      );
    }
  }

  const finalTournaments = await db.collection('tournaments').countDocuments();
  const finalUsers = await db.collection('users').countDocuments();
  const finalRegs = await db.collection('registrations').countDocuments();

  console.log('\n========================================');
  console.log(`🎉 COMPLETED SEEDING ALL TOURNAMENTS!`);
  console.log(`Added ${totalNewRegistrations} new confirmed registrations.`);
  console.log(`Total Tournaments in DB:   ${finalTournaments}`);
  console.log(`Total Users in DB:         ${finalUsers}`);
  console.log(`Total Registrations in DB: ${finalRegs}`);
  console.log('========================================\n');

  await client.close();
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
