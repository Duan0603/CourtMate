/**
 * Seed script: 50 Real-feeling Tournaments across Da Nang + Fake Users & Registrations
 * 
 * - Creates 120 realistic sports players in Da Nang (collection 'users')
 * - Creates 50 tournaments spread across 6-7 districts in Da Nang (collection 'tournaments')
 * - Creates authentic registrations for these tournaments linking the users (collection 'registrations')
 * - Updates joinedSlots on each tournament accurately
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin';

// Vietnamese name components
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const MIDDLE_NAMES_MALE = ['Văn', 'Hữu', 'Đức', 'Quốc', 'Minh', 'Thành', 'Tuấn', 'Công', 'Gia', 'Trọng'];
const MIDDLE_NAMES_FEMALE = ['Thị', 'Ngọc', 'Thảo', 'Phương', 'Mai', 'Thanh', 'Khánh', 'Như', 'Hồng', 'Tuyết'];
const FIRST_NAMES_MALE = ['Huy', 'Nam', 'Hoàng', 'Duy', 'Bảo', 'Khoa', 'Tùng', 'Việt', 'Sơn', 'Dũng', 'Long', 'Kiên', 'Hải', 'Quân', 'Thịnh', 'Trí', 'Đạt'];
const FIRST_NAMES_FEMALE = ['Linh', 'Trang', 'Hương', 'Vy', 'Trâm', 'Ngọc', 'Nhi', 'Hà', 'My', 'Chi', 'Phương', 'Lan', 'Quỳnh', 'Châu', 'Tú', 'Yến'];

const DISTRICTS = [
  'Hải Châu',
  'Sơn Trà',
  'Ngũ Hành Sơn',
  'Cẩm Lệ',
  'Thanh Khê',
  'Liên Chiểu',
  'Hòa Vang'
];

const BADMINTON_COVERS = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521537634581-0dced2fed2a8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80'
];

const PICKLEBALL_COVERS = [
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80'
];

const TENNIS_COVERS = [
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511067007798-4029d3c7d057?auto=format&fit=crop&w=1200&q=80'
];

const FOOTBALL_COVERS = [
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80'
];

// 50 specific tournaments definitions tailored for Da Nang
const TOURNAMENT_DEFINITIONS = [
  // 1-18: BADMINTON (18 tournaments)
  {
    title: 'Giải Cầu lông Mở rộng Cẩm Lệ Mùa Thu 2026',
    sport: 'BADMINTON',
    district: 'Cẩm Lệ',
    location: 'Sân cầu lông Hiếu Con, 172-182 Đỗ Quỳ, Hòa Xuân, Cẩm Lệ',
    organizer: 'CLB Cầu lông Hiếu Con x Quận Đoàn Cẩm Lệ',
    status: 'OPEN',
    fee: 200000,
    slotsLimit: 32,
    daysAhead: 5,
    durationDays: 3,
  },
  {
    title: 'Cúp Cầu lông Đôi Nam Nữ Sơn Trà Super Series',
    sport: 'BADMINTON',
    district: 'Sơn Trà',
    location: 'Sân cầu lông Aurora Sport, Đường Số 6, KCN An Đồn, Sơn Trà',
    organizer: 'Aurora Badminton Club',
    status: 'OPEN',
    fee: 250000,
    slotsLimit: 24,
    daysAhead: 7,
    durationDays: 2,
  },
  {
    title: 'Đà Nẵng Badminton Master Cup 2026',
    sport: 'BADMINTON',
    district: 'Hải Châu',
    location: 'Cung Thể Thao Tiên Sơn, Đường Phan Đăng Lưu, Hải Châu',
    organizer: 'Liên đoàn Cầu lông TP. Đà Nẵng',
    status: 'OPEN',
    fee: 300000,
    slotsLimit: 48,
    daysAhead: 12,
    durationDays: 4,
  },
  {
    title: 'Giải Cầu lông Phong trào Thanh Khê Open',
    sport: 'BADMINTON',
    district: 'Thanh Khê',
    location: 'Sân Cầu lông Kỳ Đồng, 24 Kỳ Đồng, Thanh Khê',
    organizer: 'CLB Vợt Thủ Thanh Khê',
    status: 'OPEN',
    fee: 180000,
    slotsLimit: 32,
    daysAhead: 10,
    durationDays: 2,
  },
  {
    title: 'Hội Vợt Cầu lông Ngũ Hành Sơn 2026',
    sport: 'BADMINTON',
    district: 'Ngũ Hành Sơn',
    location: 'SÂN CẦU LÔNG INDEXSPORT 2, 81C Lê Văn Hiến, Ngũ Hành Sơn',
    organizer: 'IndexSport Club Ngũ Hành Sơn',
    status: 'OPEN',
    fee: 220000,
    slotsLimit: 24,
    daysAhead: 15,
    durationDays: 3,
  },
  {
    title: 'Giải Cầu lông Sinh viên Đại học Bách Khoa Đà Nẵng',
    sport: 'BADMINTON',
    district: 'Liên Chiểu',
    location: 'Sân Cầu Lông CBC Badminton, 642 Tôn Đức Thắng, Liên Chiểu',
    organizer: 'Đoàn Thanh niên ĐH Bách Khoa x CBC Club',
    status: 'OPEN',
    fee: 150000,
    slotsLimit: 32,
    daysAhead: 8,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông Doanh nghiệp Trẻ Hải Châu',
    sport: 'BADMINTON',
    district: 'Hải Châu',
    location: 'Sân Bưu Điện, 50B Nguyễn Du, Hải Châu',
    organizer: 'Hội Doanh nhân Trẻ Hải Châu',
    status: 'OPEN',
    fee: 350000,
    slotsLimit: 24,
    daysAhead: 20,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông Giao lưu Quân khu 5',
    sport: 'BADMINTON',
    district: 'Hải Châu',
    location: 'Nhà thi đấu Quân khu 5, 07 Duy Tân, Hải Châu',
    organizer: 'Trung tâm TDTT Quân khu 5',
    status: 'IN_PROGRESS',
    fee: 200000,
    slotsLimit: 24,
    daysAhead: -1,
    durationDays: 3,
  },
  {
    title: 'Giải Cầu lông Hè Sơn Trà Badminton Challenger',
    sport: 'BADMINTON',
    district: 'Sơn Trà',
    location: 'PINPON SPORT Badminton, Đường Số 6, An Hải Bắc, Sơn Trà',
    organizer: 'CLB PinPon Sport',
    status: 'OPEN',
    fee: 220000,
    slotsLimit: 32,
    daysAhead: 14,
    durationDays: 2,
  },
  {
    title: 'Cúp Vợt Vàng Hòa Xuân 2026',
    sport: 'BADMINTON',
    district: 'Cẩm Lệ',
    location: 'Sân cầu lông CLB Nam Bo, 45 Trần Xuân Soạn, Cẩm Lệ',
    organizer: 'Ban Quản lý Sân Nam Bo',
    status: 'OPEN',
    fee: 190000,
    slotsLimit: 24,
    daysAhead: 18,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông Gia đình & Đôi Nam Nữ Thanh Khê',
    sport: 'BADMINTON',
    district: 'Thanh Khê',
    location: 'Sân D-Sport Thanh Khê, 115 Hà Huy Tập, Thanh Khê',
    organizer: 'Hội Thể thao Cộng đồng Thanh Khê',
    status: 'OPEN',
    fee: 200000,
    slotsLimit: 16,
    daysAhead: 22,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông FPT City Badminton Cup',
    sport: 'BADMINTON',
    district: 'Ngũ Hành Sơn',
    location: 'Nhà thể thao FPT City, Phường Hòa Hải, Ngũ Hành Sơn',
    organizer: 'FPT Software Danang Sports Club',
    status: 'OPEN',
    fee: 200000,
    slotsLimit: 32,
    daysAhead: 25,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông Rookie Khởi động Liên Chiểu',
    sport: 'BADMINTON',
    district: 'Liên Chiểu',
    location: 'ForFun Badminton, 102 Hoàng Văn Thái, Liên Chiểu',
    organizer: 'ForFun Sports Club',
    status: 'UPCOMING',
    fee: 160000,
    slotsLimit: 24,
    daysAhead: 30,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông Nữ Duyên dáng Đà Thành 2026',
    sport: 'BADMINTON',
    district: 'Hải Châu',
    location: 'Nhà thi đấu Phan Đăng Lưu, Hải Châu',
    organizer: 'Hội Liên hiệp Phụ nữ Đà Nẵng',
    status: 'OPEN',
    fee: 150000,
    slotsLimit: 24,
    daysAhead: 9,
    durationDays: 2,
  },
  {
    title: 'Giải Vô địch Cầu lông Đơn Nam Hòa Vang',
    sport: 'BADMINTON',
    district: 'Hòa Vang',
    location: 'Trung tâm VHTT Hòa Vang, Quốc lộ 14B, Hòa Vang',
    organizer: 'Trung tâm VHTT Huyện Hòa Vang',
    status: 'OPEN',
    fee: 150000,
    slotsLimit: 32,
    daysAhead: 16,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông Giang Badminton Mở rộng Mùa 1',
    sport: 'BADMINTON',
    district: 'Cẩm Lệ',
    location: 'Sân Giang Badminton, 145 Lý Nhân Tông, Cẩm Lệ',
    organizer: 'CLB Giang Badminton',
    status: 'OPEN',
    fee: 250000,
    slotsLimit: 24,
    daysAhead: 11,
    durationDays: 2,
  },
  {
    title: 'Giải Cầu lông Tứ Hùng Bắc Mỹ An',
    sport: 'BADMINTON',
    district: 'Ngũ Hành Sơn',
    location: 'Sân 85 Ngũ Hành Sơn, Mỹ An, Ngũ Hành Sơn',
    organizer: 'CLB Thể thao Bắc Mỹ An',
    status: 'COMPLETED',
    fee: 200000,
    slotsLimit: 16,
    daysAhead: -10,
    durationDays: 2,
  },
  {
    title: 'Đà Nẵng Badminton Open All-Stars 2026',
    sport: 'BADMINTON',
    district: 'Sơn Trà',
    location: 'Sân Trường Tiểu học Ngô Gia Tự, 61 Phạm Cự Lượng, Sơn Trà',
    organizer: 'Ban Thể thao Phường An Hải Đông',
    status: 'UPCOMING',
    fee: 280000,
    slotsLimit: 32,
    daysAhead: 35,
    durationDays: 3,
  },

  // 19-36: PICKLEBALL (18 tournaments)
  {
    title: 'Đà Nẵng Pickleball Championship Trình 3.0+',
    sport: 'PICKLEBALL',
    district: 'Hải Châu',
    location: 'Cung Thể Thao Tiên Sơn, Đường Phan Đăng Lưu, Hải Châu',
    organizer: 'Liên đoàn Pickleball Đà Nẵng (DPF)',
    status: 'OPEN',
    fee: 300000,
    slotsLimit: 32,
    daysAhead: 6,
    durationDays: 2,
  },
  {
    title: 'Sơn Trà Pickleball Sunset League 2026',
    sport: 'PICKLEBALL',
    district: 'Sơn Trà',
    location: 'Cụm sân Pickleball Biển Mỹ Khê, Đường Võ Nguyên Giáp, Sơn Trà',
    organizer: 'CLB Pickleball Sơn Trà Sunset',
    status: 'OPEN',
    fee: 250000,
    slotsLimit: 24,
    daysAhead: 8,
    durationDays: 2,
  },
  {
    title: 'Ngũ Hành Sơn Pickleball Open - Cúp Non Nước',
    sport: 'PICKLEBALL',
    district: 'Ngũ Hành Sơn',
    location: 'Cụm sân Thể thao FPT City Danang, Ngũ Hành Sơn',
    organizer: 'Ban Điều hành Thể thao FPT City',
    status: 'OPEN',
    fee: 280000,
    slotsLimit: 24,
    daysAhead: 14,
    durationDays: 2,
  },
  {
    title: 'Giải Pickleball Đôi Nam Nữ Cẩm Lệ Mùa 2',
    sport: 'PICKLEBALL',
    district: 'Cẩm Lệ',
    location: 'Sân Pickleball Hòa Xuân, Đường 29/3, Cẩm Lệ',
    organizer: 'CLB Pickleball Hòa Xuân',
    status: 'OPEN',
    fee: 220000,
    slotsLimit: 24,
    daysAhead: 12,
    durationDays: 2,
  },
  {
    title: 'Pickleball Rookie Cup Thanh Khê 2026',
    sport: 'PICKLEBALL',
    district: 'Thanh Khê',
    location: 'Cụm sân D-Sport Pickleball, 115 Hà Huy Tập, Thanh Khê',
    organizer: 'D-Sport Community Club',
    status: 'OPEN',
    fee: 200000,
    slotsLimit: 32,
    daysAhead: 9,
    durationDays: 2,
  },
  {
    title: 'Pickleball Sinh viên Đà Nẵng UniCup 2026',
    sport: 'PICKLEBALL',
    district: 'Liên Chiểu',
    location: 'Cụm sân Thể thao ĐH Sư Phạm Đà Nẵng, Liên Chiểu',
    organizer: 'Hội Sinh viên TP. Đà Nẵng',
    status: 'OPEN',
    fee: 150000,
    slotsLimit: 32,
    daysAhead: 16,
    durationDays: 2,
  },
  {
    title: 'Đà Nẵng Premier Pickleball Tour - Chặng 1',
    sport: 'PICKLEBALL',
    district: 'Hải Châu',
    location: 'Cung Thể Thao Tiên Sơn, Hải Châu',
    organizer: 'DPF x V-Pickleball Association',
    status: 'OPEN',
    fee: 350000,
    slotsLimit: 48,
    daysAhead: 21,
    durationDays: 3,
  },
  {
    title: 'Pickleball Night Challenge Tiên Sơn',
    sport: 'PICKLEBALL',
    district: 'Hải Châu',
    location: 'Sân Pickleball Ngoài trời Tiên Sơn, Phan Đăng Lưu, Hải Châu',
    organizer: 'Tiên Sơn Night Sports Club',
    status: 'IN_PROGRESS',
    fee: 250000,
    slotsLimit: 16,
    daysAhead: -1,
    durationDays: 2,
  },
  {
    title: 'Pickleball Vợt Thủ Sơn Trà Pro-Am 2026',
    sport: 'PICKLEBALL',
    district: 'Sơn Trà',
    location: 'Cụm sân Hợp Thành Phát, Đường Vương Thừa Vũ, Sơn Trà',
    organizer: 'CLB Hợp Thành Phát Sport',
    status: 'OPEN',
    fee: 320000,
    slotsLimit: 24,
    daysAhead: 13,
    durationDays: 2,
  },
  {
    title: 'Giải Pickleball Doanh nhân Biển Đà Nẵng',
    sport: 'PICKLEBALL',
    district: 'Sơn Trà',
    location: 'Sân Pickleball Furama Resort, Sơn Trà - Ngũ Hành Sơn',
    organizer: 'CLB Doanh nhân Du lịch Đà Nẵng',
    status: 'OPEN',
    fee: 400000,
    slotsLimit: 24,
    daysAhead: 19,
    durationDays: 2,
  },
  {
    title: 'Pickleball Giao lưu Trình 2.5 Thanh Khê',
    sport: 'PICKLEBALL',
    district: 'Thanh Khê',
    location: 'Sân Thể thao Kỳ Đồng, Thanh Khê',
    organizer: 'Kỳ Đồng Pickleball Hub',
    status: 'OPEN',
    fee: 180000,
    slotsLimit: 24,
    daysAhead: 11,
    durationDays: 2,
  },
  {
    title: 'Giải Pickleball Mở rộng Phường Hòa Cường',
    sport: 'PICKLEBALL',
    district: 'Hải Châu',
    location: 'Cụm sân Thể thao Phường Hòa Cường Nam, Hải Châu',
    organizer: 'UBND Phường Hòa Cường Nam',
    status: 'UPCOMING',
    fee: 150000,
    slotsLimit: 20,
    daysAhead: 28,
    durationDays: 2,
  },
  {
    title: 'Giải Pickleball Hòa Vang Mùa Gặt 2026',
    sport: 'PICKLEBALL',
    district: 'Hòa Vang',
    location: 'Nhà thi đấu Thể thao Hòa Châu, Huyện Hòa Vang',
    organizer: 'CLB Thể thao Nông thôn Mới Hòa Vang',
    status: 'OPEN',
    fee: 160000,
    slotsLimit: 20,
    daysAhead: 17,
    durationDays: 2,
  },
  {
    title: 'Đà Nẵng Women Pickleball Festival 2026',
    sport: 'PICKLEBALL',
    district: 'Hải Châu',
    location: 'Cung Thể Thao Tiên Sơn, Hải Châu',
    organizer: 'Ban Nữ công TP. Đà Nẵng x DPF',
    status: 'OPEN',
    fee: 200000,
    slotsLimit: 32,
    daysAhead: 22,
    durationDays: 2,
  },
  {
    title: 'Giải Pickleball Đôi Nam Trình 4.0 Super Cup',
    sport: 'PICKLEBALL',
    district: 'Ngũ Hành Sơn',
    location: 'Cụm sân Pickleball An Thượng, Ngũ Hành Sơn',
    organizer: 'An Thuong Expat & Local Sports Club',
    status: 'OPEN',
    fee: 350000,
    slotsLimit: 16,
    daysAhead: 24,
    durationDays: 2,
  },
  {
    title: 'Pickleball Mùa Đông Cẩm Lệ Challenger',
    sport: 'PICKLEBALL',
    district: 'Cẩm Lệ',
    location: 'Sân Thể thao Khuê Trung, Cẩm Lệ',
    organizer: 'CLB Pickleball Khuê Trung',
    status: 'UPCOMING',
    fee: 220000,
    slotsLimit: 24,
    daysAhead: 35,
    durationDays: 2,
  },
  {
    title: 'Giải Pickleball Liên Chiểu Family & Kids',
    sport: 'PICKLEBALL',
    district: 'Liên Chiểu',
    location: 'Sân Vận động Hòa Khánh, Liên Chiểu',
    organizer: 'Trung tâm VHTT Quận Liên Chiểu',
    status: 'OPEN',
    fee: 150000,
    slotsLimit: 20,
    daysAhead: 15,
    durationDays: 2,
  },
  {
    title: 'Giải Vô địch Pickleball Đà Nẵng Giao hữu CLB',
    sport: 'PICKLEBALL',
    district: 'Sơn Trà',
    location: 'Cụm sân Hợp Thành Phát, Sơn Trà',
    organizer: 'Liên đoàn Thể thao Phong trào',
    status: 'COMPLETED',
    fee: 250000,
    slotsLimit: 24,
    daysAhead: -7,
    durationDays: 2,
  },

  // 37-43: TENNIS (7 tournaments)
  {
    title: 'Giải Quần vợt Doanh nhân Đà Nẵng Mở rộng 2026',
    sport: 'TENNIS',
    district: 'Hải Châu',
    location: 'Cụm sân Tennis Tuyên Sơn, 02 Nại Nam, Hải Châu',
    organizer: 'Hội Doanh nghiệp Trẻ Đà Nẵng',
    status: 'OPEN',
    fee: 500000,
    slotsLimit: 32,
    daysAhead: 14,
    durationDays: 3,
  },
  {
    title: 'Sơn Trà Tennis Open - Cúp Bán Đảo 2026',
    sport: 'TENNIS',
    district: 'Sơn Trà',
    location: 'Sân Tennis Mỹ Khê, Đường Võ Nguyên Giáp, Sơn Trà',
    organizer: 'CLB Tennis Sơn Trà',
    status: 'OPEN',
    fee: 450000,
    slotsLimit: 24,
    daysAhead: 19,
    durationDays: 2,
  },
  {
    title: 'Giải Tennis Phong trào Ngũ Hành Sơn Điểm Trình 1350',
    sport: 'TENNIS',
    district: 'Ngũ Hành Sơn',
    location: 'Sân Tennis Làng Đại học Đà Nẵng, Ngũ Hành Sơn',
    organizer: 'Diễn đàn Tennis Đà Nẵng',
    status: 'OPEN',
    fee: 400000,
    slotsLimit: 24,
    daysAhead: 12,
    durationDays: 2,
  },
  {
    title: 'Giải Quần vợt Hữu nghị Cẩm Lệ - Hòa Vang',
    sport: 'TENNIS',
    district: 'Cẩm Lệ',
    location: 'Cụm sân Tennis Hòa Xuân, Cẩm Lệ',
    organizer: 'CLB Tennis Hòa Xuân Sport',
    status: 'OPEN',
    fee: 350000,
    slotsLimit: 16,
    daysAhead: 21,
    durationDays: 2,
  },
  {
    title: 'Giải Quần vợt Trẻ Thanh Khê Mở rộng',
    sport: 'TENNIS',
    district: 'Thanh Khê',
    location: 'Sân Tennis Chi Lăng, 38 Ngô Gia Tự, Thanh Khê',
    organizer: 'Trung tâm Đào tạo Tennis Trẻ Đà Nẵng',
    status: 'UPCOMING',
    fee: 300000,
    slotsLimit: 24,
    daysAhead: 29,
    durationDays: 2,
  },
  {
    title: 'Giải Tennis Lão tướng Đà Nẵng 50+ 2026',
    sport: 'TENNIS',
    district: 'Hải Châu',
    location: 'Cụm sân Tennis Tuyên Sơn, Hải Châu',
    organizer: 'CLB Tennis Hưu trí TP. Đà Nẵng',
    status: 'IN_PROGRESS',
    fee: 350000,
    slotsLimit: 16,
    daysAhead: -1,
    durationDays: 3,
  },
  {
    title: 'Giải Tennis FPT City Invitational 2026',
    sport: 'TENNIS',
    district: 'Ngũ Hành Sơn',
    location: 'Cụm sân Tennis FPT City, Phường Hòa Hải, Ngũ Hành Sơn',
    organizer: 'FPT Complex Sports Club',
    status: 'OPEN',
    fee: 400000,
    slotsLimit: 24,
    daysAhead: 26,
    durationDays: 2,
  },

  // 44-50: FOOTBALL (7 tournaments)
  {
    title: 'Hải Châu Super League S7 - Giải Bóng đá Sân 7',
    sport: 'FOOTBALL',
    district: 'Hải Châu',
    location: 'Làng Thể thao Tuyên Sơn, Đường Nại Nam 2, Hải Châu',
    organizer: 'Liên đoàn Bóng đá Phong trào Hải Châu',
    status: 'OPEN',
    fee: 600000,
    slotsLimit: 16,
    daysAhead: 15,
    durationDays: 14,
  },
  {
    title: 'Cúp Bóng đá Phong trào Sơn Trà Mùa Thu',
    sport: 'FOOTBALL',
    district: 'Sơn Trà',
    location: 'Sân bóng đá Chuyên Việt, Đường Trần Hưng Đạo, Sơn Trà',
    organizer: 'CLB Bóng đá Bán Đảo Sơn Trà',
    status: 'OPEN',
    fee: 500000,
    slotsLimit: 16,
    daysAhead: 10,
    durationDays: 10,
  },
  {
    title: 'Giải Bóng đá Doanh nghiệp Cẩm Lệ Cup',
    sport: 'FOOTBALL',
    district: 'Cẩm Lệ',
    location: 'Khu liên hợp Thể thao Hòa Xuân, Cẩm Lệ',
    organizer: 'Hiệp hội Doanh nghiệp Cẩm Lệ',
    status: 'OPEN',
    fee: 600000,
    slotsLimit: 16,
    daysAhead: 18,
    durationDays: 12,
  },
  {
    title: 'Giải Bóng đá Thanh niên Sinh viên Liên Chiểu 2026',
    sport: 'FOOTBALL',
    district: 'Liên Chiểu',
    location: 'Sân bóng đá Quân Đội, Đường Tôn Đức Thắng, Liên Chiểu',
    organizer: 'Quận Đoàn Liên Chiểu',
    status: 'OPEN',
    fee: 450000,
    slotsLimit: 20,
    daysAhead: 14,
    durationDays: 10,
  },
  {
    title: 'Giải Futsal Cộng đồng Thanh Khê Open',
    sport: 'FOOTBALL',
    district: 'Thanh Khê',
    location: 'Nhà thi đấu Thể thao Thanh Khê, Đường Hà Huy Tập, Thanh Khê',
    organizer: 'Trung tâm TDTT Quận Thanh Khê',
    status: 'UPCOMING',
    fee: 400000,
    slotsLimit: 12,
    daysAhead: 30,
    durationDays: 5,
  },
  {
    title: 'Cúp Bóng đá Tứ Hùng Ngũ Hành Sơn 2026',
    sport: 'FOOTBALL',
    district: 'Ngũ Hành Sơn',
    location: 'Sân bóng đá Nam Việt Á, Đường Bùi Tá Hán, Ngũ Hành Sơn',
    organizer: 'CLB Bóng đá Nam Việt Á',
    status: 'IN_PROGRESS',
    fee: 500000,
    slotsLimit: 8,
    daysAhead: -2,
    durationDays: 5,
  },
  {
    title: 'Giải Bóng đá Giao lưu Khối Cơ quan Hòa Vang',
    sport: 'FOOTBALL',
    district: 'Hòa Vang',
    location: 'Sân Vận động Huyện Hòa Vang, Hòa Phong, Hòa Vang',
    organizer: 'UBND Huyện Hòa Vang',
    status: 'OPEN',
    fee: 350000,
    slotsLimit: 12,
    daysAhead: 20,
    durationDays: 7,
  }
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  const prefixes = ['0905', '0914', '0935', '0979', '0983', '0903', '0913', '0932', '0968'];
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

// Generate 120 unique Vietnamese names
function generateUserList(count = 120) {
  const users = [];
  const generatedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.35;
    const lastName = getRandomItem(LAST_NAMES);
    const middleName = isMale ? getRandomItem(MIDDLE_NAMES_MALE) : getRandomItem(MIDDLE_NAMES_FEMALE);
    const firstName = isMale ? getRandomItem(FIRST_NAMES_MALE) : getRandomItem(FIRST_NAMES_FEMALE);
    const fullName = `${lastName} ${middleName} ${firstName}`;

    // Generate unique email
    const baseSlug = `${removeAccents(firstName)}.${removeAccents(lastName)}${Math.floor(10 + Math.random() * 90)}`;
    let email = `${baseSlug}@gmail.com`;
    let counter = 1;
    while (generatedEmails.has(email)) {
      email = `${baseSlug}.${counter}@gmail.com`;
      counter++;
    }
    generatedEmails.add(email);

    // Sports preference
    const primarySport = getRandomItem(['BADMINTON', 'PICKLEBALL', 'TENNIS', 'FOOTBALL']);
    const secondarySport = Math.random() > 0.5 ? getRandomItem(['BADMINTON', 'PICKLEBALL']) : null;
    const sports = secondarySport && secondarySport !== primarySport ? [primarySport, secondarySport] : [primarySport];

    const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const skillLevel = getRandomItem(skillLevels);
    const district = getRandomItem(DISTRICTS);

    const clubs = [
      'CLB Vợt Vàng Đà Nẵng',
      'Đà Nẵng Pickleball Community',
      'CLB Cầu Lông Sơn Trà',
      'Hải Châu Tennis Team',
      'FPT Sports Danang',
      'CLB Bách Khoa Sport',
      'CLB Tiên Sơn Badminton',
      'FC Hòa Xuân'
    ];

    users.push({
      _id: new ObjectId(),
      email,
      name: fullName,
      role: 'USER',
      preferences: {
        profileType: 'PLAYER',
        sports,
        location: 'Da Nang',
        skillLevel,
        district,
        clubName: getRandomItem(clubs)
      },
      phone: getRandomPhone(),
      isVerified: Math.random() > 0.75,
      bookmarkedTournaments: [],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000),
      updatedAt: new Date()
    });
  }

  return users;
}

async function runSeed() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('courtmate');

  console.log('Successfully connected to database "courtmate"!');

  // 1. Generate & Insert 120 Users
  console.log('Generating 120 realistic players in Da Nang...');
  const newUsers = generateUserList(120);

  // Check existing users to avoid email collisions
  const existingUsers = await db.collection('users').find({}, { projection: { email: 1 } }).toArray();
  const existingEmails = new Set(existingUsers.map(u => u.email));
  const usersToInsert = newUsers.filter(u => !existingEmails.has(u.email));

  if (usersToInsert.length > 0) {
    await db.collection('users').insertMany(usersToInsert);
    console.log(`✓ Inserted ${usersToInsert.length} new users into 'users' collection.`);
  }

  // Combine newly inserted users with existing users for registration assignments
  const allUsers = await db.collection('users').find({ 'preferences.profileType': 'PLAYER' }).toArray();
  console.log(`Total available player users in system: ${allUsers.length}`);

  // 2. Build and Insert 50 Tournaments
  console.log('Building 50 tournaments spread across Da Nang...');
  const now = new Date();

  const tournamentsToInsert = [];
  const allRegistrationsToInsert = [];

  for (let i = 0; i < TOURNAMENT_DEFINITIONS.length; i++) {
    const def = TOURNAMENT_DEFINITIONS[i];
    const tournamentId = new ObjectId();

    const startDate = new Date(now.getTime() + def.daysAhead * 86400000);
    const endDate = new Date(startDate.getTime() + def.durationDays * 86400000);

    const startStr = `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`;
    const endStr = `${String(endDate.getDate()).padStart(2, '0')}/${String(endDate.getMonth() + 1).padStart(2, '0')}/${endDate.getFullYear()}`;
    const timeStr = `${startStr} - ${endStr}`;

    // Choose cover image
    let coverImage = '';
    if (def.sport === 'BADMINTON') coverImage = BADMINTON_COVERS[i % BADMINTON_COVERS.length];
    else if (def.sport === 'PICKLEBALL') coverImage = PICKLEBALL_COVERS[i % PICKLEBALL_COVERS.length];
    else if (def.sport === 'TENNIS') coverImage = TENNIS_COVERS[i % TENNIS_COVERS.length];
    else coverImage = FOOTBALL_COVERS[i % FOOTBALL_COVERS.length];

    // Categories
    let categories = [];
    if (def.sport === 'BADMINTON') {
      categories = [
        { id: 'cat_md', name: 'Đôi Nam Nâng cao', fee: def.fee, maxParticipants: Math.floor(def.slotsLimit / 2) },
        { id: 'cat_xd', name: 'Đôi Nam Nữ Phong trào', fee: def.fee, maxParticipants: Math.floor(def.slotsLimit / 2) }
      ];
    } else if (def.sport === 'PICKLEBALL') {
      categories = [
        { id: 'cat_p30', name: 'Đôi Nam Trình 3.0+', fee: def.fee, maxParticipants: Math.floor(def.slotsLimit / 2) },
        { id: 'cat_pxd', name: 'Đôi Nam Nữ Mở rộng', fee: def.fee, maxParticipants: Math.floor(def.slotsLimit / 2) }
      ];
    } else if (def.sport === 'TENNIS') {
      categories = [
        { id: 'cat_tms', name: 'Đơn Nam Trình 650', fee: def.fee, maxParticipants: Math.floor(def.slotsLimit / 2) },
        { id: 'cat_tmd', name: 'Đôi Nam Điểm Trình 1350', fee: def.fee, maxParticipants: Math.floor(def.slotsLimit / 2) }
      ];
    } else {
      categories = [
        { id: 'cat_f7', name: 'Bóng đá Sân 7 Mở rộng', fee: def.fee, maxParticipants: def.slotsLimit }
      ];
    }

    // Determine how many registrations to fake for this tournament
    let targetParticipantsCount = 0;
    if (def.status === 'COMPLETED') {
      targetParticipantsCount = Math.floor(def.slotsLimit * 0.9); // near full
    } else if (def.status === 'IN_PROGRESS') {
      targetParticipantsCount = Math.floor(def.slotsLimit * 0.85); // 85% full
    } else if (def.status === 'OPEN') {
      targetParticipantsCount = Math.floor(def.slotsLimit * (0.35 + Math.random() * 0.45)); // 35% - 80% full
    } else {
      // UPCOMING
      targetParticipantsCount = Math.floor(def.slotsLimit * (0.15 + Math.random() * 0.25)); // 15% - 40% full
    }

    targetParticipantsCount = Math.max(4, Math.min(targetParticipantsCount, def.slotsLimit - 2));

    // Shuffle & pick unique users for this tournament
    const shuffledUsers = [...allUsers].sort(() => 0.5 - Math.random());
    const selectedParticipants = shuffledUsers.slice(0, targetParticipantsCount);

    let approvedOrPaidCount = 0;

    for (let pIdx = 0; pIdx < selectedParticipants.length; pIdx++) {
      const player = selectedParticipants[pIdx];

      // Registration status: 80% APPROVED, 15% PAID, 5% PENDING
      const randStatus = Math.random();
      let regStatus = 'APPROVED';
      if (randStatus < 0.2) regStatus = 'PAID';
      else if (randStatus < 0.25 && def.status === 'OPEN') regStatus = 'PENDING';

      if (regStatus === 'APPROVED' || regStatus === 'PAID') {
        approvedOrPaidCount++;
      }

      const hasPartner = ['BADMINTON', 'PICKLEBALL'].includes(def.sport) || Math.random() > 0.5;
      const partnerName = hasPartner 
        ? `${getRandomItem(LAST_NAMES)} ${getRandomItem(MIDDLE_NAMES_MALE)} ${getRandomItem(FIRST_NAMES_MALE)}`
        : undefined;

      const regSkill = getRandomItem(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

      allRegistrationsToInsert.push({
        _id: new ObjectId(),
        tournamentId: tournamentId.toString(),
        playerId: player._id.toString(),
        playerName: player.name,
        partnerName: partnerName,
        contactPhone: player.phone || getRandomPhone(),
        skillLevel: regSkill,
        status: regStatus,
        createdAt: new Date(startDate.getTime() - Math.floor(Math.random() * 10 + 1) * 86400000),
        updatedAt: new Date()
      });
    }

    // Tournament Document
    tournamentsToInsert.push({
      _id: tournamentId,
      title: def.title,
      description: `Giải đấu thể thao phong trào ${def.title} được tổ chức chuyên nghiệp tại quận ${def.district}, TP. Đà Nẵng. Quy tụ các VĐV, câu lạc bộ hàng đầu giao lưu học hỏi và tranh tài sôi nổi.`,
      sport: def.sport,
      time: timeStr,
      coverImage: coverImage,
      startDate: startDate,
      endDate: endDate,
      location: def.location,
      district: def.district,
      city: 'Da Nang',
      organizer: {
        id: `org_dn_${i + 1}`,
        name: def.organizer,
        isVerified: true
      },
      status: def.status,
      rules: `1. Luật thi đấu: Áp dụng luật thi đấu chính thức hiện hành của Tổng cục TDTT.\n2. Trang phục: Đồng phục thể thao lịch sự, mang giày chuyên dụng đúng mặt sân.\n3. Thời gian: VĐV có mặt trước giờ thi đấu 20 phút để làm thủ tục check-in.\n4. Quyết định của Trọng tài chính và Ban Tổ Chức là quyết định cuối cùng.`,
      rulesText: `1. Luật thi đấu: Áp dụng luật thi đấu chính thức hiện hành của Tổng cục TDTT.\n2. Trang phục: Đồng phục thể thao lịch sự, mang giày chuyên dụng đúng mặt sân.\n3. Thời gian: VĐV có mặt trước giờ thi đấu 20 phút để làm thủ tục check-in.\n4. Quyết định của Trọng tài chính và Ban Tổ Chức là quyết định cuối cùng.`,
      categories: categories,
      registrationFee: def.fee,
      slotsLimit: def.slotsLimit,
      joinedSlots: approvedOrPaidCount,
      registrationLink: '',
      reportsCount: 0,
      isHidden: false,
      isFeatured: i < 5, // Mark top 5 as featured
      createdAt: new Date(now.getTime() - (50 - i) * 3600000),
      updatedAt: new Date()
    });
  }

  // Insert tournaments
  if (tournamentsToInsert.length > 0) {
    await db.collection('tournaments').insertMany(tournamentsToInsert);
    console.log(`✓ Inserted ${tournamentsToInsert.length} tournaments into 'tournaments' collection.`);
  }

  // Insert registrations
  if (allRegistrationsToInsert.length > 0) {
    await db.collection('registrations').insertMany(allRegistrationsToInsert);
    console.log(`✓ Inserted ${allRegistrationsToInsert.length} registrations into 'registrations' collection.`);
  }

  // 3. Final Verification and Statistics
  const totalTournaments = await db.collection('tournaments').countDocuments();
  const totalUsersInDb = await db.collection('users').countDocuments();
  const totalRegistrationsInDb = await db.collection('registrations').countDocuments();

  const tournamentsInDaNang = await db.collection('tournaments').countDocuments({ city: 'Da Nang' });

  console.log('\n========================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`Total Tournaments in DB:       ${totalTournaments} (Da Nang: ${tournamentsInDaNang})`);
  console.log(`Total Users in DB:             ${totalUsersInDb}`);
  console.log(`Total Registrations in DB:     ${totalRegistrationsInDb}`);
  console.log('========================================\n');

  await client.close();
}

runSeed().catch(err => {
  console.error('Seed execution failed:', err);
  process.exit(1);
});
