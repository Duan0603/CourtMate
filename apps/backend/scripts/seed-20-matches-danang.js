/**
 * Script seed 20 trận đấu giao lưu ảo cho ngày 23/10/2026 và 24/10/2026
 * Khung giờ vàng thể thao: Sáng (5:00am - 7:00am) và Tối (17:30pm - 20:30pm)
 * Thông tin chuẩn thực tế tại các quận Đà Nẵng
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');
const { BadmintonSkillLevel, MatchStatus, SportType } = require('@courtmate/shared');

const MATCHES_DATA = [
  // ══════════════════════════════════════════════════════════════════════
  // NGÀY 23/10/2026 (10 TRẬN)
  // ══════════════════════════════════════════════════════════════════════

  // ── Sáng 23/10/2026 (5:00 - 7:00) ──
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông sáng sớm thể dục - Sân Quân Khu 5',
    venueName: 'Sân Cầu Lông Quân Khu 5',
    venueAddress: '07 Duy Tân, P. Hòa Thuận Đông',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 3',
    dateStr: '2026-10-23',
    startHour: 5,
    startMinute: 0,
    endHour: 6,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~30k/người)',
    notes: 'Đánh rèn luyện sức khỏe đầu ngày, anh em giao lưu vui vẻ không quạu nhé!',
    shuttleType: 'Thành Công số 7',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball đón bình minh bãi biển Mỹ Khê',
    venueName: 'Cụm Sân Pickleball Biển Mỹ Khê',
    venueAddress: 'Võ Nguyên Giáp, P. Phước Mỹ',
    district: 'Sơn Trà',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    dateStr: '2026-10-23',
    startHour: 5,
    startMinute: 30,
    endHour: 7,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 3,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Sân view biển cực thoáng, gió mát lành. Tuyển thêm 1 bạn đánh đôi nam nữ!',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu đôi nam rèn thể lực đầu ngày Kỳ Đồng',
    venueName: 'Sân Cầu Lông Kỳ Đồng',
    venueAddress: '20 Kỳ Đồng, P. Xuân Hà',
    district: 'Thanh Khê',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-23',
    startHour: 5,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    totalSlots: 6,
    joinedCount: 4,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~35k/người)',
    notes: 'Sân sàn thảm mới êm chân, tuyển 2 bạn đánh đôi cọ xát sung sức.',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball giao lưu buổi sáng Hòa Xuân',
    venueName: 'Sân Pickleball Hòa Xuân',
    venueAddress: 'Đường 29 Tháng 3, P. Hòa Xuân',
    district: 'Cẩm Lệ',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-23',
    startHour: 5,
    startMinute: 30,
    endHour: 7,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~35k/người)',
    notes: 'Sân rộng rãi có mái che bớt nắng, bóng nảy chuẩn, có nước uống phục vụ.',
    shuttleType: 'Bóng Dura Fast 40',
  },

  // ── Chiều tối 23/10/2026 (17:30 - 20:30) ──
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông cọ xát đôi nam nữ - Cung Tiên Sơn',
    venueName: 'Cung Thể Thao Tiên Sơn',
    venueAddress: '01 Phan Đăng Lưu, P. Hòa Cường Bắc',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 4',
    dateStr: '2026-10-23',
    startHour: 17,
    startMinute: 30,
    endHour: 19,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 3,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Sân thi đấu tiêu chuẩn quốc gia, ánh sáng cực tốt. Thiếu 1 bạn là đủ kèo!',
    shuttleType: 'Thành Công số 7',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo nâng cao tốc độ cao sân ĐH TDTT',
    venueName: 'Sân Cầu Lông Trường ĐH Thể Dục Thể Thao',
    venueAddress: '44 Dũng Sĩ Thanh Khê',
    district: 'Thanh Khê',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    dateStr: '2026-10-23',
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.KHA,
    maxSkillLevel: BadmintonSkillLevel.KHA_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Kèo cọ xát trình độ Khá, đập cầu nhanh và bền, anh em có kinh nghiệm giải vào nhé.',
    shuttleType: 'Victor Master 3',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball D-Sport Sơn Trà - Đấu đôi giao lưu tối',
    venueName: 'Sân Pickleball D-Sport Sơn Trà',
    venueAddress: 'Đường Phạm Văn Đồng, P. An Hải Bắc',
    district: 'Sơn Trà',
    city: 'Da Nang',
    courtNumber: 'Sân 3',
    dateStr: '2026-10-23',
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 1,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Cần tuyển 3 bạn lập team đôi nam/nữ, đánh vui vẻ, có hỗ trợ chỉnh form dink.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Tuyển bạn đánh cầu lông tối thứ 6 Lê Văn Hiến',
    venueName: 'Sân Cầu Lông Ngũ Hành',
    venueAddress: 'K234 Lê Văn Hiến, P. Khuê Mỹ',
    district: 'Ngũ Hành Sơn',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-23',
    startHour: 18,
    startMinute: 30,
    endHour: 20,
    endMinute: 30,
    totalSlots: 6,
    joinedCount: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Tối thứ 6 xả stress cuối tuần, đánh xoay vòng đôi, anh em gần Ngũ Hành Sơn ghé chơi.',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Tiên Sơn - Cọ xát tính điểm DUPR',
    venueName: 'Cụm Sân Pickleball Tiên Sơn',
    venueAddress: 'Phan Đăng Lưu, P. Hòa Cường Bắc',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-23',
    startHour: 17,
    startMinute: 30,
    endHour: 19,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 4,
    status: MatchStatus.FULL,
    minSkillLevel: BadmintonSkillLevel.TB_PLUS,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~55k/người)',
    notes: 'Kèo đã đủ 4 tay vợt cứng cọ xát ghi điểm bảng xếp hạng DUPR Đà Nẵng.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông vui khỏe giải tỏa stress cuối tuần Hòa Khánh',
    venueName: 'CLB Cầu Lông Hòa Khánh',
    venueAddress: 'Đường Số 4, KCN Hòa Khánh',
    district: 'Liên Chiểu',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-23',
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~30k/người)',
    notes: 'Kèo nhẹ nhàng giao lưu người mới, có phục vụ trà chanh mát lạnh.',
    shuttleType: 'Cầu Ba Sao',
  },

  // ══════════════════════════════════════════════════════════════════════
  // NGÀY 24/10/2026 (10 TRẬN)
  // ══════════════════════════════════════════════════════════════════════

  // ── Sáng 24/10/2026 (5:00 - 7:00) ──
  {
    sport: SportType.BADMINTON,
    title: 'Kèo sáng thứ 7 rèn thể lực sân Chi Lăng',
    venueName: 'Sân Cầu Lông Chi Lăng',
    venueAddress: '38 Chi Lăng, P. Hải Châu 2',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    dateStr: '2026-10-24',
    startHour: 5,
    startMinute: 0,
    endHour: 6,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~35k/người)',
    notes: 'Khởi đầu ngày thứ 7 tràn đầy năng lượng, sân trung tâm thành phố đi lại tiện lợi.',
    shuttleType: 'Thành Công số 7',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball sáng thứ Bảy sân thể thao FPT City',
    venueName: 'Sân Thể Thao FPT City',
    venueAddress: 'Khu Đô Thị FPT City, P. Hòa Hải',
    district: 'Ngũ Hành Sơn',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    dateStr: '2026-10-24',
    startHour: 5,
    startMinute: 30,
    endHour: 7,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 3,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Sân khuôn viên FPT sạch sẽ thoáng đãng, tuyển 1 bạn nữ hoặc nam mới chơi cùng tập.',
    shuttleType: 'Bóng Dura Fast 40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông sáng cuối tuần CLB Sơn Trà',
    venueName: 'Sân Cầu Lông Sơn Trà Club',
    venueAddress: 'Trần Nhân Tông, P. Thọ Quang',
    district: 'Sơn Trà',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-24',
    startHour: 5,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    totalSlots: 6,
    joinedCount: 3,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~35k/người)',
    notes: 'Đánh đôi 6 người đổi vị trí linh hoạt, không khí vui tươi rộn rã.',
    shuttleType: 'Hải Yến xanh',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Kỳ Đồng sáng sớm - Khởi động ngày mới',
    venueName: 'Sân Pickleball Kỳ Đồng',
    venueAddress: 'Kỳ Đồng, P. Xuân Hà',
    district: 'Thanh Khê',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-24',
    startHour: 5,
    startMinute: 30,
    endHour: 7,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Tập bài bản từ cơ bản đến đối kháng, có sẵn bóng Franklin chuẩn thi đấu.',
    shuttleType: 'Bóng Franklin X-40',
  },

  // ── Chiều tối 24/10/2026 (17:30 - 20:30) ──
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu đôi nam nữ cuối tuần Bưu Điện Đà Nẵng',
    venueName: 'Sân Cầu Lông Bưu Điện',
    venueAddress: 'Nguyễn Du, P. Thạch Thang',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-24',
    startHour: 17,
    startMinute: 30,
    endHour: 19,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 3,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Sân sàn gỗ truyền thống nảy đều, tìm 1 bạn trình TB-Khá cọ xát tối thứ 7.',
    shuttleType: 'Thành Công số 7',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball đôi nam nữ bãi biển Mỹ Khê tối T7',
    venueName: 'Cụm Sân Pickleball Biển Mỹ Khê',
    venueAddress: 'Võ Nguyên Giáp, P. Phước Mỹ',
    district: 'Sơn Trà',
    city: 'Da Nang',
    courtNumber: 'Sân 2',
    dateStr: '2026-10-24',
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Kèo tối thứ 7 gió biển mát rượi, đánh xong cả nhóm ghé ăn hải sản vỉa hè giao lưu!',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo đôi nam cọ xát sân Trịnh Hoài Đức',
    venueName: 'Sân Cầu Lông Trịnh Hoài Đức',
    venueAddress: 'Khuê Trung, Q. Cẩm Lệ',
    district: 'Cẩm Lệ',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    dateStr: '2026-10-24',
    startHour: 18,
    startMinute: 30,
    endHour: 20,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 1,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Mới đặt sân xong, cần tìm 3 bạn tham gia lập trận đôi nam căng thẳng hấp dẫn.',
    shuttleType: 'Thành Công số 7',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Liên Chiểu Sports - Giao lưu cọ xát cuối tuần',
    venueName: 'Sân Pickleball Liên Chiểu Sports',
    venueAddress: 'Đường Nguyễn Lương Bằng, P. Hòa Khánh Bắc',
    district: 'Liên Chiểu',
    city: 'Da Nang',
    courtNumber: 'Sân 1',
    dateStr: '2026-10-24',
    startHour: 17,
    startMinute: 30,
    endHour: 19,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~35k/người)',
    notes: 'Sân chuẩn mặt sơn mới làm, không trơn trượt, bảo đảm trải nghiệm đánh đã tay.',
    shuttleType: 'Bóng Dura Fast 40',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông đôi nam nữ thư giãn tối thứ 7 Kỳ Đồng',
    venueName: 'Sân Cầu Lông Kỳ Đồng',
    venueAddress: '20 Kỳ Đồng, P. Xuân Hà',
    district: 'Thanh Khê',
    city: 'Da Nang',
    courtNumber: 'Sân 3',
    dateStr: '2026-10-24',
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    totalSlots: 4,
    joinedCount: 4,
    status: MatchStatus.FULL,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Kèo đã đủ 4 bạn quen và mới đăng ký, chuẩn bị giao lưu 3 hiệp 21 điểm.',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo đêm Tiên Sơn - Cầu lông nâng cao cọ xát',
    venueName: 'Cung Thể Thao Tiên Sơn',
    venueAddress: '01 Phan Đăng Lưu, P. Hòa Cường Bắc',
    district: 'Hải Châu',
    city: 'Da Nang',
    courtNumber: 'Sân 5',
    dateStr: '2026-10-24',
    startHour: 18,
    startMinute: 30,
    endHour: 20,
    endMinute: 30,
    totalSlots: 4,
    joinedCount: 2,
    minSkillLevel: BadmintonSkillLevel.TB_PLUS,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Tuyển 2 bạn tay vợt linh hoạt, phản xạ nhanh để đánh đôi đối kháng tốc độ cao.',
    shuttleType: 'Victor Master 3',
  },
];

const VIETNAMESE_NAMES = [
  'Nguyễn Văn Tuấn', 'Trần Đình Hoàng', 'Lê Thị Thu Thảo', 'Phạm Quốc Bảo',
  'Võ Minh Trí', 'Đặng Hải Đăng', 'Bùi Thanh Tùng', 'Hồ Ngọc Mai',
  'Huỳnh Phước Thắng', 'Phan Thanh Nhã', 'Ngô Quang Huy', 'Dương Gia Hân'
];

async function seed20Matches() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Thiếu MONGODB_URI trong .env');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('courtmate');
  const collection = db.collection('matches');

  // Lấy các user có sẵn từ DB làm Host & Players
  const users = await db.collection('users').find({}).limit(20).toArray();

  const matchesToInsert = [];

  for (let i = 0; i < MATCHES_DATA.length; i++) {
    const m = MATCHES_DATA[i];
    const hostUser = users[i % users.length] || {
      _id: `host_${i}`,
      name: VIETNAMESE_NAMES[i % VIETNAMESE_NAMES.length],
      phone: `0905${Math.floor(100000 + Math.random() * 900000)}`,
      avatarUrl: '',
    };

    const hostName = hostUser.name || VIETNAMESE_NAMES[i % VIETNAMESE_NAMES.length];
    const hostPhone = hostUser.phone || `0905${Math.floor(100000 + Math.random() * 900000)}`;

    // Tạo thời gian bắt đầu và kết thúc chuẩn theo múi giờ Việt Nam (UTC+7)
    const pad = (n) => (n < 10 ? '0' + n : n);
    const startIso = `${m.dateStr}T${pad(m.startHour)}:${pad(m.startMinute)}:00+07:00`;
    const endIso = `${m.dateStr}T${pad(m.endHour)}:${pad(m.endMinute)}:00+07:00`;

    const startDate = new Date(startIso);
    const endDate = new Date(endIso);

    const shareCode = `CM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Tạo danh sách người chơi thực tế
    const players = [
      {
        userId: hostUser._id ? hostUser._id.toString() : `user_host_${i}`,
        name: hostName,
        phone: hostPhone,
        avatarUrl: hostUser.avatarUrl || '',
        skillLevel: m.minSkillLevel,
        joinedAt: new Date(startDate.getTime() - 12 * 3600 * 1000),
      },
    ];

    // Thêm các người chơi khác theo joinedCount
    for (let p = 1; p < m.joinedCount; p++) {
      const guestUser = users[(i + p) % users.length];
      const guestName = guestUser?.name || VIETNAMESE_NAMES[(i + p) % VIETNAMESE_NAMES.length];
      const guestPhone = guestUser?.phone || `0914${Math.floor(100000 + Math.random() * 900000)}`;
      players.push({
        userId: guestUser?._id ? guestUser._id.toString() : `user_guest_${i}_${p}`,
        name: guestName,
        phone: guestPhone,
        avatarUrl: guestUser?.avatarUrl || '',
        skillLevel: p % 2 === 0 ? m.maxSkillLevel : m.minSkillLevel,
        joinedAt: new Date(startDate.getTime() - (12 - p * 2) * 3600 * 1000),
      });
    }

    const matchDoc = {
      hostId: hostUser._id ? hostUser._id.toString() : `host_${i}`,
      hostName,
      hostAvatar: hostUser.avatarUrl || '',
      hostPhone,
      sport: m.sport,
      title: m.title,
      venueName: m.venueName,
      venueAddress: m.venueAddress,
      district: m.district,
      city: m.city,
      courtNumber: m.courtNumber,
      startTime: startDate,
      endTime: endDate,
      totalSlots: m.totalSlots,
      joinedCount: m.joinedCount,
      players,
      minSkillLevel: m.minSkillLevel,
      maxSkillLevel: m.maxSkillLevel,
      estimatedCostText: m.estimatedCostText,
      notes: m.notes,
      shuttleType: m.shuttleType,
      status: m.status || MatchStatus.OPEN,
      shareCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    matchesToInsert.push(matchDoc);
  }

  const result = await collection.insertMany(matchesToInsert);
  console.log(`\n ĐÃ TẠO THÀNH CÔNG ${result.insertedCount} TRẬN ĐẤU GIAO LƯU CHO NGÀY 23 & 24/10/2026:`);
  matchesToInsert.forEach((m, idx) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    const startStr = `${pad(m.startTime.getHours())}:${pad(m.startTime.getMinutes())}`;
    const endStr = `${pad(m.endTime.getHours())}:${pad(m.endTime.getMinutes())}`;
    const dateStr = `${m.startTime.getDate()}/${m.startTime.getMonth() + 1}/${m.startTime.getFullYear()}`;
    console.log(
      `  [${idx + 1}] ${m.sport} | ${dateStr} ${startStr}-${endStr} | Q. ${m.district} - ${m.venueName} | "${m.title}" (${m.joinedCount}/${m.totalSlots} slots, ${m.status})`
    );
  });

  await client.close();
}

seed20Matches().catch(err => {
  console.error('Lỗi khi seed 20 trận đấu:', err);
  process.exit(1);
});
