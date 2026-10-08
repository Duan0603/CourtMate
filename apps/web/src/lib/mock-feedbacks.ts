import { PlatformFeedback } from '@courtmate/shared';

const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=200&q=80',
];

const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
];

interface FeedbackItemSeed {
  userName: string;
  gender: 'male' | 'female';
  userRole: string;
  rating: number;
  comment: string;
  category: string;
}

const FEEDBACK_ITEMS: FeedbackItemSeed[] = [
  // --- 1 to 10 ---
  {
    userName: 'Nguyễn Thành Long',
    gender: 'male',
    userRole: 'Pickleball Sơn Trà • DUPR 3.5',
    rating: 5,
    comment: 'CourtMate giúp mình tìm được bạn chơi Pickleball cùng trình độ chỉ trong vòng 10 phút. Giao diện cực kỳ mượt và dễ thao tác trên điện thoại!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Trần Thảo Linh',
    gender: 'female',
    userRole: 'Cầu lông Hải Châu • Trình độ B',
    rating: 4,
    comment: 'Tìm bạn đánh đôi cầu lông rất tiện lợi. Đăng kèo nhanh, đối thủ lịch sự, mong app bổ sung thêm tính năng lưu video highlight trận đấu.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Lê Hoàng Phúc',
    gender: 'male',
    userRole: 'Ban tổ chức Giải Cầu lông Đà Nẵng Open',
    rating: 5,
    comment: 'Hệ thống quản lý giải đấu và danh sách VĐV đăng ký rất chuyên nghiệp. Tiết kiệm hơn 70% thời gian tổng hợp lịch thi đấu cầu lông cho ban tổ chức.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đặng Minh Quân',
    gender: 'male',
    userRole: 'Pickleball Ngũ Hành Sơn • Trình độ 3.0',
    rating: 4,
    comment: 'Rất ấn tượng với tính năng định vị cụm sân Pickleball gần nhất. Giá thuê minh bạch, mong app liên kết thêm nhiều cụm sân ven biển.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Phạm Quỳnh Như',
    gender: 'female',
    userRole: 'Người chơi Pickleball mới bắt đầu',
    rating: 5,
    comment: 'Là người mới tập chơi Pickleball, mình rất ngại tìm hội chơi. Nhờ bộ lọc trình độ Beginner của CourtMate, mình đã tìm được nhóm đánh đôi rất thân thiện.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Huỳnh Văn Sơn',
    gender: 'male',
    userRole: 'Đội trưởng CLB Cầu lông Cẩm Lệ',
    rating: 4,
    comment: 'Tìm đối thủ giao lưu cầu lông nhanh chóng. Đề xuất app cho phép xem thêm lịch sử đối đầu giữa 2 bên trước khi bấm nhận kèo.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Võ Thị Mai Phương',
    gender: 'female',
    userRole: 'CLB Cầu lông Bách Khoa Đà Nẵng',
    rating: 4,
    comment: 'Thiết kế giao diện đẹp mắt, tone màu xanh rất thể thao. Dùng một tay rất tiện, mong sắp tới có thêm giao diện Dark Mode.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Bùi Gia Huy',
    gender: 'male',
    userRole: 'VĐV Cầu lông phong trào Liên Chiểu',
    rating: 5,
    comment: 'Tham gia giải đấu cầu lông qua CourtMate nhận được thông báo lịch thi đấu và nhánh đấu realtime qua điện thoại, không sợ bị lỡ trận.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đỗ Trọng Nghĩa',
    gender: 'male',
    userRole: 'Pickleball Hải Châu • DUPR 4.0',
    rating: 3,
    comment: 'Ghép kèo khá nhanh nhưng đôi khi gặp người hẹn xong đến muộn 15 phút làm trôi giờ thuê sân. Mong CourtMate có chế độ phạt điểm uy tín nghiêm khắc hơn.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Ngô Thanh Trúc',
    gender: 'female',
    userRole: 'Cầu lông Thanh Khê • Trình độ C',
    rating: 4,
    comment: 'Trải nghiệm web rất mượt mà. Đặt sân cầu lông nhanh, thỉnh thoảng thông báo nhắc lịch đẩy hơi chậm 1-2 phút so với giờ hẹn.',
    category: 'Trải nghiệm & Giao diện'
  },

  // --- 11 to 20 ---
  {
    userName: 'Dương Quốc Bảo',
    gender: 'male',
    userRole: 'CLB Pickleball Hòa Xuân',
    rating: 5,
    comment: 'Kèo Pickleball cuối tuần lúc nào cũng kín sân nhờ CourtMate kết nối. Giúp hội mình mở rộng thêm nhiều bạn bè cùng sở thích vung vợt.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Lý Minh Tuấn',
    gender: 'male',
    userRole: 'Quản lý cụm sân Cầu lông Tuyên Sơn',
    rating: 4,
    comment: 'Hệ thống giúp tối ưu hóa công suất lấp đầy các khung giờ. Mong có thêm chức năng xuất báo cáo doanh thu chi tiết theo tháng.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Trịnh Khánh Vy',
    gender: 'female',
    userRole: 'Cầu lông Sơn Trà • Người chơi phong trào',
    rating: 4,
    comment: 'Giao diện thân thiện và cộng đồng năng động. Nếu app bổ sung thêm tính năng chia sẻ tỷ số lên mạng xã hội thì quá đỉnh.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Hồ Đức Thắng',
    gender: 'male',
    userRole: 'Pickleball An Hải Bắc • Trình độ 3.5',
    rating: 5,
    comment: 'Kèo Pickleball buổi tối thiếu tay vợt đánh đôi lên CourtMate gọi một tiếng là có người nhận kèo liền. Ứng dụng quá đỉnh!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Phan Ngọc Hà',
    gender: 'female',
    userRole: 'Pickleball Cẩm Lệ • Trình độ 3.0',
    rating: 4,
    comment: 'Tìm được partner đánh đôi ăn ý để chuẩn bị tham gia giải. Góp ý nhỏ là nên thêm bộ lọc theo từng quận chi tiết hơn ở Đà Nẵng.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Vũ Công Thành',
    gender: 'male',
    userRole: 'Cầu lông Hòa Khánh • Trình độ B+',
    rating: 4,
    comment: 'Xem lịch thi đấu giải cầu lông rất trực quan. Nếu ban tổ chức hỗ trợ xuất file kết quả nhánh đấu ra PDF thì thuận tiện hơn.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đinh Thị Lan Hương',
    gender: 'female',
    userRole: 'Cầu lông Ngũ Hành Sơn • Trình độ B',
    rating: 5,
    comment: 'Sân cầu lông hiển thị đầy đủ hình ảnh, chất lượng mặt thảm, giá thuê và số điện thoại liên hệ trực tiếp. Rất tiện lợi!',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Mai Văn Tùng',
    gender: 'male',
    userRole: 'Pickleball Bãi Biển Mỹ Khê',
    rating: 3,
    comment: 'Ý tưởng Grab thể thao rất hay. Nhưng các cụm sân trung tâm tối thứ 6 kín lịch rất sớm, app nên có chế độ báo chuông khi có ai hủy slot.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Lê Kiều Oanh',
    gender: 'female',
    userRole: 'CLB Cầu lông Cung Thể thao Tiên Sơn',
    rating: 5,
    comment: 'Tốc độ phản hồi cực nhanh, giao diện màu sắc thể thao dễ chịu. Đặt sân cầu lông nhanh chóng chỉ trong vài thao tác chạm.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Nguyễn Đăng Khoa',
    gender: 'male',
    userRole: 'Ban tổ chức Pickleball Danang Championship',
    rating: 5,
    comment: 'Hệ thống xác thực VĐV và thu lệ phí giải đấu Pickleball qua mã QR PayOS rất mượt mà. Giúp ban tổ chức đối soát tức thì.',
    category: 'Giải đấu thể thao'
  },

  // --- 21 to 30 ---
  {
    userName: 'Phạm Thùy Linh',
    gender: 'female',
    userRole: 'Cầu lông Ngũ Hành Sơn • Trình độ C',
    rating: 4,
    comment: 'Thao tác thanh toán mã VietQR qua PayOS diễn ra tức thì. Mong app mở rộng thêm đối tác sân cầu lông ở mạn Hòa Nhơn và Hòa Vang.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Trần Bảo Ngọc',
    gender: 'female',
    userRole: 'Pickleball Sơn Trà • Trình độ 2.5',
    rating: 4,
    comment: 'Nhờ CourtMate mà mình duy trì được 3 buổi đánh Pickleball mỗi tuần. Mong app có thêm video hướng dẫn kỹ thuật dink bóng cơ bản.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Lê Tuấn Kiên',
    gender: 'male',
    userRole: 'Cầu lông Hải Châu • Trình độ A',
    rating: 5,
    comment: 'Tìm được bạn tập cầu lông cùng giờ trống ban sáng rất nhanh. Trình độ tương đồng nên đánh rất đã tay!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Hoàng Mỹ Duyên',
    gender: 'female',
    userRole: 'Cầu lông Thanh Khê • Hội phụ nữ',
    rating: 4,
    comment: 'Hội mình hay đánh cầu lông buổi sáng, lên app hẹn giờ rất tiện. Đôi lúc giờ cao điểm load danh sách sân hơi chậm một chút.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Đỗ Minh Trí',
    gender: 'male',
    userRole: 'Pickleball Cẩm Lệ • DUPR 3.5',
    rating: 5,
    comment: 'Đã giao lưu với hơn 10 nhóm Pickleball khác nhau qua app, mọi người đều nhiệt tình và fair-play. Hệ thống ghép kèo chuẩn xác.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Vũ Thị Hồng Nhung',
    gender: 'female',
    userRole: 'Pickleball Ngũ Hành Sơn • Trình độ 3.5',
    rating: 3,
    comment: 'Cộng đồng đông đảo nhưng mong ban quản trị kiểm duyệt kỹ hơn trình độ DUPR tự khai báo để tránh bị chênh lệch khi thi đấu.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Huỳnh Gia Bảo',
    gender: 'male',
    userRole: 'Cầu lông Liên Chiểu • Sinh viên Bách Khoa',
    rating: 4,
    comment: 'Rất phù hợp với sinh viên khi tìm sân giá tốt và tìm đối thủ giao lưu. Mong có thêm tính năng chia đều tiền sân tự động.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Đỗ Ngọc Hân',
    gender: 'female',
    userRole: 'Pickleball Cẩm Lệ • Trình độ 2.5',
    rating: 4,
    comment: 'Tìm đối tác đánh giải nhanh chóng. App vận hành ổn định, nếu có thêm gợi ý chế độ khởi động cho vđv mới thì rất tốt.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Bùi Thị Thanh Tâm',
    gender: 'female',
    userRole: 'Cầu lông Cẩm Lệ • Trình độ phong trào',
    rating: 5,
    comment: 'Tìm kiếm sân cầu lông theo cự ly gần nhà rất thông minh. Mình chỉ cần chọn bán kính 3km là ra ngay các sân đang còn slot trống.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Phan Tuấn Hùng',
    gender: 'male',
    userRole: 'Ban tổ chức Giải Cầu lông Doanh nghiệp 2026',
    rating: 5,
    comment: 'Các tính năng thông báo vòng đấu và cập nhật tỉ số trực tiếp hoạt động trơn tru. Giải cầu lông thành công rực rỡ nhờ CourtMate.',
    category: 'Giải đấu thể thao'
  },

  // --- 31 to 40 ---
  {
    userName: 'Trần Văn Thịnh',
    gender: 'male',
    userRole: 'Pickleball Sơn Trà • Trình độ 4.0',
    rating: 3,
    comment: 'Ghép kèo DUPR ổn nhưng một số sân hiển thị giá cơ bản chưa gồm phụ phí tiền đèn ban đêm, mong hiển thị minh bạch hơn.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Lê Thị Thu Thảo',
    gender: 'female',
    userRole: 'Cầu lông Hải Châu • Trình độ A',
    rating: 5,
    comment: 'Tốc độ load nhanh và mượt mà. Tìm đối thủ cầu lông đánh đơn trình độ cao chỉ mất 5 phút, chất lượng tuyệt vời.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Nguyễn Quang Vinh',
    gender: 'male',
    userRole: 'Pickleball Sơn Trà • Trình độ 4.0',
    rating: 3,
    comment: 'Tính năng tìm sân nhanh. Tuy nhiên mạng 4G giờ cao điểm tải trang hơi chậm một chút, đội ngũ nên tối ưu thêm.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Dương Thị Yến Nhi',
    gender: 'female',
    userRole: 'Pickleball Thanh Khê • Người mới chơi',
    rating: 5,
    comment: 'Được các anh chị trong cộng đồng Pickleball CourtMate hướng dẫn luật dink bóng rất tận tình. Môi trường thể thao cực kỳ tích cực!',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Phạm Đức Anh',
    gender: 'male',
    userRole: 'CLB Cầu lông Sinh viên Liên Chiểu',
    rating: 4,
    comment: 'Đội mình thiếu người mở app quét quanh Hòa Khánh là có bạn nhận kèo. Thỉnh thoảng thông báo đẩy hơi trễ 1 phút.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Võ Minh Khôi',
    gender: 'male',
    userRole: 'Cầu lông Cẩm Lệ • Trình độ B',
    rating: 5,
    comment: 'Đăng ký tham gia giải cầu lông trên web chỉ mất 1 phút điền thông tin và quét mã thanh toán. Không phải nộp hồ sơ giấy phức tạp.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Lâm Quỳnh Giao',
    gender: 'female',
    userRole: 'Pickleball Ngũ Hành Sơn • Trình độ 3.0',
    rating: 4,
    comment: 'Thích nhất là chế độ xem lịch trình cá nhân. Nếu có thêm tính năng mời bạn bè trực tiếp qua danh bạ thì quá tiện.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Đoàn Thế Kiệt',
    gender: 'male',
    userRole: 'Pickleball Hải Châu • Trình độ 3.5',
    rating: 4,
    comment: 'Đối thủ Pickleball ghép trên app rất lịch sự. Giá như có thêm tính năng chia sẻ kết quả trực tiếp lên mạng xã hội.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Nguyễn Thị Kim Chi',
    gender: 'female',
    userRole: 'Cầu lông Sơn Trà • Trình độ C',
    rating: 5,
    comment: 'Mỗi lần tập cầu lông cùng bạn bè xong ai cũng khen web đẹp và chuyên nghiệp. Thao tác đặt sân và tìm đối thủ cực nhanh.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Trần Hữu Phước',
    gender: 'male',
    userRole: 'Chủ sân Cầu lông Hữu Nghị',
    rating: 3,
    comment: 'Nền tảng quản lý đặt sân tốt. Tuy nhiên cần thêm cơ chế xử lý khi khách hủy sát giờ để đảm bảo quyền lợi cho chủ sân.',
    category: 'Đặt sân & CLB'
  },

  // --- 41 to 50 ---
  {
    userName: 'Hà Thị Bích Ngọc',
    gender: 'female',
    userRole: 'Pickleball Hòa Cường Nam',
    rating: 4,
    comment: 'Tìm được các cặp gia đình khác giao lưu cuối tuần rất vui. Hy vọng app bổ sung thêm thông tin bãi đỗ xe ô tô cho cụm sân.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Vương Đình Trọng',
    gender: 'male',
    userRole: 'Pickleball Tuyên Sơn • DUPR 4.5',
    rating: 5,
    comment: 'Rất ưng ý tính năng lọc theo trình độ DUPR. Không còn cảnh đánh 1 trận mà chênh lệch quá lớn làm mất đi tính cọ xát.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Lý Thùy Dung',
    gender: 'female',
    userRole: 'Cầu lông Cẩm Lệ • Trình độ phong trào',
    rating: 4,
    comment: 'Giao diện thân thiện, dễ đặt sân. Mong app sớm tích hợp chương trình tích điểm đổi voucher thuê sân hoặc quả cầu lông.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Hoàng Khánh Ly',
    gender: 'female',
    userRole: 'Cầu lông Phước Mỹ Sơn Trà',
    rating: 3,
    comment: 'Tìm sân có thảm BWF vào mùa cao điểm khá ổn. Dù vậy thông tin giá thuê vào khung giờ vàng cần được cập nhật đồng bộ hơn.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Tạ Minh Nhật',
    gender: 'male',
    userRole: 'Pickleball Thanh Khê • Trình độ 3.5',
    rating: 5,
    comment: 'Đăng ký giải Pickleball mùa hè được xác nhận ngay lập tức qua email và tin nhắn. Hệ thống vận hành rất mượt mà.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đinh Phương Thảo',
    gender: 'female',
    userRole: 'Cầu lông Hải Châu • Trình độ B+',
    rating: 4,
    comment: 'CourtMate như Grab dành cho Cầu lông & Pickleball vậy! Sẽ hoàn hảo hơn nếu có thêm phòng chat bằng giọng nói khi đang di chuyển.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Nguyễn Diệu Linh',
    gender: 'female',
    userRole: 'Pickleball An Hải Bắc',
    rating: 3,
    comment: 'Sân bãi đạt chuẩn, cộng đồng đông vui. Nhưng đôi khi hệ thống thanh toán phản hồi hơi chậm vào tối thứ 7, cần cải thiện tốc độ.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Nguyễn Thị Hải Yến',
    gender: 'female',
    userRole: 'Cầu lông Hòa Xuân • Trình độ B',
    rating: 5,
    comment: 'Các bài viết hướng dẫn kỹ thuật đập cầu và tin tức giải đấu cập nhật rất kịp thời. Vừa rèn luyện vừa học hỏi thêm kinh nghiệm.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Phan Văn Quý',
    gender: 'male',
    userRole: 'Cầu lông Liên Chiểu • Cựu sinh viên Bách Khoa',
    rating: 4,
    comment: 'Tổ chức mini tournament cầu lông cho nhóm bạn trên app rất tiện, tự chia bảng. Mong hỗ trợ thêm hình thức thi đấu vòng tròn tính điểm.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Lê Thảo Trang',
    gender: 'female',
    userRole: 'Người chơi Cầu lông mới bắt đầu',
    rating: 4,
    comment: 'Lần đầu tìm bạn chơi cầu lông qua app mà gặp chị partner rất nhiệt tình. Nếu app có thêm mục gợi ý video bài tập cơ bản thì tuyệt.',
    category: 'Cộng đồng thể thao'
  }
];

export function getFallbackFeedbacks(): PlatformFeedback[] {
  const result: PlatformFeedback[] = [];
  const now = new Date();

  let maleAvatarIndex = 0;
  let femaleAvatarIndex = 0;

  for (let i = 0; i < FEEDBACK_ITEMS.length; i++) {
    const item = FEEDBACK_ITEMS[i];

    let userAvatar: string;
    if (item.gender === 'female') {
      userAvatar = FEMALE_AVATARS[femaleAvatarIndex % FEMALE_AVATARS.length];
      femaleAvatarIndex++;
    } else {
      userAvatar = MALE_AVATARS[maleAvatarIndex % MALE_AVATARS.length];
      maleAvatarIndex++;
    }

    const hoursAgo = Math.floor(i * 9 + 2);
    const date = new Date(now.getTime() - hoursAgo * 3600 * 1000);

    result.push({
      _id: `mock-feedback-${i + 1}`,
      id: `mock-feedback-${i + 1}`,
      userName: item.userName,
      userRole: item.userRole,
      userAvatar,
      rating: item.rating,
      comment: item.comment,
      category: item.category,
      isVerified: true,
      createdAt: date.toISOString(),
    });
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
