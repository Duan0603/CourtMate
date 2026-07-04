/**
 * Phase 8: Multi-Region Scaling & Administration
 *
 * Adds compound indexes for city-based routing queries and
 * Phase 8 moderation fields (isHidden, isFeatured) to existing tournaments.
 */
module.exports = {
  async up(db) {
    // Helper function to create index safely by dropping existing index with different name on same key
    async function createIndexSafely(collectionName, keys, options) {
      const collection = db.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      
      const areKeysEqual = (key1, key2) => {
        const k1 = Object.keys(key1);
        const k2 = Object.keys(key2);
        if (k1.length !== k2.length) return false;
        for (let i = 0; i < k1.length; i++) {
          if (k1[i] !== k2[i] || key1[k1[i]] !== key2[k2[i]]) {
            return false;
          }
        }
        return true;
      };

      const existing = indexes.find(idx => areKeysEqual(idx.key, keys));
      
      if (existing) {
        if (existing.name === options.name) {
          console.log(`Index ${options.name} already exists on ${collectionName} with matching spec.`);
          return;
        }
        console.log(`Index on ${collectionName} exists with a different name: ${existing.name}. Dropping and recreating as ${options.name}...`);
        await collection.dropIndex(existing.name);
      }
      
      await collection.createIndex(keys, options);
      console.log(`Index ${options.name} created on ${collectionName}.`);
    }

    // 1. Add compound indexes for city-based tournament queries
    console.log('Creating compound indexes on tournaments collection...');
    await createIndexSafely('tournaments',
      { city: 1, sport: 1, createdAt: -1 },
      { name: 'idx_city_sport_created', background: true },
    );
    await createIndexSafely('tournaments',
      { city: 1, isHidden: 1 },
      { name: 'idx_city_hidden', background: true },
    );
    await createIndexSafely('tournaments',
      { 'organizer.id': 1 },
      { name: 'idx_organizer_id', background: true },
    );
    console.log('Tournament indexes created.');

    // 2. Add indexes on users collection for role and location queries
    console.log('Creating indexes on users collection...');
    await createIndexSafely('users',
      { role: 1 },
      { name: 'idx_role', background: true },
    );
    await createIndexSafely('users',
      { 'preferences.location': 1 },
      { name: 'idx_preferences_location', background: true },
    );
    await createIndexSafely('users',
      { email: 1 },
      { name: 'idx_email_unique', unique: true, background: true },
    );
    console.log('User indexes created.');

    // 3. Add Phase 8 moderation fields to existing tournaments (default values)
    console.log('Adding moderation fields to existing tournaments...');
    await db.collection('tournaments').updateMany(
      { isHidden: { $exists: false } },
      { $set: { isHidden: false, isFeatured: false, reportsCount: 0 } },
    );
    console.log('Moderation fields added to existing tournaments.');

    // 4. Add a REGIONAL_ADMIN user for Da Nang (for testing)
    const existingAdmin = await db.collection('users').findOne({
      role: 'REGIONAL_ADMIN',
      'preferences.location': 'Da Nang',
    });
    if (!existingAdmin) {
      await db.collection('users').insertOne({
        email: 'admin.danang@courtmate.vn',
        name: 'Admin Khu Vực Đà Nẵng',
        role: 'REGIONAL_ADMIN',
        preferences: {
          profileType: 'ORGANIZER',
          sports: ['BADMINTON', 'FOOTBALL', 'PICKLEBALL', 'TENNIS'],
          location: 'Da Nang',
        },
        isVerified: true,
        createdAt: new Date(),
      });
      console.log('Seeded REGIONAL_ADMIN user for Da Nang.');
    }
  },

  async down(db) {
    // Remove indexes
    await db.collection('tournaments').dropIndex('idx_city_sport_created').catch(() => {});
    await db.collection('tournaments').dropIndex('idx_city_hidden').catch(() => {});
    await db.collection('tournaments').dropIndex('idx_organizer_id').catch(() => {});
    await db.collection('users').dropIndex('idx_role').catch(() => {});
    await db.collection('users').dropIndex('idx_preferences_location').catch(() => {});
    // Note: not dropping idx_email_unique as it's essential

    // Remove moderation fields
    await db.collection('tournaments').updateMany(
      {},
      { $unset: { isHidden: '', isFeatured: '', reportsCount: '' } },
    );

    // Remove test REGIONAL_ADMIN
    await db.collection('users').deleteOne({ email: 'admin.danang@courtmate.vn' });

    console.log('Phase 8 migration rolled back.');
  },
};
