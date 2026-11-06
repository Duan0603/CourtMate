/**
 * Scale down online payment transactions to ~75 (between 70 and 80)
 * reflecting realistic online portal adoption while keeping the rest as APPROVED offline registrations.
 */

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://courtmate:a123456@cluster0.p055wf7.mongodb.net/courtmate?appName=Cluster0';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB Atlas...');
  const db = client.db('courtmate');

  const tournaments = await db.collection('tournaments').find({}).toArray();
  const tMap = new Map(tournaments.map(t => [t._id.toString(), t]));

  // Get all registrations excluding REJECTED
  const allRegs = await db.collection('registrations').find({ status: { $ne: 'REJECTED' } }).toArray();
  console.log(`Found ${allRegs.length} active registrations across ${tournaments.length} tournaments.`);

  // Target count: 76 transactions (realistic 70-80 range)
  const TARGET_COUNT = 76;

  // Sort registrations by createdAt ascending
  allRegs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Step sampling to ensure smooth, natural distribution across the entire timeline
  const step = allRegs.length / TARGET_COUNT;
  const selectedRegs = [];
  const selectedIds = new Set();

  for (let i = 0; i < TARGET_COUNT; i++) {
    const idx = Math.min(Math.floor(i * step + (Math.random() * 2 - 1)), allRegs.length - 1);
    const chosen = allRegs[Math.max(0, idx)];
    if (!selectedIds.has(chosen._id.toString())) {
      selectedIds.add(chosen._id.toString());
      selectedRegs.push(chosen);
    }
  }

  while (selectedRegs.length < TARGET_COUNT) {
    const randomPick = allRegs[Math.floor(Math.random() * allRegs.length)];
    if (!selectedIds.has(randomPick._id.toString())) {
      selectedIds.add(randomPick._id.toString());
      selectedRegs.push(randomPick);
    }
  }

  // Re-sort selected by createdAt
  selectedRegs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const now = new Date('2026-11-06T10:30:00.000Z');
  const paymentDocs = [];
  const paidRegUpdates = [];

  for (let i = 0; i < selectedRegs.length; i++) {
    const reg = selectedRegs[i];
    const t = tMap.get(reg.tournamentId);
    const catFees = (t?.categories || []).map(c => Number(c.fee)).filter(Number.isFinite);
    let amount = Number(t?.registrationFee || (catFees.length > 0 ? catFees[0] : 100000));
    if (!amount || amount < 1000) {
      amount = 100000;
    }

    const provider = Math.random() < 0.65 ? 'PAYOS' : 'MOMO';

    let regTime = reg.createdAt ? new Date(reg.createdAt) : new Date(now.getTime() - 15 * 86400000);
    let payTimeMs = regTime.getTime() + Math.floor((2 + Math.random() * 18) * 60 * 1000);
    if (payTimeMs > now.getTime()) {
      payTimeMs = now.getTime() - Math.floor(Math.random() * 2 * 86400000 + 1800000);
    }

    const payCreatedAt = new Date(payTimeMs);
    const processedAt = new Date(payTimeMs + Math.floor((30 + Math.random() * 75) * 1000));
    const orderId = String(payTimeMs).slice(-9) + String(Math.floor(100000 + Math.random() * 900000));

    let gatewayTransactionId;
    let gatewayResponse;

    if (provider === 'PAYOS') {
      gatewayTransactionId = 'POS' + Math.floor(1000000000 + Math.random() * 9000000000);
      gatewayResponse = {
        provider: 'PAYOS',
        code: '00',
        desc: 'Thành công'
      };
    } else {
      gatewayTransactionId = String(payTimeMs + Math.floor(Math.random() * 1000));
      gatewayResponse = {
        partnerCode: 'MOMOHHIY20251009_TEST',
        orderId,
        requestId: orderId,
        amount,
        resultCode: 0,
        message: 'Thành công.'
      };
    }

    paymentDocs.push({
      orderId,
      registrationId: reg._id.toString(),
      provider,
      amount,
      status: 'PAID',
      gatewayTransactionId,
      gatewayResponse,
      processedAt,
      createdAt: payCreatedAt,
      updatedAt: processedAt
    });

    paidRegUpdates.push({
      updateOne: {
        filter: { _id: reg._id },
        update: {
          $set: {
            status: 'PAID',
            paymentTransactionId: orderId,
            updatedAt: processedAt
          }
        }
      }
    });
  }

  // 1. Reset payment_transactions collection and insert exactly the 76 transactions
  console.log(`\nDeleting existing payment transactions and inserting ${paymentDocs.length} curated payments...`);
  await db.collection('payment_transactions').deleteMany({});
  await db.collection('payment_transactions').insertMany(paymentDocs);

  // 2. Update the other registrations to APPROVED status and clear paymentTransactionId
  console.log('Resetting non-online registrations to APPROVED status...');
  await db.collection('registrations').updateMany(
    { _id: { $nin: Array.from(selectedIds).map(id => new ObjectId(id)) }, status: { $ne: 'REJECTED' } },
    {
      $set: { status: 'APPROVED' },
      $unset: { paymentTransactionId: '' }
    }
  );

  // 3. Update the 76 selected registrations to PAID with their paymentTransactionId
  console.log(`Marking ${paidRegUpdates.length} selected registrations as PAID...`);
  await db.collection('registrations').bulkWrite(paidRegUpdates);

  // 4. Ensure joinedSlots for all tournaments matches (PAID + APPROVED)
  console.log('Verifying joinedSlots on all tournaments...');
  const regCounts = await db.collection('registrations').aggregate([
    {
      $match: { status: { $in: ['PAID', 'APPROVED'] } }
    },
    {
      $group: {
        _id: '$tournamentId',
        confirmedCount: { $sum: 1 }
      }
    }
  ]).toArray();

  for (const rc of regCounts) {
    await db.collection('tournaments').updateOne(
      { _id: new ObjectId(rc._id) },
      { $set: { joinedSlots: rc.confirmedCount } }
    );
  }

  // Verification & statistics
  const finalPayments = await db.collection('payment_transactions').countDocuments();
  const finalRevenue = await db.collection('payment_transactions').aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]).toArray();

  const providerCounts = await db.collection('payment_transactions').aggregate([
    { $group: { _id: '$provider', count: { $sum: 1 }, total: { $sum: '$amount' } } }
  ]).toArray();

  const regStatusCounts = await db.collection('registrations').aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]).toArray();

  const timeRange = await db.collection('payment_transactions').aggregate([
    {
      $group: {
        _id: null,
        earliest: { $min: '$createdAt' },
        latest: { $max: '$createdAt' }
      }
    }
  ]).toArray();

  const dailyDistribution = await db.collection('payment_transactions').aggregate([
    {
      $project: {
        day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
      }
    },
    { $group: { _id: '$day', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray();

  console.log('\n======================================================');
  console.log(' PAYMENT REDUCTION & SEEDING COMPLETED!');
  console.log('======================================================');
  console.log(`Total Payment Transactions: ${finalPayments} (Tầm 70-80 chuẩn thực tế)`);
  console.log(`Total Revenue from Web:     ${finalRevenue[0]?.total?.toLocaleString('vi-VN')} VNĐ`);
  console.log('Provider breakdown:', providerCounts);
  console.log('Registrations breakdown:', regStatusCounts);
  console.log('Payment Time Range:', timeRange);
  console.log(`Spanning ${dailyDistribution.length} different days across September, October, and November.`);
  console.log('Daily breakdown sample:', dailyDistribution.slice(0, 10));
  console.log('======================================================\n');

  await client.close();
}

run().catch(console.error);
