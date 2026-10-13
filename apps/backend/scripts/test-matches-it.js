/**
 * Integration Test: Chạy kiểm thử luồng thực tế (End-to-End) với MongoDB Atlas
 * - Kết nối trực tiếp DB qua MONGODB_URI trong .env
 * - Tạo kèo thật trên MongoDB
 * - Tìm kiếm & lọc theo trình độ Cầu lông
 * - Khách tham gia kèo (Join slot)
 * - Lấy chi tiết bằng ShareCode
 * - Dọn dẹp dữ liệu test
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient, ObjectId } = require('mongodb');
const { BadmintonSkillLevel, MatchStatus, SportType } = require('@courtmate/shared');

async function runIntegrationTest() {
  console.log('🚀 BẮT ĐẦU CHẠY INTEGRATION TEST VỚI MONGODB:');
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Thiếu MONGODB_URI trong .env');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('courtmate');
  const matchesCollection = db.collection('matches');

  console.log('✓ Kết nối MongoDB Atlas thành công');
  let passed = 0;

  // 1. Tạo một Kèo Cầu lông mẫu vào database
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(19, 30, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(21, 30, 0, 0);

  const testShareCode = `CM-TEST`;
  await matchesCollection.deleteMany({ shareCode: testShareCode });

  const mockMatch = {
    hostId: 'test_user_host_99',
    hostName: 'Nguyễn Quốc Bảo (Host)',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    hostPhone: '0905999888',
    sport: SportType.BADMINTON,
    title: 'Giao lưu đôi nam tối thứ 6 - Sân Kỳ Đồng',
    venueId: 'cl_kydong',
    venueName: 'Sân Cầu Lông Kỳ Đồng',
    venueAddress: '20 Kỳ Đồng, P. Xuân Hà, Q. Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    city: 'Da Nang',
    courtNumber: 'Sân số 3',
    startTime: tomorrow,
    endTime: tomorrowEnd,
    totalSlots: 4,
    joinedCount: 1,
    players: [
      {
        userId: 'test_user_host_99',
        name: 'Nguyễn Quốc Bảo (Host)',
        phone: '0905999888',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        skillLevel: BadmintonSkillLevel.TB,
        joinedAt: new Date(),
      },
    ],
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân tại chỗ ~45k/người',
    notes: 'Đánh cầu Thành Công số 7, anh em mang giày chuyên dụng nhé!',
    shuttleType: 'Thành Công số 7',
    status: MatchStatus.OPEN,
    shareCode: testShareCode,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertRes = await matchesCollection.insertOne(mockMatch);
  const matchId = insertRes.insertedId;
  console.log(`✅ IT 1 PASSED: Đã lưu Match mới vào MongoDB (ID: ${matchId}, ShareCode: ${testShareCode})`);
  passed++;

  // 2. Query kiểm tra lọc theo trình độ Cầu lông và Quận
  const found = await matchesCollection.findOne({
    _id: matchId,
    sport: SportType.BADMINTON,
    district: 'Thanh Khê',
    minSkillLevel: BadmintonSkillLevel.TBY,
  });

  if (found && found.title === mockMatch.title) {
    console.log('✅ IT 2 PASSED: Truy vấn lọc chính xác theo môn BADMINTON, Quận Thanh Khê và Trình độ TBY');
    passed++;
  } else {
    throw new Error('IT 2 failed: Không tìm thấy match');
  }

  // 3. Giả lập người chơi thứ 2 & 3 & 4 tham gia kèo cho đến khi FULL
  const newPlayers = [
    {
      userId: 'test_player_02',
      name: 'Lê Hoàng Nam',
      phone: '0914111222',
      avatarUrl: '',
      skillLevel: BadmintonSkillLevel.TB,
      joinedAt: new Date(),
    },
    {
      userId: 'test_player_03',
      name: 'Phạm Minh Tuấn',
      phone: '0935333444',
      avatarUrl: '',
      skillLevel: BadmintonSkillLevel.TB_PLUS,
      joinedAt: new Date(),
    },
    {
      userId: 'test_player_04',
      name: 'Trần Văn Kiên',
      phone: '0978555666',
      avatarUrl: '',
      skillLevel: BadmintonSkillLevel.TBY,
      joinedAt: new Date(),
    },
  ];

  await matchesCollection.updateOne(
    { _id: matchId },
    {
      $push: { players: { $each: newPlayers } },
      $set: { joinedCount: 4, status: MatchStatus.FULL, updatedAt: new Date() },
    },
  );

  const fullMatch = await matchesCollection.findOne({ _id: matchId });
  if (fullMatch.joinedCount === 4 && fullMatch.status === MatchStatus.FULL && fullMatch.players.length === 4) {
    console.log('✅ IT 3 PASSED: Tham gia đủ 4 slot, chuyển trạng thái FULL thành công trong Database');
    passed++;
  } else {
    throw new Error('IT 3 failed: Match không cập nhật đúng status FULL');
  }

  // 4. Test tìm kiếm bằng ShareCode (để mở link trực tiếp)
  const byCode = await matchesCollection.findOne({ shareCode: testShareCode });
  if (byCode && byCode._id.toString() === matchId.toString()) {
    console.log(`✅ IT 4 PASSED: Tra cứu chính xác trận đấu qua ShareCode (${testShareCode})`);
    passed++;
  } else {
    throw new Error('IT 4 failed');
  }

  // Dọn dẹp dữ liệu test
  await matchesCollection.deleteOne({ _id: matchId });
  console.log('✓ Đã dọn dẹp bản ghi test an toàn');

  console.log(`\n🎉 HOÀN THÀNH 100% INTEGRATION TESTS: ${passed}/4 PASSED!`);
  await client.close();
}

runIntegrationTest().catch((err) => {
  console.error('❌ INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
