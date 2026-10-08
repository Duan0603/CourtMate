import { PlatformFeedback } from '@courtmate/shared';

// Reusable avatar list
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
];

// 50 templates focused 100% on Cầu Lông (Badminton) & Pickleball
const BASE_REVIEWS = [
  {
    userName: 'Nguyễn Thành Long',
    userRole: 'Pickleball Sơn Trà • DUPR 3.5',
    comment: 'CourtMate giúp mình tìm được bạn chơi Pickleball cùng trình độ chỉ trong vòng 10 phút. Giao diện cực kỳ mượt và dễ thao tác trên điện thoại!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Trần Thảo Linh',
    userRole: 'Cầu lông Hải Châu • Trình độ B',
    comment: 'Trước đây mỗi lần thiếu người đánh đôi là phải nhắn từng nhóm Facebook. Từ ngày có CourtMate, đăng kèo cầu lông 1 cái là đủ người ngay, 5 sao chất lượng!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Lê Hoàng Phúc',
    userRole: 'Ban tổ chức Giải Cầu lông Đà Nẵng Open',
    comment: 'Hệ thống quản lý giải đấu và danh sách VĐV đăng ký rất chuyên nghiệp. Tiết kiệm hơn 70% thời gian tổng hợp lịch thi đấu cầu lông cho ban tổ chức.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đặng Minh Quân',
    userRole: 'Pickleball Ngũ Hành Sơn • Trình độ 3.0',
    comment: 'Rất ấn tượng với tính năng định vị cụm sân Pickleball gần nhất tại Đà Nẵng. Thông tin giờ trống và giá thuê sân minh bạch rõ ràng.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Phạm Quỳnh Như',
    userRole: 'Người chơi Pickleball mới bắt đầu',
    comment: 'Là người mới tập chơi Pickleball, mình rất ngại tìm hội chơi. Nhờ bộ lọc trình độ Beginner của CourtMate, mình đã tìm được nhóm đánh đôi rất thân thiện.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Huỳnh Văn Sơn',
    userRole: 'Đội trưởng CLB Cầu lông Cẩm Lệ',
    comment: 'Tìm đối thủ giao lưu cầu lông đánh đơn và đánh đôi siêu nhanh. Đánh giá uy tín sau trận đấu rất chuẩn, ai cũng đúng giờ.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Võ Thị Mai Phương',
    userRole: 'CLB Cầu lông Bách Khoa Đà Nẵng',
    comment: 'Thiết kế giao diện đẹp mắt, tone màu xanh rất thể thao. Sử dụng một tay rất tiện lợi khi đang ở sân cầu lông tập luyện.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Bùi Gia Huy',
    userRole: 'VĐV Cầu lông phong trào Liên Chiểu',
    comment: 'Tham gia giải đấu cầu lông qua CourtMate nhận được thông báo lịch thi đấu và nhánh đấu realtime qua điện thoại, không sợ bị lỡ trận.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đỗ Trọng Nghĩa',
    userRole: 'Pickleball Hải Châu • DUPR 4.0',
    comment: 'Cộng đồng Pickleball trên này rất văn minh, ghép kèo đúng trình độ và cam kết cao. Rất đáng giới thiệu cho anh em đam mê!',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Ngô Thanh Trúc',
    userRole: 'Cầu lông Thanh Khê • Trình độ C',
    comment: 'Trải nghiệm web cực kỳ nhanh, không bị lag. Đặt sân cầu lông thảm tiêu chuẩn và ghép kèo thanh toán an toàn, cho 5 sao!',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Dương Quốc Bảo',
    userRole: 'CLB Pickleball Hòa Xuân',
    comment: 'Kèo Pickleball cuối tuần lúc nào cũng kín sân nhờ CourtMate kết nối. Giúp hội mình mở rộng thêm nhiều bạn bè cùng sở thích vung vợt.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Lý Minh Tuấn',
    userRole: 'Quản lý cụm sân Cầu lông Tuyên Sơn',
    comment: 'Nền tảng giúp cụm sân cầu lông tối ưu hóa công suất lấp đầy các khung giờ vàng và giờ thấp điểm. Khách đặt sân qua app đều rất hài lòng.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Trịnh Khánh Vy',
    userRole: 'Cầu lông Sơn Trà • Người chơi phong trào',
    comment: 'Thích nhất là tính năng bong bóng feedback này, cảm giác đội ngũ phát triển rất lắng nghe người chơi cầu lông và pickleball.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Hồ Đức Thắng',
    userRole: 'Pickleball An Hải Bắc • Trình độ 3.5',
    comment: 'Kèo Pickleball buổi tối thiếu tay vợt đánh đôi lên CourtMate gọi một tiếng là có người nhận kèo liền. Ứng dụng quá đỉnh!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Phan Ngọc Hà',
    userRole: 'Pickleball Cẩm Lệ • Trình độ 3.0',
    comment: 'Mình tìm được partner đánh đôi ăn ý để chuẩn bị tham gia giải Pickleball Đà Nẵng tháng tới. Cảm ơn CourtMate rất nhiều!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Vũ Công Thành',
    userRole: 'Cầu lông Hòa Khánh • Trình độ B+',
    comment: 'Xem lịch thi đấu giải cầu lông rất trực quan. Không cần phải lên bảng tin giấy như trước nữa, mở điện thoại là thấy kết quả từng set.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đinh Thị Lan Hương',
    userRole: 'Cầu lông Ngũ Hành Sơn • Trình độ B',
    comment: 'Sân cầu lông hiển thị đầy đủ hình ảnh, chất lượng mặt thảm, giá thuê và số điện thoại liên hệ trực tiếp. Rất tiện lợi!',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Mai Văn Tùng',
    userRole: 'Pickleball Bãi Biển Mỹ Khê',
    comment: 'Mùa du lịch vào Đà Nẵng công tác vẫn tìm được bạn chơi Pickleball gần khách sạn. Quá tiện lợi cho ai hay di chuyển!',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Lê Kiều Oanh',
    userRole: 'CLB Cầu lông Cung Thể thao Tiên Sơn',
    comment: 'Tốc độ phản hồi cực nhanh, giao diện màu sắc thể thao dễ chịu. Đặt sân cầu lông nhanh chóng chỉ trong vài thao tác chạm.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Nguyễn Đăng Khoa',
    userRole: 'Ban tổ chức Pickleball Danang Championship',
    comment: 'Hệ thống xác thực VĐV và thu lệ phí giải đấu Pickleball qua mã QR PayOS rất mượt mà. Giúp ban tổ chức đối soát tức thì.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Phạm Hữu Đạt',
    userRole: 'Cầu lông Hòa Vang • Trình độ C',
    comment: 'Khu vực ngoại ô như Hòa Vang mà vẫn tìm được kèo giao lưu cầu lông đông vui. Kết nối cộng đồng thể thao rất hiệu quả.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Trần Bảo Ngọc',
    userRole: 'Pickleball Sơn Trà • Trình độ 2.5',
    comment: 'Nhờ CourtMate mà mỗi tuần mình đều duy trì được 3 buổi đánh Pickleball đều đặn, phản xạ và thể lực cải thiện rõ rệt.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Lê Tuấn Kiên',
    userRole: 'Cầu lông Hải Châu • Trình độ A',
    comment: 'Tìm được bạn tập cầu lông cùng giờ trống ban sáng rất nhanh. Trình độ tương đồng nên đánh rất đã tay!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Hoàng Mỹ Duyên',
    userRole: 'Cầu lông Thanh Khê • Hội phụ nữ',
    comment: 'Hội mình hay đánh cầu lông buổi sáng, lên app hẹn giờ và chốt sân cực kỳ nhẹ nhàng, không sợ bị trùng lịch với hội khác.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Đỗ Minh Trí',
    userRole: 'Pickleball Cẩm Lệ • DUPR 3.5',
    comment: 'Đã giao lưu với hơn 10 nhóm Pickleball khác nhau qua app, mọi người đều nhiệt tình và fair-play. Hệ thống ghép kèo chuẩn xác.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Vũ Thị Hồng Nhung',
    userRole: 'Pickleball Ngũ Hành Sơn • Trình độ 3.5',
    comment: 'Một siêu ứng dụng cho người chơi Pickleball & Cầu lông! Đầy đủ mọi thông tin giải đấu và các cụm sân hot nhất Đà Nẵng.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Huỳnh Gia Bảo',
    userRole: 'Cầu lông Liên Chiểu • Sinh viên Bách Khoa',
    comment: 'Rất phù hợp với sinh viên tụi mình khi tìm sân cầu lông giá tốt và tìm đối thủ giao lưu cuối tuần. Ủng hộ ứng dụng hết mình!',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Tô Văn Hải',
    userRole: 'Chủ sân Pickleball Green Club Hải Châu',
    comment: 'Khách đến thuê sân Pickleball qua ứng dụng CourtMate tăng lên thấy rõ. Rất khuyến khích các chủ sân tham gia hệ thống.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Bùi Thị Thanh Tâm',
    userRole: 'Cầu lông Cẩm Lệ • Trình độ phong trào',
    comment: 'Tìm kiếm sân cầu lông theo cự ly gần nhà rất thông minh. Mình chỉ cần chọn bán kính 3km là ra ngay các sân đang còn slot trống.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Phan Tuấn Hùng',
    userRole: 'Ban tổ chức Giải Cầu lông Doanh nghiệp 2026',
    comment: 'Các tính năng thông báo vòng đấu và cập nhật tỉ số trực tiếp hoạt động trơn tru. Giải cầu lông thành công rực rỡ nhờ CourtMate.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Trần Văn Thịnh',
    userRole: 'Pickleball Sơn Trà • Trình độ 4.0',
    comment: 'Hệ thống ghép trận tự động đánh giá chỉ số DUPR rất chuẩn, hai bên đánh đôi kịch tính ngang ngửa, không bị chênh lệch trình độ.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Lê Thị Thu Thảo',
    userRole: 'Cầu lông Hải Châu • Trình độ A',
    comment: 'Đánh giá 5 sao cho tốc độ load và sự mượt mà của web. Tìm đối thủ cầu lông đánh đơn trình độ cao chỉ mất 5 phút.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Nguyễn Quang Vinh',
    userRole: 'Pickleball Sơn Trà • Trình độ 4.0',
    comment: 'Không còn cảnh gọi điện thoại hỏi từng sân Pickleball lúc 6 giờ chiều. Xem trạng thái sân trên bản đồ là biết ngay nơi nào sẵn sàng.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Dương Thị Yến Nhi',
    userRole: 'Pickleball Thanh Khê • Người mới chơi',
    comment: 'Được các anh chị trong cộng đồng Pickleball CourtMate hướng dẫn luật dink bóng rất tận tình. Môi trường thể thao cực kỳ tích cực!',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Phạm Đức Anh',
    userRole: 'CLB Cầu lông Sinh viên Liên Chiểu',
    comment: 'Đội mình thiếu người đánh cầu lông đôi nam là mở app quét 1 vòng quanh khu vực Hòa Khánh là có tay vợt tham gia ngay.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Võ Minh Khôi',
    userRole: 'Cầu lông Cẩm Lệ • Trình độ B',
    comment: 'Đăng ký tham gia giải cầu lông trên web chỉ mất 1 phút điền thông tin và quét mã thanh toán. Không phải nộp hồ sơ giấy phức tạp.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Lâm Quỳnh Giao',
    userRole: 'Pickleball Ngũ Hành Sơn • Trình độ 3.0',
    comment: 'Thích nhất là chế độ xem lịch trình cá nhân. Các trận đấu Pickleball sắp diễn ra đều được gửi thông báo nhắc nhở kịp thời.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Đoàn Thế Kiệt',
    userRole: 'Pickleball Hải Châu • Trình độ 3.5',
    comment: 'Đối thủ Pickleball ghép trên app rất lịch sự, đánh xong còn rủ nhau giao lưu trà chanh bàn chiến thuật. Cộng đồng quá tuyệt vời.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Nguyễn Thị Kim Chi',
    userRole: 'Cầu lông Sơn Trà • Trình độ C',
    comment: 'Mỗi lần tập cầu lông cùng bạn bè xong ai cũng khen web đẹp và chuyên nghiệp. Thao tác đặt sân và tìm đối thủ cực nhanh.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Trần Hữu Phước',
    userRole: 'Chủ sân Cầu lông Hữu Nghị',
    comment: 'Nền tảng quản lý lịch đặt sân cầu lông rất minh bạch, hạn chế tối đa việc khách đặt rồi hủy hoặc nhầm lịch giữa các ca.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Hà Thị Bích Ngọc',
    userRole: 'Pickleball Hòa Cường Nam',
    comment: 'Mình và ông xã tập chơi đôi nam nữ Pickleball, tìm được các cặp gia đình khác giao lưu cuối tuần vui vẻ và khỏe khoắn.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Vương Đình Trọng',
    userRole: 'Pickleball Tuyên Sơn • DUPR 4.5',
    comment: 'Rất ưng ý tính năng lọc theo trình độ DUPR. Không còn cảnh đánh 1 trận mà chênh lệch quá lớn làm mất đi tính cọ xát.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Lý Thùy Dung',
    userRole: 'Cầu lông Cẩm Lệ • Trình độ phong trào',
    comment: 'Giao diện thân thiện, người lớn tuổi hay người mới dùng smartphone đều dễ dàng thao tác đặt sân cầu lông và tìm bạn bè.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Chu Văn Hùng',
    userRole: 'Cầu lông Phước Mỹ Sơn Trà',
    comment: 'Tìm sân cầu lông có thảm BWF vào mùa cao điểm chưa bao giờ dễ dàng như thế này. Đặt cọc an toàn, giữ sân chuẩn xác.',
    category: 'Đặt sân & CLB'
  },
  {
    userName: 'Tạ Minh Nhật',
    userRole: 'Pickleball Thanh Khê • Trình độ 3.5',
    comment: 'Đăng ký giải Pickleball mùa hè được xác nhận ngay lập tức qua email và tin nhắn. Hệ thống vận hành rất mượt mà.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Đinh Phương Thảo',
    userRole: 'Cầu lông Hải Châu • Trình độ B+',
    comment: 'CourtMate như Grab dành cho Cầu lông & Pickleball vậy! Muốn chơi là có bạn chơi cùng, ở đâu cũng có sân sẵn sàng.',
    category: 'Ghép trận on-demand'
  },
  {
    userName: 'Trương Quốc Huy',
    userRole: 'Pickleball An Hải Bắc',
    comment: 'Sân bãi Pickleball đạt chuẩn, cộng đồng tương tác sôi nổi. Rất hài lòng với dịch vụ và sự hỗ trợ nhiệt tình của đội ngũ.',
    category: 'Cộng đồng thể thao'
  },
  {
    userName: 'Nguyễn Thị Hải Yến',
    userRole: 'Cầu lông Hòa Xuân • Trình độ B',
    comment: 'Các bài viết hướng dẫn kỹ thuật đập cầu và tin tức giải đấu cập nhật rất kịp thời. Vừa rèn luyện vừa học hỏi thêm kinh nghiệm.',
    category: 'Trải nghiệm & Giao diện'
  },
  {
    userName: 'Phan Văn Quý',
    userRole: 'Cầu lông Liên Chiểu • Cựu sinh viên Bách Khoa',
    comment: 'Tổ chức mini tournament cầu lông cho nhóm bạn cũ trên app rất tiện, tự chia bảng và tính điểm tự động không lo sai sót.',
    category: 'Giải đấu thể thao'
  },
  {
    userName: 'Lê Minh Khang',
    userRole: 'Pickleball Cẩm Lệ • Trình độ 3.0',
    comment: 'Tuyệt vời! Hệ thống tìm sân Pickleball theo khu vực giúp mình tiết kiệm rất nhiều thời gian di chuyển sau giờ làm việc.',
    category: 'Đặt sân & CLB'
  }
];

