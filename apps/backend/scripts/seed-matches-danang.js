/**
 * Seed 12 kèo giao lưu Cầu lông & Pickleball mẫu thực tế tại các quận Đà Nẵng
 * Thời gian mới cập nhật, các kèo quá khứ tự động set trạng thái COMPLETED
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');
const { BadmintonSkillLevel, MatchStatus, SportType } = require('@courtmate/shared');

const SAMPLE_MATCHES = [
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông đôi nam nữ vui vẻ tối nay',
    venueName: 'Sân Cầu Lông Kỳ Đồng',
    venueAddress: '20 Kỳ Đồng, P. Xuân Hà, Q. Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    offsetDays: 0,
    startHour: 19,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~35k/người)',
    notes: 'Đánh cầu nhẹ nhàng dưỡng sinh, anh em mới chơi vào giao lưu nhé!',
    shuttleType: 'Hải Yến xanh',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Tuyển 2 chân cứng cọ xát đôi nam tối mai',
    venueName: 'Sân Cầu Lông Ngũ Hành',
    venueAddress: 'K234 Lê Văn Hiến, Q. Ngũ Hành Sơn, Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    city: 'Da Nang',
    courtNumber: 'Sân 4',
    offsetDays: 1,
    startHour: 18,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TB_PLUS,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~45k/người)',
    notes: 'Đánh cầu Thành Công số 7, kèo bao sung, anh em thể lực tốt nhé',
    shuttleType: 'Thành Công số 7',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Sơn Trà - Đôi nam nữ cọ xát cuối tuần',
    venueName: 'Cụm Sân Pickleball Biển Mỹ Khê',
    venueAddress: 'Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    offsetDays: 2,
    startHour: 16,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Sân ngoài trời lộng gió biển, bóng Franklin X-40 chuẩn quốc tế',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo sáng Chủ Nhật sân Tuyên Sơn rèn thể lực',
    venueName: 'Cung Thể Thao Tiên Sơn',
    venueAddress: '01 Phan Đăng Lưu, P. Hòa Cường Bắc, Q. Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 6',
    offsetDays: 3,
    startHour: 8,
    durationHours: 2,
    totalSlots: 6,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~50k/người)',
    notes: 'Sân sàn thảm tiêu chuẩn thi đấu, không khí thoáng mát',
    shuttleType: 'Thành Công số 7',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Rookie Cẩm Lệ - Dành cho các bạn mới tập',
    venueName: 'Sân Pickleball Hòa Xuân',
    venueAddress: 'Đường 29 Tháng 3, P. Hòa Xuân, Q. Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    city: 'Da Nang',
    courtNumber: 'Sân 3',
    offsetDays: 1,
    startHour: 17,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Có bóng và vợt mượn miễn phí nếu chưa có vợt riêng',
    shuttleType: 'Bóng Dura Fast 40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo nâng cao Khá+ cọ xát chuẩn bị đánh giải',
    venueName: 'Sân Cầu Lông Bưu Điện',
    venueAddress: 'Nguyễn Du, P. Thạch Thang, Q. Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    offsetDays: 4,
    startHour: 19,
    durationHours: 2.5,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.KHA,
    maxSkillLevel: BadmintonSkillLevel.KHA_PLUS,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~60k/người)',
    notes: 'Đánh tốc độ cao, chiến thuật bài bản, tuyển bạn có kinh nghiệm giải',
    shuttleType: 'Victor Master',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu Liên Chiểu - Đôi nam nữ thư giãn',
    venueName: 'CLB Cầu Lông Hòa Khánh',
    venueAddress: 'Đường Số 4, KCN Hòa Khánh, Q. Liên Chiểu, Đà Nẵng',
    district: 'Liên Chiểu',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    offsetDays: 2,
    startHour: 18,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~30k/người)',
    notes: 'Đánh giao lưu vui khỏe, có nước trà chanh đá miễn phí',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Trung cấp - Đấu đôi tính điểm DUPR',
    venueName: 'Sân Thể Thao FPT City',
    venueAddress: 'Khu Đô Thị FPT City, Q. Ngũ Hành Sơn, Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    offsetDays: 3,
    startHour: 19,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Ghi hình lại các set đấu để xem lại chiến thuật',
    shuttleType: 'Bóng Franklin X-40',
  },
  // ─── CÁC TRẬN ĐÃ QUA (TRẠNG THÁI: ĐÃ HOÀN THÀNH) ───
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông đôi nam nữ Hải Châu',
    venueName: 'Sân Cầu Lông Chi Lăng',
    venueAddress: '38 Chi Lăng, P. Hải Châu 2, Q. Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    offsetDays: -1,
    startHour: 18,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Trận đấu đã kết thúc với tỉ số hữu nghị 21-19, 22-20',
    shuttleType: 'Hải Yến đỏ',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball cọ xát đôi nam Thanh Khê',
    venueName: 'Sân Pickleball Kỳ Đồng',
    venueAddress: 'Kỳ Đồng, Q. Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    offsetDays: -2,
    startHour: 17,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Trận đấu đã hoàn thành tốt đẹp',
    shuttleType: 'Bóng Franklin X-40',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo nâng cao Sơn Trà Club',
    venueName: 'Sân Cầu Lông Sơn Trà Club',
    venueAddress: 'Trần Nhân Tông, Q. Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    city: 'Da Nang',
    courtNumber: 'Sân 3',
    offsetDays: -3,
    startHour: 20,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.KHA,
    maxSkillLevel: BadmintonSkillLevel.KHA_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~55k/người)',
    notes: 'Đã hoàn thành thi đấu giao lưu 5 set căng thẳng',
    shuttleType: 'Victor Master',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Giao lưu Pickleball Cẩm Lệ sáng sớm',
    venueName: 'Sân Pickleball Hòa Xuân',
    venueAddress: 'Đường 29 Tháng 3, Q. Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    offsetDays: -4,
    startHour: 6,
    durationHours: 2,
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~35k/người)',
    notes: 'Trận đấu giao lưu buổi sáng đã kết thúc',
    shuttleType: 'Bóng Franklin X-40',
    forceStatus: MatchStatus.COMPLETED,
  },
];

async function seedMatches() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Thiếu MONGODB_URI');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('courtmate');
  const collection = db.collection('matches');

  // Lấy một vài user thật có sẵn làm Host và Players
  const users = await db.collection('users').find({}).limit(10).toArray();
  const defaultHost = users[0] || {
    _id: 'host_default',
    name: 'Nguyễn Văn Minh',
    phone: '0905123456',
  };

  const matchesToInsert = [];
  const now = new Date();

  for (let i = 0; i < SAMPLE_MATCHES.length; i++) {
    const s = SAMPLE_MATCHES[i];
    const hostUser = users[i % users.length] || defaultHost;

    const start = new Date(now);
    start.setDate(start.getDate() + s.offsetDays);
    start.setHours(s.startHour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + s.durationHours, 30, 0, 0);

    const shareCode = `CM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Host tự động là người đầu tiên
    const players = [
      {
        userId: hostUser._id.toString(),
        name: hostUser.name || 'Chủ Kèo',
        phone: hostUser.phone || '0905123456',
        avatarUrl: hostUser.avatarUrl || '',
        skillLevel: s.minSkillLevel,
        joinedAt: new Date(start.getTime() - 86400000),
      },
    ];

    let joinedCount = 1;
    if (users.length > 2) {
      const guestUser = users[(i + 1) % users.length];
      players.push({
        userId: guestUser._id.toString(),
        name: guestUser.name || 'Người Chơi',
        phone: guestUser.phone || '0914111222',
        avatarUrl: guestUser.avatarUrl || '',
        skillLevel: s.maxSkillLevel,
        joinedAt: new Date(start.getTime() - 43200000),
      });
      joinedCount = 2;
    }

    const isPast = end < now;
    const finalStatus = s.forceStatus || (isPast ? MatchStatus.COMPLETED : MatchStatus.OPEN);

    matchesToInsert.push({
      hostId: hostUser._id.toString(),
      hostName: hostUser.name || 'Chủ Kèo',
      hostAvatar: hostUser.avatarUrl || '',
      hostPhone: hostUser.phone || '',
      sport: s.sport,
      title: s.title,
      venueName: s.venueName,
      venueAddress: s.venueAddress,
      district: s.district,
      city: s.city,
      courtNumber: s.courtNumber,
      startTime: start,
      endTime: end,
      totalSlots: s.totalSlots,
      joinedCount: isPast ? s.totalSlots : joinedCount,
      players,
      minSkillLevel: s.minSkillLevel,
      maxSkillLevel: s.maxSkillLevel,
      estimatedCostText: s.estimatedCostText,
      notes: s.notes,
      shuttleType: s.shuttleType,
      status: finalStatus,
      shareCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Xóa các trận mẫu cũ
  await collection.deleteMany({});
  const result = await collection.insertMany(matchesToInsert);
  console.log(`✓ Đã seed thành công ${result.insertedCount} kèo giao lưu với trạng thái và thời gian mới!`);

  await client.close();
}

seedMatches().catch(console.error);
