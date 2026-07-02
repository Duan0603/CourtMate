/**
 * Phase 8: Multi-Region Scaling & Administration
 *
 * Adds compound indexes for city-based routing queries and
 * Phase 8 moderation fields (isHidden, isFeatured) to existing tournaments.
 */
module.exports = {
  async up(db) {
    // 1. Add compound indexes for city-based tournament queries
    console.log('Creating compound indexes on tournaments collection...');
    await db.collection('tournaments').createIndex(
      { city: 1, sport: 1, createdAt: -1 },
      { name: 'idx_city_sport_created', background: true },
    );
    await db.collection('tournaments').createIndex(
      { city: 1, isHidden: 1 },
      { name: 'idx_city_hidden', background: true },
    );
    await db.collection('tournaments').createIndex(
      { 'organizer.id': 1 },
      { name: 'idx_organizer_id', background: true },
    );
    console.log('Tournament indexes created.');

    // 2. Add indexes on users collection for role and location queries
    console.log('Creating indexes on users collection...');
    await db.collection('users').createIndex(
      { role: 1 },
      { name: 'idx_role', background: true },
    );
    await db.collection('users').createIndex(
      { 'preferences.location': 1 },
      { name: 'idx_preferences_location', background: true },
    );
    await db.collection('users').createIndex(
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
