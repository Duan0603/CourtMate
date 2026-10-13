const path = require('path');

function getFeedbackGenerator() {
  const possiblePaths = [
    '../scripts/generate-mock-feedbacks',
    path.join(__dirname, '../scripts/generate-mock-feedbacks'),
    path.join(process.cwd(), 'scripts/generate-mock-feedbacks'),
    path.join(process.cwd(), 'apps/backend/scripts/generate-mock-feedbacks'),
  ];

  for (const p of possiblePaths) {
    try {
      const mod = require(p);
      if (mod && (mod.generate100Feedbacks || mod.generate50Feedbacks)) {
        return mod.generate100Feedbacks || mod.generate50Feedbacks;
      }
    } catch {}
  }

  // Resilient fallback in case external script cannot be loaded
  return () => [
    {
      userName: 'Nguyễn Thành Long',
      userRole: 'Pickleball Sơn Trà • DUPR 3.5',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: 'CourtMate giúp mình tìm được bạn chơi Pickleball cùng trình độ chỉ trong vòng 10 phút. Giao diện cực kỳ mượt và dễ thao tác trên điện thoại!',
      category: 'Ghép trận on-demand',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userName: 'Trần Thảo Linh',
      userRole: 'Cầu lông Hải Châu • Trình độ B',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 4,
      comment: 'Tìm bạn đánh đôi cầu lông rất tiện lợi. Đăng kèo nhanh, đối thủ lịch sự, mong app bổ sung thêm tính năng lưu video highlight trận đấu.',
      category: 'Tìm bạn chơi đôi',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
}

module.exports = {
  async up(db, client) {
    const feedbacksCollection = db.collection('feedbacks');
    const existingCount = await feedbacksCollection.countDocuments();

    if (existingCount < 50) {
      const generator = getFeedbackGenerator();
      const mockFeedbacks = generator();
      if (mockFeedbacks && mockFeedbacks.length > 0) {
        await feedbacksCollection.insertMany(mockFeedbacks);
        console.log(`Successfully seeded ${mockFeedbacks.length} authentic balanced mock feedbacks into 'feedbacks' collection.`);
      }
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