export function getFallbackFeedbacks(): PlatformFeedback[] {
  const result: PlatformFeedback[] = [];
  const baseCount = BASE_REVIEWS.length;
  const now = new Date();

  for (let i = 0; i < 100; i++) {
    const template = BASE_REVIEWS[i % baseCount];
    const avatar = AVATARS[i % AVATARS.length];
    const hoursAgo = Math.floor(i * 9 + 2);
    const date = new Date(now.getTime() - hoursAgo * 3600 * 1000);

    let userName = template.userName;
    let comment = template.comment;
    let userRole = template.userRole;

    if (i >= baseCount) {
      const firstNames = ['Hoàng', 'Khánh', 'Minh', 'Đức', 'Phương', 'Bích', 'Thu', 'Thành', 'Tuấn', 'Thảo', 'Trang', 'Hùng', 'Bảo', 'Vy', 'Linh'];
      const lastNames = ['Võ', 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Đặng', 'Huỳnh', 'Bùi', 'Hồ', 'Đỗ'];
      userName = `${lastNames[i % lastNames.length]} ${firstNames[(i + 3) % firstNames.length]}`;
      const extras = [
        'Trải nghiệm chơi Cầu lông và Pickleball cùng CourtMate quá tuyệt!',
        'Sẽ tiếp tục gắn bó để tìm kèo đánh đôi và đặt sân mỗi tuần.',
        'Đã rủ cả hội bạn Cầu lông & Pickleball cùng tham gia ứng dụng.',
        'Hệ thống ghép trận và đặt sân vượt ngoài mong đợi, đánh giá 5 sao!',
        'Cộng đồng người chơi nhiệt tình và chuyên nghiệp số 1 Đà Nẵng.'
      ];
      comment = `${template.comment} ${extras[i % extras.length]}`;
    }

    result.push({
      _id: `mock-feedback-${i + 1}`,
      id: `mock-feedback-${i + 1}`,
      userName,
      userRole,
      userAvatar: avatar,
      rating: 5,
      comment,
      category: template.category,
      isVerified: true,
      createdAt: date.toISOString(),
    });
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
