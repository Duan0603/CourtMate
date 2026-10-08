const { generate100Feedbacks } = require('../scripts/generate-mock-feedbacks');

module.exports = {
  async up(db, client) {
    const feedbacksCollection = db.collection('feedbacks');
    const existingCount = await feedbacksCollection.countDocuments();

    if (existingCount < 50) {
      const mockFeedbacks = generate100Feedbacks();
      await feedbacksCollection.insertMany(mockFeedbacks);
      console.log(`Successfully seeded ${mockFeedbacks.length} authentic balanced mock feedbacks into 'feedbacks' collection.`);
    } else {
      console.log(`'feedbacks' collection already contains ${existingCount} documents, skipping seed.`);
    }

    // Ensure index on createdAt for high-performance top-100 queries
    await feedbacksCollection.createIndex({ createdAt: -1 });
  },

  async down(db, client) {
    // Drop the feedbacks collection or clean up mock feedbacks
    await db.collection('feedbacks').deleteMany({ isVerified: true });
  }
};
