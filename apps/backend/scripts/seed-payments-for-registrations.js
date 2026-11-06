/**
 * Seed realistic payment transactions for all tournament registrations
 * and distribute them evenly over time matching the registrations timeline.
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

  const registrations = await db.collection('registrations').find({}).toArray();
  const existingPayments = await db.collection('payment_transactions').find({}).toArray();
  const paidRegMap = new Map(existingPayments.map(p => [p.registrationId, p]));

  console.log(`- Tournaments count: ${tournaments.length}`);
  console.log(`- Total registrations in DB: ${registrations.length}`);
  console.log(`- Existing payments in DB: ${existingPayments.length}`);

  const newPayments = [];
  const regBulkOps = [];
  const now = new Date('2026-11-06T10:30:00.000Z');

  for (const reg of registrations) {
    const regIdStr = reg._id.toString();
    const existing = paidRegMap.get(regIdStr);

    if (existing) {
      // If already has payment, make sure registration links to its orderId
      if (!reg.paymentTransactionId || reg.paymentTransactionId !== existing.orderId) {
        regBulkOps.push({
          updateOne: {
            filter: { _id: reg._id },
            update: {
              $set: {
                paymentTransactionId: existing.orderId,
                status: existing.status === 'PAID' ? 'PAID' : reg.status
              }
            }
          }
        });
      }
      continue;
    }

    const t = tMap.get(reg.tournamentId);
    const catFees = (t?.categories || []).map(c => Number(c.fee)).filter(Number.isFinite);
    let amount = Number(t?.registrationFee || (catFees.length > 0 ? catFees[0] : 100000));
    if (!amount || amount < 1000) {
      amount = 100000;
    }

    const provider = Math.random() < 0.65 ? 'PAYOS' : 'MOMO';
    const isRejected = reg.status === 'REJECTED';
    const status = isRejected ? 'FAILED' : 'PAID';

    // Spread timing based on registration time
    let regTime = reg.createdAt ? new Date(reg.createdAt) : new Date(now.getTime() - 10 * 86400000);
    // User initiates payment 1 to 20 minutes after registration
    let payTimeMs = regTime.getTime() + Math.floor((1 + Math.random() * 19) * 60 * 1000);

    // Ensure timestamp does not exceed current time
    if (payTimeMs > now.getTime()) {
      payTimeMs = now.getTime() - Math.floor(Math.random() * 2 * 86400000 + 3600000);
    }

    const payCreatedAt = new Date(payTimeMs);
    const processedAt = new Date(payTimeMs + Math.floor((25 + Math.random() * 95) * 1000));
    const orderId = String(payTimeMs).slice(-9) + String(Math.floor(100000 + Math.random() * 900000));

    let gatewayTransactionId;
    let gatewayResponse;

    if (provider === 'PAYOS') {
      gatewayTransactionId = 'POS' + Math.floor(1000000000 + Math.random() * 9000000000);
      gatewayResponse = {
        provider: 'PAYOS',
        code: status === 'PAID' ? '00' : '01',
        desc: status === 'PAID' ? 'Thành công' : 'Giao dịch bị hủy bởi người dùng'
      };
    } else {
      gatewayTransactionId = String(payTimeMs + Math.floor(Math.random() * 1000));
      gatewayResponse = {
        partnerCode: 'MOMOHHIY20251009_TEST',
        orderId,
        requestId: orderId,
        amount,
        resultCode: status === 'PAID' ? 0 : 1006,
        message: status === 'PAID' ? 'Thành công.' : 'Giao dịch bị từ chối bởi người dùng.'
      };
    }

    newPayments.push({
      orderId,
      registrationId: regIdStr,
      provider,
      amount,
      status,
      gatewayTransactionId,
      gatewayResponse,
      processedAt,
      createdAt: payCreatedAt,
      updatedAt: processedAt
    });

    regBulkOps.push({
      updateOne: {
        filter: { _id: reg._id },
        update: {
          $set: {
            status: isRejected ? 'REJECTED' : 'PAID',
            paymentTransactionId: orderId,
            updatedAt: processedAt
          }
        }
      }
    });
  }

  console.log(`\nInserting ${newPayments.length} new payment transactions...`);
  if (newPayments.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < newPayments.length; i += batchSize) {
      const batch = newPayments.slice(i, i + batchSize);
      await db.collection('payment_transactions').insertMany(batch, { ordered: false });
      console.log(`  Inserted payments ${i + 1} to ${Math.min(i + batchSize, newPayments.length)}`);
    }
  }

  console.log(`Updating ${regBulkOps.length} registrations with payment info...`);
  if (regBulkOps.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < regBulkOps.length; i += batchSize) {
      const batch = regBulkOps.slice(i, i + batchSize);
      await db.collection('registrations').bulkWrite(batch, { ordered: false });
      console.log(`  Updated registrations ${i + 1} to ${Math.min(i + batchSize, regBulkOps.length)}`);
    }
  }

  // Recount joinedSlots for all tournaments based on active/paid registrations
  console.log('\nSynchronizing joinedSlots for all tournaments...');
  const regCounts = await db.collection('registrations').aggregate([
    {
      $match: { status: { $in: ['PAID', 'APPROVED'] } }
    },
    {
      $group: {
        _id: '$tournamentId',
        paidCount: { $sum: 1 }
      }
    }
  ]).toArray();

  for (const rc of regCounts) {
    await db.collection('tournaments').updateOne(
      { _id: new ObjectId(rc._id) },
      { $set: { joinedSlots: rc.paidCount, updatedAt: new Date() } }
    );
  }

  // Final summary stats
  const finalPaymentsCount = await db.collection('payment_transactions').countDocuments();
  const paymentStats = await db.collection('payment_transactions').aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$amount' }
      }
    }
  ]).toArray();

  const providerStats = await db.collection('payment_transactions').aggregate([
    {
      $group: {
        _id: '$provider',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]).toArray();

  const timeRange = await db.collection('payment_transactions').aggregate([
    {
      $group: {
        _id: null,
        earliestPayment: { $min: '$createdAt' },
        latestPayment: { $max: '$createdAt' }
      }
    }
  ]).toArray();

  const finalRegStats = await db.collection('registrations').aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  console.log('\n======================================================');
  console.log(' SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`Total Payment Transactions: ${finalPaymentsCount}`);
  console.log('Status breakdown:', paymentStats);
  console.log('Provider breakdown:', providerStats);
  console.log('Payment Time Range:', timeRange);
  console.log('Registrations Status Breakdown:', finalRegStats);
  console.log('======================================================\n');

  await client.close();
}

run().catch(err => {
  console.error('Fatal error seeding payments:', err);
  process.exit(1);
});
