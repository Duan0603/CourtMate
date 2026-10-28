/**
 * Seed thêm người dùng & các kèo giao lưu Cầu lông / Pickleball dựa trên toàn bộ 50 cụm sân thực tế tại Đà Nẵng.
 * Quy chuẩn: Mỗi bài đăng giao lưu đều có số lượng tối đa là 8 người (totalSlots = 8).
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient, ObjectId } = require('mongodb');
const { BadmintonSkillLevel, MatchStatus, SportType } = require('@courtmate/shared');

const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Mai', 'Đinh'];
const MIDDLE_NAMES_MALE = ['Văn', 'Hữu', 'Đức', 'Quốc', 'Minh', 'Thành', 'Tuấn', 'Công', 'Gia', 'Trọng', 'Anh', 'Đình', 'Phước', 'Nhật'];
const MIDDLE_NAMES_FEMALE = ['Thị', 'Ngọc', 'Thảo', 'Phương', 'Mai', 'Thanh', 'Khánh', 'Như', 'Hồng', 'Tuyết', 'Bảo', 'Thu'];
const FIRST_NAMES_MALE = ['Huy', 'Nam', 'Hoàng', 'Duy', 'Bảo', 'Khoa', 'Tùng', 'Việt', 'Sơn', 'Dũng', 'Long', 'Kiên', 'Hải', 'Quân', 'Thịnh', 'Trí', 'Đạt', 'Phúc', 'Đông', 'Duẫn', 'Khánh', 'Hùng', 'Phú'];
const FIRST_NAMES_FEMALE = ['Linh', 'Trang', 'Hương', 'Vy', 'Trâm', 'Ngọc', 'Nhi', 'Hà', 'My', 'Chi', 'Phương', 'Lan', 'Quỳnh', 'Châu', 'Tú', 'Yến', 'Thảo', 'Ngân', 'Trinh'];

const DISTRICTS = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Cẩm Lệ', 'Liên Chiểu'];
const CLUBS = [
  'CLB Cầu lông Laughing Sơn Trà',
  'CLB Cầu lông FUB - FPTU Đà Nẵng',
  'CLB Cầu lông Kỳ Đồng',
  'CLB Cầu lông Quân Khu 5',
  'CLB Pickleball Tiên Sơn',
  'CLB Pickleball Mỹ Khê',
  'CLB Cầu lông Hòa Khánh',
  'CLB Cầu lông IndexSport',
  'CLB Pickleball Hòa Xuân',
  'CLB Cầu lông ARMY Đà Nẵng',
];

const SKILL_LEVELS_ORDER = [
  BadmintonSkillLevel.YEU,
  BadmintonSkillLevel.TBY,
  BadmintonSkillLevel.TB,
  BadmintonSkillLevel.TB_PLUS,
  BadmintonSkillLevel.KHA,
  BadmintonSkillLevel.KHA_PLUS,
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  const prefixes = ['0905', '0914', '0935', '0979', '0983', '0903', '0913', '0932', '0968', '0702', '0898'];
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

function generateNewUsers(count = 80, existingEmails = new Set()) {
  const newUsers = [];
  let attempts = 0;

  while (newUsers.length < count && attempts < count * 5) {
    attempts++;
    const isMale = Math.random() > 0.35;
    const lastName = getRandomItem(LAST_NAMES);
    const middleName = isMale ? getRandomItem(MIDDLE_NAMES_MALE) : getRandomItem(MIDDLE_NAMES_FEMALE);
    const firstName = isMale ? getRandomItem(FIRST_NAMES_MALE) : getRandomItem(FIRST_NAMES_FEMALE);
    const fullName = `${lastName} ${middleName} ${firstName}`;

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const email = `${removeAccents(firstName)}.${removeAccents(lastName)}.dn${randNum}@courtmate.vn`;

    if (existingEmails.has(email)) continue;
    existingEmails.add(email);

    const sports = Math.random() > 0.45
      ? [SportType.BADMINTON]
      : Math.random() > 0.5
        ? [SportType.PICKLEBALL]
        : [SportType.BADMINTON, SportType.PICKLEBALL];

    newUsers.push({
      _id: new ObjectId(),
      email,
      name: fullName,
      role: 'USER',
      phone: getRandomPhone(),
      preferences: {
        profileType: 'PLAYER',
        sports,
        location: 'Da Nang',
        district: getRandomItem(DISTRICTS),
        skillLevel: getRandomItem(['Beginner', 'Intermediate', 'Advanced']),
        clubName: getRandomItem(CLUBS),
      },
      isVerified: Math.random() > 0.4,
      bookmarkedTournaments: [],
      bookmarkedCoaches: [],
      friends: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return newUsers;
}

const SAMPLE_MATCHES = [
  // ─── CẦU LÔNG (BADMINTON) - ĐANG MỞ & ĐỦ NGƯỜI ───────────────────────────
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông đôi nam nữ vui vẻ tối nay - Sân Kỳ Đồng',
    venueName: 'Sân cầu lông Kỳ Đồng',
    venueAddress: '20 Kỳ Đồng, P. Xuân Hà, Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    courtNumber: 'Sân 2 & Sân 3',
    offsetDays: 1,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân & cầu tại chỗ (~45k/người)',
    notes: 'Đánh cầu Hải Yến xanh nhẹ nhàng dưỡng sinh, xoay tua cặp đấu, anh em mới chơi vào giao lưu nhé!',
    shuttleType: 'Hải Yến xanh',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Tuyển tay vợt cứng cọ xát đôi nam tại INDEXSPORT 2',
    venueName: 'SÂN CẦU LÔNG INDEXSPORT 2',
    venueAddress: '81C Đ. Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    courtNumber: 'Sân 4',
    offsetDays: 1,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 6,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~50k/người)',
    notes: 'Sân thảm xanh lá tiêu chuẩn, đèn sáng. Đánh cầu Thành Công 77, kèo bao sung!',
    shuttleType: 'Thành Công 77',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo cầu lông Cung Thể Thao Tiên Sơn rèn thể lực',
    venueName: 'Cung Thể Thao Tiên Sơn',
    venueAddress: 'Phan Đăng Lưu, Hòa Cường, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân 5 & Sân 6',
    offsetDays: 2,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 4,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~50k/người)',
    notes: 'Sân sàn thảm tiêu chuẩn thi đấu, trần cao thoáng mát, xoay tua 8 người đánh đôi.',
    shuttleType: 'Thành Công 77',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo nâng cao Khá+ cọ xát chuẩn bị đánh giải tại Sân Bưu Điện',
    venueName: 'Sân Bưu Điện',
    venueAddress: '50B Nguyễn Du, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân 1',
    offsetDays: 2,
    startHour: 19,
    durationHours: 2.5,
    totalSlots: 8,
    targetJoined: 7,
    minSkillLevel: BadmintonSkillLevel.KHA,
    maxSkillLevel: BadmintonSkillLevel.KHA_PLUS,
    estimatedCostText: 'Chia đều tiền sân & cầu (~65k/người)',
    notes: 'Đánh tốc độ cao, chiến thuật bài bản, tuyển bạn có kinh nghiệm đánh giải phong trào Đà Nẵng.',
    shuttleType: 'Victor Master Ace',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông Hòa Xuân - Sân Hiếu Con tối thứ 6',
    venueName: 'Sân cầu lông Hiếu Con',
    venueAddress: '172-182 Đỗ Quỳ, Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    courtNumber: 'Sân 2',
    offsetDays: 2,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tại sân (~40k/người)',
    notes: 'Nhóm thân thiện vui vẻ, có nước đá miễn phí tại sân.',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông CBC Hòa Khánh - Đôi nam nữ thư giãn sau giờ làm',
    venueName: 'Sân Cầu Lông CBC Badminton ',
    venueAddress: '642 Tôn Đức Thắng, Hòa Khánh, Liên Chiểu, Đà Nẵng',
    district: 'Liên Chiểu',
    courtNumber: 'Sân 3',
    offsetDays: 1,
    startHour: 17,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 3,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~35k/người)',
    notes: 'Phù hợp sinh viên Bách Khoa, Sư Phạm và anh chị em văn phòng khu vực Hòa Khánh.',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu Wings Badminton Sơn Trà - Tuyển thêm đồng đội',
    venueName: 'CLB Cầu Lông Wings Badminton',
    venueAddress: '132 Tô Hiến Thành, An Hải, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    courtNumber: 'Sân 1 & Sân 2',
    offsetDays: 3,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 6,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Sân mới đẹp, thảm xịn, tuyển thêm 2 bạn nam/nữ đánh chắc tay.',
    shuttleType: 'Thành Công 77',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo Quân Khu 5 - Đánh đôi cọ xát thể lực buổi tối',
    venueName: 'SÂN CẦU LÔNG QUÂN KHU 5, HẢI CHÂU, ĐÀ NẴNG',
    venueAddress: '07 Duy Tân, Hòa Cường, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân 4',
    offsetDays: 3,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 8,
    minSkillLevel: BadmintonSkillLevel.TB_PLUS,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Đội hình 8 người chia 4 cặp đánh vòng tròn giao lưu.',
    shuttleType: 'Thành Công 77',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông sáng cuối tuần tại ICON BADMINTON Tôn Đản',
    venueName: 'ICON BADMINTON',
    venueAddress: '122 Tôn Đản, An Khê, Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    courtNumber: 'Sân 5',
    offsetDays: 3,
    startHour: 8,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 4,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Sân thảm xám chuẩn thi đấu, có căn-tin phục vụ cà phê sáng.',
    shuttleType: 'Hải Yến xanh',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông ARMY Badminton 1 - Kèo đôi nam cân sức',
    venueName: 'ARMY Badminton 1',
    venueAddress: '1 Đ. Phạm Ngọc Mậu, An Khê, Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    courtNumber: 'Sân 2',
    offsetDays: 4,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tại sân (~45k/người)',
    notes: 'Sân thoáng, trần cao, ưu tiên các bạn đánh nhiệt tình vui vẻ.',
    shuttleType: 'VinaStar',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông ForFun Hoàng Văn Thái - Mở cửa đón người mới',
    venueName: 'ForFun Badminton',
    venueAddress: '102 Hoàng Văn Thái, Hòa Khánh, Liên Chiểu, Đà Nẵng',
    district: 'Liên Chiểu',
    courtNumber: 'Sân 1',
    offsetDays: 4,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 6,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~35k/người)',
    notes: 'Có người hướng dẫn cách di chuyển bước chân và cầm vợt cho bạn mới.',
    shuttleType: 'Hải Yến xanh',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu Aurora Sport Sơn Trà - Đôi nam nữ phong trào',
    venueName: 'Sân cầu lông Aurora Sport',
    venueAddress: 'Đường Số 6, Khu công nghiệp An Hải, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    courtNumber: 'Sân 3',
    offsetDays: 4,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Sân rộng, chỗ để ô tô xe máy thoải mái, đánh cầu Ba Sao.',
    shuttleType: 'Cầu Ba Sao',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo cầu lông Win Win 146 Duy Tân - Giao lưu công sở',
    venueName: 'Sân Cầu Lông Win Win 146 Duy Tân',
    venueAddress: '146 Duy Tân, Hòa Cường, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân 2',
    offsetDays: 5,
    startHour: 17,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Kèo tan ca 17h30-19h30 ngay trung tâm Hải Châu, rất tiện di chuyển.',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Đấu tập đôi nam nữ tại Sân Cầu Lông Dacinco Nguyễn Hữu Thọ',
    venueName: 'Sân Cầu Lông Dacinco',
    venueAddress: '456 Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    courtNumber: 'Sân 1',
    offsetDays: 5,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 7,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Còn thiếu đúng 1 tay vợt nữa là đủ mâm 8 người (4 cặp xoay tua).',
    shuttleType: 'Thành Công 77',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu Sân Cầu Lông Ngũ Hành - Đánh vui khỏe mỗi tuần',
    venueName: 'Sân cầu lông Ngũ Hành',
    venueAddress: 'Cuối Đường Phạm Hữu Nhật, Ngũ Hành Sơn, Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    courtNumber: 'Sân 2',
    offsetDays: 5,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 3,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Anh em khu vực Ngũ Hành Sơn, Bắc Mỹ An vào ghép kèo giao lưu nhé!',
    shuttleType: 'Hải Yến xanh',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo cầu lông T&T Badminton Hòa Xuân - Cọ xát TB đến Khá',
    venueName: 'T&T Badminton',
    venueAddress: '534 Phạm Hùng, Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    courtNumber: 'Sân 3',
    offsetDays: 6,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 6,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Sân mới, thảm êm, ánh sáng chuẩn không chói mắt.',
    shuttleType: 'Thành Công 77',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông ĐH Thể Dục Thể Thao - Tốc độ & Kỹ thuật',
    venueName: 'Sân Trường Đại học Thể dục Thể thao ',
    venueAddress: '44 Dũng Sĩ Thanh Khê, Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    courtNumber: 'Sân 4',
    offsetDays: 6,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 8,
    minSkillLevel: BadmintonSkillLevel.TB_PLUS,
    maxSkillLevel: BadmintonSkillLevel.KHA_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~55k/người)',
    notes: 'Kèo chất lượng cao giao lưu cùng các bạn sinh viên TDTT Đà Nẵng.',
    shuttleType: 'Victor Master',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Cầu lông cuối tuần Sân Đa Phước - Giao lưu kết bạn',
    venueName: 'Sân Cầu Lông Đa Phước - Da Phuoc Badminton Court',
    venueAddress: 'Đường Ông Ích Khiêm, Khu đô thị Đa Phước, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân 2',
    offsetDays: 7,
    startHour: 16,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Không khí gió biển mát mẻ, đánh xong giao lưu nước mía.',
    shuttleType: 'Hải Yến đỏ',
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu ACE BADMINTON Hòa Khánh - Kèo tối Chủ Nhật',
    venueName: 'ACE BADMINTON',
    venueAddress: '2a Hòa Nam 6, Hòa Khánh, Liên Chiểu, Đà Nẵng',
    district: 'Liên Chiểu',
    courtNumber: 'Sân 1',
    offsetDays: 7,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Sân thảm xanh dương chuẩn thi đấu, tuyển thêm 4 bạn vào chia cặp.',
    shuttleType: 'Hải Yến đỏ',
  },

  // ─── PICKLEBALL - ĐANG MỞ & ĐỦ NGƯỜI ────────────────────────────────────
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Sơn Trà - Đôi nam nữ cọ xát tại AN ĐỒN 5.5',
    venueName: 'Sân pickleball, cầu lông AN ĐỒN 5.5',
    venueAddress: 'Đường số 5, An Hải, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    courtNumber: 'Sân Pickleball 1 & 2',
    offsetDays: 1,
    startHour: 17,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Bóng Franklin X-40 chuẩn quốc tế, xoay tua 8 người đánh đôi giao lưu.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball INDEXSPORT 3 Hòa Cường - Giao lưu DUPR 2.5 - 3.5',
    venueName: 'SÂN CẦU LÔNG & PICKLEBALL INDEXSPORT 3',
    venueAddress: '12 Trịnh Công Sơn, Hòa Cường, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân P1',
    offsetDays: 1,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 6,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~55k/người)',
    notes: 'Sân có mái che mát mẻ, mặt sân Acrylic tiêu chuẩn Mỹ, tuyển thêm 2 bạn.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Rookie Hòa Xuân - Dành cho người mới bắt đầu',
    venueName: 'Cụm Sân Pickleball Hòa Xuân',
    venueAddress: 'Đường 29 Tháng 3, P. Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    courtNumber: 'Sân 3',
    offsetDays: 2,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 4,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TBY,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Có sẵn vợt carbon và bóng mượn miễn phí cho các bạn mới tập chơi Pickleball!',
    shuttleType: 'Bóng Dura Fast 40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Cung Tiên Sơn - Đấu đôi giao lưu chuẩn bị giải DPF',
    venueName: 'Cung Thể Thao Tiên Sơn',
    venueAddress: 'Phan Đăng Lưu, Hòa Cường, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Cụm sân Pickleball Tiên Sơn',
    offsetDays: 2,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 7,
    minSkillLevel: BadmintonSkillLevel.TB_PLUS,
    maxSkillLevel: BadmintonSkillLevel.KHA_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~60k/người)',
    notes: 'Cọ xát nâng trình chuẩn bị cho giải Pickleball TP. Đà Nẵng, còn 1 slot cuối!',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Biển Mỹ Khê - Giao lưu đón gió biển chiều cuối tuần',
    venueName: 'Cụm Sân Pickleball Biển Mỹ Khê',
    venueAddress: 'Võ Nguyên Giáp, P. Phước Mỹ, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    courtNumber: 'Sân 2',
    offsetDays: 3,
    startHour: 16,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'View biển cực đẹp, đánh giao lưu vui vẻ 8 người xoay vòng.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball FPT City Ngũ Hành Sơn - Kèo tối rèn phản xạ Kitchen',
    venueName: 'Cụm Sân Thể Thao FPT City',
    venueAddress: 'Khu Đô Thị FPT City, Ngũ Hành Sơn, Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    courtNumber: 'Sân P2',
    offsetDays: 3,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 6,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Luyện dink bóng trên lưới (Kitchen) và phản xạ đôi nam nữ.',
    shuttleType: 'Bóng Joola Heleus',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Thanh Khê - Giao lưu đôi nam nữ vui khỏe',
    venueName: 'Sân Pickleball Kỳ Đồng',
    venueAddress: 'Kỳ Đồng, P. Xuân Hà, Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    courtNumber: 'Sân 1',
    offsetDays: 4,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 3,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Kèo thân thiện cho cả nam và nữ, ưu tiên tinh thần giao lưu học hỏi.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Liên Chiểu Sports - Kèo cọ xát tối Thứ 7',
    venueName: 'Sân Pickleball Liên Chiểu Sports',
    venueAddress: 'Hoàng Văn Thái, Hòa Khánh, Liên Chiểu, Đà Nẵng',
    district: 'Liên Chiểu',
    courtNumber: 'Sân 2',
    offsetDays: 4,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 8,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Đã đủ 8 người chia làm 4 cặp thi đấu vòng tròn tính điểm mini.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Hợp Thành Phát Sơn Trà - Kèo sáng Chủ Nhật',
    venueName: 'Cụm sân Pickleball Hợp Thành Phát',
    venueAddress: 'An Hải Bắc, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    courtNumber: 'Sân 3 & Sân 4',
    offsetDays: 5,
    startHour: 7,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 5,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Đánh sáng sớm mát mẻ, xong đi ăn sáng cà phê giao lưu.',
    shuttleType: 'Bóng Franklin X-40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Hòa Cường Hải Châu - Tuyển thêm 4 bạn ghép đôi',
    venueName: 'SÂN CẦU LÔNG & PICKLEBALL INDEXSPORT 3',
    venueAddress: '12 Trịnh Công Sơn, Hòa Cường, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân P3',
    offsetDays: 6,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 4,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.KHA,
    estimatedCostText: 'Chia đều tiền sân (~50k/người)',
    notes: 'Nhóm đã có sẵn 2 cặp nam nữ, tìm thêm 4 bạn vào đánh xoay tua.',
    shuttleType: 'Bóng Dura Fast 40',
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Cẩm Lệ Open Social - Giao lưu cuối tuần',
    venueName: 'Cụm Sân Pickleball Hòa Xuân',
    venueAddress: 'Đường 29 Tháng 3, P. Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    courtNumber: 'Sân 1',
    offsetDays: 7,
    startHour: 17,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 6,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Social game vui nhộn, tính điểm 11 quả đổi sân.',
    shuttleType: 'Bóng Franklin X-40',
  },

  // ─── CÁC TRẬN ĐÃ QUA (TRẠNG THÁI: ĐÃ HOÀN THÀNH, MAX 8 NGƯỜI) ────────────
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông đôi nam nữ Trọng Nghĩa Badminton',
    venueName: 'Sân Cầu Lông Trọng Nghĩa - Trong Nghia Badminton Court',
    venueAddress: '194 Bế Văn Đàn, Thanh Khê, Đà Nẵng',
    district: 'Thanh Khê',
    courtNumber: 'Sân 1 & Sân 2',
    offsetDays: -1,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 8,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Buổi giao lưu 8 thành viên đã diễn ra rất sôi nổi và vui vẻ.',
    shuttleType: 'Hải Yến đỏ',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.BADMINTON,
    title: 'Kèo nâng cao PINPON SPORT Sơn Trà',
    venueName: 'PINPON SPORT Badminton',
    venueAddress: 'Đường Số 6, Khu công nghiệp An Hải, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    courtNumber: 'Sân 3',
    offsetDays: -2,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 8,
    minSkillLevel: BadmintonSkillLevel.KHA,
    maxSkillLevel: BadmintonSkillLevel.KHA_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~55k/người)',
    notes: 'Đã hoàn thành thi đấu giao lưu 8 người với nhiều pha cầu mãn nhãn.',
    shuttleType: 'Victor Master',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.BADMINTON,
    title: 'Giao lưu cầu lông Dương Gia Hòa Xuân',
    venueName: 'SÂN CẦU LÔNG DƯƠNG GIA HX',
    venueAddress: '207 Quách Thị Trang, Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    courtNumber: 'Sân 2',
    offsetDays: -3,
    startHour: 18,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 7,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Trận đấu giao lưu đã kết thúc tốt đẹp.',
    shuttleType: 'Thành Công 77',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball cọ xát đôi nam nữ tại AN ĐỒN 5.5',
    venueName: 'Sân pickleball, cầu lông AN ĐỒN 5.5',
    venueAddress: 'Đường số 5, An Hải, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    courtNumber: 'Sân P1',
    offsetDays: -1,
    startHour: 17,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 8,
    minSkillLevel: BadmintonSkillLevel.TB,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Trận đấu đã hoàn thành với 8 VĐV tham gia đầy đủ.',
    shuttleType: 'Bóng Franklin X-40',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Giao lưu Pickleball INDEXSPORT 3 Hòa Cường sáng sớm',
    venueName: 'SÂN CẦU LÔNG & PICKLEBALL INDEXSPORT 3',
    venueAddress: '12 Trịnh Công Sơn, Hòa Cường, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    courtNumber: 'Sân P2',
    offsetDays: -2,
    startHour: 6,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 8,
    minSkillLevel: BadmintonSkillLevel.YEU,
    maxSkillLevel: BadmintonSkillLevel.TB,
    estimatedCostText: 'Chia đều tiền sân (~40k/người)',
    notes: 'Trận đấu giao lưu buổi sáng đã kết thúc.',
    shuttleType: 'Bóng Franklin X-40',
    forceStatus: MatchStatus.COMPLETED,
  },
  {
    sport: SportType.PICKLEBALL,
    title: 'Pickleball Hòa Xuân Social Night',
    venueName: 'Cụm Sân Pickleball Hòa Xuân',
    venueAddress: 'Đường 29 Tháng 3, P. Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    district: 'Cẩm Lệ',
    courtNumber: 'Sân 2',
    offsetDays: -3,
    startHour: 19,
    durationHours: 2,
    totalSlots: 8,
    targetJoined: 7,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân (~45k/người)',
    notes: 'Buổi giao lưu Pickleball 7/8 thành viên đã hoàn thành.',
    shuttleType: 'Bóng Dura Fast 40',
    forceStatus: MatchStatus.COMPLETED,
  },
];

function getSkillBetween(minSkill, maxSkill, idx) {
  const minIdx = Math.max(0, SKILL_LEVELS_ORDER.indexOf(minSkill));
  const maxIdx = Math.max(minIdx, SKILL_LEVELS_ORDER.indexOf(maxSkill));
  const chosenIdx = minIdx + (idx % (maxIdx - minIdx + 1));
  return SKILL_LEVELS_ORDER[chosenIdx] || minSkill;
}

async function seedUsersAndMatches() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Thiếu MONGODB_URI trong apps/backend/.env');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('courtmate');
  const usersCollection = db.collection('users');
  const venuesCollection = db.collection('venues');
  const matchesCollection = db.collection('matches');

  // 1. Lấy danh sách venues thực tế trong DB và bổ sung toàn bộ các sân chưa có trong SAMPLE_MATCHES
  const venues = await venuesCollection.find({}).toArray();
  const venueMap = new Map();
  for (const v of venues) {
    venueMap.set(v.name.trim().toLowerCase(), v);
  }

  const usedVenueNames = new Set(SAMPLE_MATCHES.map((m) => m.venueName.trim().toLowerCase()));
  const allMatchTemplates = [...SAMPLE_MATCHES];

  venues.forEach((v, idx) => {
    const key = v.name.trim().toLowerCase();
    if (!usedVenueNames.has(key)) {
      usedVenueNames.add(key);
      const isPickleball = Array.isArray(v.sports) && v.sports.includes('PICKLEBALL') && idx % 2 === 0;
      const sport = isPickleball ? SportType.PICKLEBALL : SportType.BADMINTON;
      const skillPairs = [
        [BadmintonSkillLevel.YEU, BadmintonSkillLevel.TB],
        [BadmintonSkillLevel.TBY, BadmintonSkillLevel.TB_PLUS],
        [BadmintonSkillLevel.TB, BadmintonSkillLevel.KHA],
        [BadmintonSkillLevel.TB_PLUS, BadmintonSkillLevel.KHA_PLUS],
      ];
      const [minSkill, maxSkill] = skillPairs[idx % skillPairs.length];
      const joinedOptions = [3, 4, 5, 6, 7, 8];

      allMatchTemplates.push({
        sport,
        title: `Giao lưu ${sport === SportType.BADMINTON ? 'cầu lông' : 'Pickleball'} đôi nam nữ tại ${v.name.trim()}`,
        venueId: v._id.toString(),
        venueName: v.name.trim(),
        venueAddress: v.address,
        district: v.district || 'Hải Châu',
        courtNumber: `Sân ${(idx % Math.max(1, v.totalCourts || 4)) + 1}`,
        offsetDays: (idx % 8) + 1,
        startHour: [17, 18, 19, 20][idx % 4],
        durationHours: 2,
        totalSlots: 8,
        targetJoined: joinedOptions[idx % joinedOptions.length],
        minSkillLevel: minSkill,
        maxSkillLevel: maxSkill,
        estimatedCostText: 'Chia đều tiền sân & cầu tại chỗ (~40k - 50k/người)',
        notes: `${v.quality || 'Sân tiêu chuẩn, đèn sáng'}. Mời anh chị em khu vực Q. ${v.district} vào giao lưu đủ mâm 8 người!`,
        shuttleType: sport === SportType.BADMINTON ? 'Thành Công 77 / Hải Yến' : 'Bóng Franklin X-40',
      });
    }
  });

  // 2. Đảm bảo số lượng người dùng đủ lớn cho tất cả các trận giao lưu
  const existingUsers = await usersCollection.find({}).toArray();
  const existingEmails = new Set(existingUsers.map((u) => u.email));
  const targetUserCount = allMatchTemplates.length * 8 + 50;

  if (existingUsers.length < targetUserCount) {
    const needed = targetUserCount - existingUsers.length;
    const newUsersToInsert = generateNewUsers(needed, existingEmails);
    if (newUsersToInsert.length > 0) {
      await usersCollection.insertMany(newUsersToInsert);
      console.log(`✓ Đã thêm mới ${newUsersToInsert.length} người dùng (Players) tại Đà Nẵng!`);
    }
  }

  const allUsers = await usersCollection
    .find({ name: { $exists: true, $ne: '' } })
    .toArray();
  console.log(`Tổng số người dùng khả dụng trong DB: ${allUsers.length}`);

  // 3. Tạo danh sách các bài đăng giao lưu (mỗi bài đăng bắt buộc totalSlots = 8)
  const matchesToInsert = [];
  const now = new Date();
  let userCursor = 0;

  for (let i = 0; i < allMatchTemplates.length; i++) {
    const s = allMatchTemplates[i];
    const totalSlots = 8; // Quy định bắt buộc: mỗi bài đăng max 8 người
    const joinedCount = Math.min(totalSlots, Math.max(2, s.targetJoined || 5));

    const start = new Date(now);
    start.setDate(start.getDate() + s.offsetDays);
    start.setHours(s.startHour, 0, 0, 0);

    const end = new Date(start);
    const wholeHours = Math.floor(s.durationHours);
    const extraMinutes = Math.round((s.durationHours - wholeHours) * 60);
    end.setHours(start.getHours() + wholeHours, extraMinutes, 0, 0);

    const players = [];
    for (let pIdx = 0; pIdx < joinedCount; pIdx++) {
      const u = allUsers[(userCursor + pIdx) % allUsers.length];
      players.push({
        userId: u._id.toString(),
        name: u.name || 'Người chơi CourtMate',
        phone: u.phone || getRandomPhone(),
        avatarUrl: u.avatarUrl || '',
        skillLevel: getSkillBetween(s.minSkillLevel, s.maxSkillLevel, pIdx),
        joinedAt: new Date(start.getTime() - (joinedCount - pIdx) * 3600 * 1000 * 3),
      });
    }
    userCursor += joinedCount;

    const hostPlayer = players[0];
    const matchedVenue = venueMap.get(s.venueName.trim().toLowerCase());

    const isPast = end < now;
    let finalStatus = MatchStatus.OPEN;
    if (s.forceStatus) {
      finalStatus = s.forceStatus;
    } else if (isPast) {
      finalStatus = MatchStatus.COMPLETED;
    } else if (joinedCount >= totalSlots) {
      finalStatus = MatchStatus.FULL;
    }

    const shareCode = `CM-${Math.random().toString(36).substring(2, 6).toUpperCase()}${i.toString(36).toUpperCase()}`;

    matchesToInsert.push({
      hostId: hostPlayer.userId,
      hostName: hostPlayer.name,
      hostAvatar: hostPlayer.avatarUrl || '',
      hostPhone: hostPlayer.phone || '',
      sport: s.sport,
      title: s.title,
      venueId: s.venueId || (matchedVenue ? matchedVenue._id.toString() : ''),
      venueName: s.venueName,
      venueAddress: matchedVenue ? matchedVenue.address : s.venueAddress,
      district: matchedVenue ? matchedVenue.district : s.district,
      city: 'Da Nang',
      courtNumber: s.courtNumber,
      startTime: start,
      endTime: end,
      totalSlots: 8,
      joinedCount: players.length,
      players,
      minSkillLevel: s.minSkillLevel,
      maxSkillLevel: s.maxSkillLevel,
      estimatedCostText: s.estimatedCostText,
      notes: s.notes,
      shuttleType: s.shuttleType,
      status: finalStatus,
      shareCode,
      createdAt: new Date(now.getTime() - 86400000),
      updatedAt: new Date(),
    });
  }

  await matchesCollection.deleteMany({});
  const result = await matchesCollection.insertMany(matchesToInsert);

  console.log(`✓ Đã seed thành công ${result.insertedCount} bài đăng giao lưu (Tất cả đều có totalSlots = 8 người)!`);
  await client.close();
}

seedUsersAndMatches().catch((err) => {
  console.error('Lỗi khi seed dữ liệu giao lưu & người dùng:', err);
  process.exit(1);
});
