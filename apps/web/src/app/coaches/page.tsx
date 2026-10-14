'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SportType } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { GuestActionModal } from '../../components/shared/GuestActionModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_COACHES = [
  {
    id: 'coach-1',
    fullName: 'Nguyễn Minh Trí',
    headline: 'HLV Cầu lông Quốc gia • Cựu VĐV SEA Games',
    bio: 'Hơn 12 năm huấn luyện từ cơ bản đến nâng cao. Từng đào tạo nhiều VĐV đạt giải cấp tỉnh và quốc gia. Phương pháp giảng dạy khoa học, phù hợp mọi lứa tuổi.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Minh+Tri&background=1E5AA8&color=fff&size=128&bold=true',
    sports: [SportType.BADMINTON],
    experienceYears: 12,
    hourlyRate: 350000,
    rating: 4.9,
    reviewCount: 87,
    city: 'Đà Nẵng',
    districts: ['Hải Châu', 'Thanh Khê'],
    preferredCourts: ['Nhà thi đấu Tiên Sơn', 'Sân cầu lông Hải Châu'],
    reviews: [
      { author: 'Trần Văn A', rating: 5, comment: 'Thầy dạy rất tận tâm, kỹ thuật cải thiện rõ sau 1 tháng!' },
      { author: 'Lê Thị B', rating: 5, comment: 'HLV chuyên nghiệp, lịch học linh hoạt, rất hài lòng.' },
      { author: 'Phạm Quốc C', rating: 4, comment: 'Bài tập sát thực tế, phong cách giảng dạy dễ hiểu.' },
    ],
  },
  {
    id: 'coach-2',
    fullName: 'Lê Thành Công',
    headline: 'Chuyên gia Pickleball • Nhà vô địch giải mở rộng Miền Trung 2024',
    bio: 'Người tiên phong phổ biến Pickleball tại Đà Nẵng từ 2021. Lớp học từ 1-1 đến nhóm 6 người, cam kết kỹ thuật nền vững sau 8 buổi đầu tiên.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Le+Thanh+Cong&background=0D9488&color=fff&size=128&bold=true',
    sports: [SportType.PICKLEBALL],
    experienceYears: 5,
    hourlyRate: 280000,
    rating: 4.8,
    reviewCount: 54,
    city: 'Đà Nẵng',
    districts: ['Ngũ Hành Sơn', 'Sơn Trà'],
    preferredCourts: ['Sân Pickleball The Arena', 'Sân TNR Đà Nẵng'],
    reviews: [
      { author: 'Hoàng Anh D', rating: 5, comment: 'Chưa biết gì về Pickleball, sau 4 buổi đã chơi được. Thầy giỏi thật!' },
      { author: 'Nguyễn Thị E', rating: 5, comment: 'Rất kiên nhẫn, giải thích kỹ từng động tác. Đáng tiền lắm.' },
      { author: 'Đỗ Minh F', rating: 4, comment: 'Sân sạch, thầy đúng giờ, lịch linh hoạt theo yêu cầu.' },
    ],
  },
  {
    id: 'coach-3',
    fullName: 'Phan Thị Hương',
    headline: 'HLV Cầu lông & Pickleball • Chứng chỉ BWF Level 2',
    bio: 'Chuyên đào tạo cho trẻ em (6-15 tuổi) và người lớn tuổi mới bắt đầu. Giáo án từng bước theo năng lực cá nhân, lớp học nhỏ tối đa 4 học viên.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Phan+Thi+Huong&background=7C3AED&color=fff&size=128&bold=true',
    sports: [SportType.BADMINTON, SportType.PICKLEBALL],
    experienceYears: 8,
    hourlyRate: 300000,
    rating: 4.9,
    reviewCount: 63,
    city: 'Đà Nẵng',
    districts: ['Liên Chiểu', 'Cẩm Lệ'],
    preferredCourts: ['Sân cầu lông Liên Chiểu', 'Sân Pickleball Cẩm Lệ'],
    reviews: [
      { author: 'Vũ Thanh G', rating: 5, comment: 'Con tôi rất thích học với cô Hương. Kiên nhẫn và vui vẻ!' },
      { author: 'Bùi Thị H', rating: 5, comment: 'Giáo án rõ ràng, thấy tiến bộ từng buổi. Rất recommend!' },
      { author: 'Cao Văn I', rating: 5, comment: 'Lớp nhỏ, được chú ý kỹ từng kỹ thuật. Học rất hiệu quả.' },
    ],
  },
  {
    id: 'coach-4',
    fullName: 'Võ Hữu Đức',
    headline: 'HLV Cầu lông chuyên sâu • Cựu đội tuyển tỉnh Quảng Nam',
    bio: 'Chuyên đào tạo cầu lông trình độ trung cấp và nâng cao. Kỹ thuật smash, footwork và chiến thuật đôi là thế mạnh. Học viên đã tham gia nhiều giải phong trào.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Vo+Huu+Duc&background=DC2626&color=fff&size=128&bold=true',
    sports: [SportType.BADMINTON],
    experienceYears: 15,
    hourlyRate: 400000,
    rating: 4.7,
    reviewCount: 112,
    city: 'Đà Nẵng',
    districts: ['Hải Châu', 'Sơn Trà'],
    preferredCourts: ['Nhà thi đấu Tiên Sơn', 'Sân Hải Châu Sports'],
    reviews: [
      { author: 'Trịnh Văn J', rating: 5, comment: 'Kỹ thuật smash của tôi lên hẳn sau 2 tháng. Thầy rất nghiêm khắc nhưng hiệu quả.' },
      { author: 'Đinh Thị K', rating: 4, comment: 'Dạy chuyên sâu, phù hợp người muốn thi đấu giải phong trào.' },
      { author: 'Lý Minh L', rating: 5, comment: 'Footwork cải thiện rõ rệt. Thầy luôn có mặt đúng giờ và chuẩn bị kỹ bài tập.' },
    ],
  },
  {
    id: 'coach-5',
    fullName: 'Đinh Quang Nam',
    headline: 'HLV Pickleball • Đào tạo cho doanh nhân & người bận rộn',
    bio: 'Lịch học linh hoạt sáng sớm 6:00-8:00 hoặc tối muộn 20:00-22:00. Chuyên phục vụ đối tượng văn phòng, doanh nhân muốn vận động cuối ngày. Học nhanh, hiệu quả, không lãng phí thời gian.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Dinh+Quang+Nam&background=0891B2&color=fff&size=128&bold=true',
    sports: [SportType.PICKLEBALL],
    experienceYears: 4,
    hourlyRate: 320000,
    rating: 4.8,
    reviewCount: 38,
    city: 'Đà Nẵng',
    districts: ['Hải Châu', 'Thanh Khê', 'Ngũ Hành Sơn'],
    preferredCourts: ['Pickleball Arena Đà Nẵng', 'Sân TNR'],
    reviews: [
      { author: 'Ngô Thị M', rating: 5, comment: 'Lịch 6 giờ sáng quá hợp cho tôi. Thầy đúng giờ, bài tập rất hiệu quả trong 90 phút.' },
      { author: 'Phùng Văn N', rating: 5, comment: 'Không bị nhàm chán vì thầy luôn thay đổi bài tập mới mẻ mỗi buổi.' },
    ],
  },
  {
    id: 'coach-6',
    fullName: 'Hồ Thị Lan Anh',
    headline: 'HLV Cầu lông nữ • Cựu VĐV CLB Tiên Sơn',
    bio: 'HLV nữ chuyên biệt giảng dạy cho phụ nữ và trẻ em gái. Tạo môi trường tập luyện thoải mái, tự tin. Trình độ từ người chưa biết đánh đến thi đấu đội tuyển.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ho+Thi+Lan+Anh&background=BE185D&color=fff&size=128&bold=true',
    sports: [SportType.BADMINTON],
    experienceYears: 9,
    hourlyRate: 290000,
    rating: 5.0,
    reviewCount: 46,
    city: 'Đà Nẵng',
    districts: ['Liên Chiểu', 'Hải Châu'],
    preferredCourts: ['Nhà thi đấu Tiên Sơn', 'Sân cầu lông Liên Chiểu'],
    reviews: [
      { author: 'Trần Thị O', rating: 5, comment: 'Cô Lan Anh dạy rất nhẹ nhàng, không áp lực. Tôi từ chỗ ngại ngùng giờ tự tin hẳn.' },
      { author: 'Nguyễn Thị P', rating: 5, comment: 'Môi trường an toàn, cô tạo không khí vui vẻ. Con tôi rất thích.' },
      { author: 'Lê Hồng Q', rating: 5, comment: 'HLV nữ nên dễ chia sẻ và thoải mái hơn. Kỹ thuật của cô rất chuẩn.' },
    ],
  },
];

const MOCK_COURSES = [
  {
    id: 'course-1',
    coachId: 'coach-1',
    coachName: 'Nguyễn Minh Trí',
    title: 'Khoá Cầu Lông Nền Tảng – 12 Buổi',
    sport: SportType.BADMINTON,
    level: 'Người mới bắt đầu',
    description: 'Từ cầm vợt đến đánh được trận đầu tiên. Kỹ thuật cơ bản: cầm vợt, di chuyển, cú đánh forehand/backhand, phát cầu, chiến thuật đơn giản.',
    totalSessions: 12,
    durationPerSession: 90,
    scheduleDescription: 'Thứ 3, 5, 7 – 18:00 đến 19:30',
    location: 'Nhà thi đấu Tiên Sơn, Đà Nẵng',
    price: 2400000,
    enrolledCount: 6,
    maxStudents: 8,
    city: 'Đà Nẵng',
  },
  {
    id: 'course-2',
    coachId: 'coach-2',
    coachName: 'Lê Thành Công',
    title: 'Pickleball Starter Pack – 8 Buổi',
    sport: SportType.PICKLEBALL,
    level: 'Người mới bắt đầu',
    description: 'Khám phá môn thể thao đang "hot" nhất 2024-2025. Quy tắc, kỹ thuật dink, volley, smash và chiến thuật đôi cơ bản. Vợt và bóng được cung cấp.',
    totalSessions: 8,
    durationPerSession: 90,
    scheduleDescription: 'Thứ 2, 4, 6 – 17:30 đến 19:00',
    location: 'Sân Pickleball The Arena, Ngũ Hành Sơn',
    price: 1800000,
    enrolledCount: 10,
    maxStudents: 12,
    city: 'Đà Nẵng',
  },
  {
    id: 'course-3',
    coachId: 'coach-3',
    coachName: 'Phan Thị Hương',
    title: 'Cầu Lông Thiếu Nhi (6–15 tuổi) – 16 Buổi',
    sport: SportType.BADMINTON,
    level: 'Dành cho thiếu nhi',
    description: 'Lớp học được thiết kế theo lứa tuổi và thể chất. Phát triển toàn diện phối hợp tay-mắt, tư duy chiến thuật và tinh thần thể thao đúng đắn.',
    totalSessions: 16,
    durationPerSession: 60,
    scheduleDescription: 'Thứ 7, CN – 8:00 đến 9:00',
    location: 'Sân cầu lông Liên Chiểu, Đà Nẵng',
    price: 2200000,
    enrolledCount: 7,
    maxStudents: 10,
    city: 'Đà Nẵng',
  },
  {
    id: 'course-4',
    coachId: 'coach-4',
    coachName: 'Võ Hữu Đức',
    title: 'Nâng Cấp Cầu Lông – Kỹ Thuật Thi Đấu',
    sport: SportType.BADMINTON,
    level: 'Trung cấp – Nâng cao',
    description: 'Dành cho người đã chơi được, muốn lên tầm thi đấu giải phong trào. Footwork nâng cao, smash góc, chiến thuật đôi, đọc bài đối thủ.',
    totalSessions: 10,
    durationPerSession: 120,
    scheduleDescription: 'Thứ 3, 5 – 19:00 đến 21:00',
    location: 'Nhà thi đấu Tiên Sơn, Đà Nẵng',
    price: 3200000,
    enrolledCount: 4,
    maxStudents: 6,
    city: 'Đà Nẵng',
  },
];

// ─── SPORT LABEL HELPER ────────────────────────────────────────────────────────
const sportLabel = (s: SportType) =>
  s === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball';

const sportBadge = (s: SportType) =>
  s === SportType.BADMINTON
    ? 'bg-blue-50 text-blue-700 border-blue-100'
    : 'bg-teal-50 text-teal-700 border-teal-100';

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 font-bold text-xs">
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? '½' : ''}
    </span>
  );
}

// ─── COACH CARD ───────────────────────────────────────────────────────────────
function CoachCard({
  coach,
  isAuthenticated,
  onViewDetail,
}: {
  coach: (typeof MOCK_COACHES)[0];
  isAuthenticated: boolean;
  onViewDetail: (id: string) => void;
}) {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <div className="gsap-card-item bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top color accent by sport */}
      <div
        className={`h-1 w-full ${
          coach.sports.includes(SportType.PICKLEBALL) && !coach.sports.includes(SportType.BADMINTON)
            ? 'bg-gradient-to-r from-teal-400 to-emerald-400'
            : coach.sports.length > 1
            ? 'bg-gradient-to-r from-blue-500 to-violet-500'
            : 'bg-gradient-to-r from-blue-500 to-[#1E5AA8]'
        }`}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-3">
          <img
            src={coach.avatarUrl}
            alt={coach.fullName}
            className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-900 leading-tight">{coach.fullName}</h3>
            <p className="text-xs font-semibold text-[#1E5AA8] mt-0.5 line-clamp-1">{coach.headline}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating rating={coach.rating} />
              <span className="text-xs font-bold text-slate-700">{coach.rating}</span>
              <span className="text-xs text-slate-400">({coach.reviewCount} đánh giá)</span>
            </div>
          </div>
        </div>

        {/* Sport & experience badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {coach.sports.map((s) => (
            <span
              key={s}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${sportBadge(s)}`}
            >
              {sportLabel(s)}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {coach.experienceYears} năm kinh nghiệm
          </span>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">{coach.bio}</p>

        {/* Location */}
        <div className="text-[11px] text-slate-500 mb-3">
          {coach.city} • {coach.districts.join(', ')}
        </div>

        {/* Courts */}
        {coach.preferredCourts.length > 0 && (
          <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 mb-3 line-clamp-1">
            <span className="font-bold text-slate-700">Sân quen: </span>
            {coach.preferredCourts.join(' · ')}
          </div>
        )}

        {/* Reviews toggle */}
        <button
          type="button"
          onClick={() => setShowReviews((v) => !v)}
          className="text-[11px] font-bold text-[#1E5AA8] hover:underline text-left mb-2 cursor-pointer"
        >
          {showReviews ? 'Ẩn đánh giá' : `Xem ${coach.reviews.length} đánh giá từ học viên`}
        </button>

        {/* Review list */}
        {showReviews && (
          <div className="space-y-2 mb-3 border-t border-slate-100 pt-3">
            {coach.reviews.map((r, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black text-slate-800">{r.author}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Học phí / giờ</span>
            <span className="text-sm font-black text-[#1E5AA8]">
              {coach.hourlyRate.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <button
            type="button"
            onClick={() => onViewDetail(coach.id)}
            className="px-4 py-2 bg-[#1E5AA8] text-white rounded-xl text-xs font-bold hover:bg-[#154687] transition-colors cursor-pointer"
          >
            {isAuthenticated ? 'Đặt lịch ngay' : 'Xem chi tiết'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COURSE CARD ──────────────────────────────────────────────────────────────
function CourseCard({
  course,
  isAuthenticated,
  onEnroll,
}: {
  course: (typeof MOCK_COURSES)[0];
  isAuthenticated: boolean;
  onEnroll: (coachId: string, courseId: string) => void;
}) {
  const pct = Math.round((course.enrolledCount / course.maxStudents) * 100);
  const almostFull = pct >= 80;

  return (
    <div className="gsap-card-item bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div
        className={`h-1 ${
          course.sport === SportType.PICKLEBALL
            ? 'bg-gradient-to-r from-teal-400 to-emerald-400'
            : 'bg-gradient-to-r from-blue-500 to-[#1E5AA8]'
        }`}
      />
      <div className="p-5 flex flex-col flex-1">
        {/* Badge row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${sportBadge(course.sport)}`}>
            {sportLabel(course.sport)} • {course.level}
          </span>
          <span className="text-base font-black text-[#1E5AA8] shrink-0">
            {course.price.toLocaleString('vi-VN')}đ
            <span className="text-[11px] font-normal text-slate-400">/khoá</span>
          </span>
        </div>

        <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{course.title}</h3>

        <p className="text-xs text-slate-500 mb-1">
          HLV: <span className="font-bold text-slate-700">{course.coachName}</span>
        </p>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">{course.description}</p>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 space-y-1 mb-3">
          <div>
            <span className="font-bold text-slate-800">Thời lượng:</span>{' '}
            {course.totalSessions} buổi × {course.durationPerSession} phút
          </div>
          <div>
            <span className="font-bold text-slate-800">Lịch học:</span> {course.scheduleDescription}
          </div>
          <div className="line-clamp-1">
            <span className="font-bold text-slate-800">Địa điểm:</span> {course.location}
          </div>
        </div>

        {/* Enrollment progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500">
              Đã đăng ký: <span className="font-bold text-slate-800">{course.enrolledCount}/{course.maxStudents}</span> học viên
            </span>
            {almostFull && (
              <span className="font-bold text-amber-600">Sắp hết chỗ!</span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${almostFull ? 'bg-amber-400' : 'bg-[#1E5AA8]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <button
            type="button"
            onClick={() => onEnroll(course.coachId, course.id)}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-[#1E5AA8] transition-colors cursor-pointer"
          >
            {isAuthenticated ? 'Đăng ký khoá học' : 'Xem khoá học'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CoachesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'coaches' | 'courses'>('coaches');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [keyword, setKeyword] = useState('');

  // Guest modal
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestModalConfig, setGuestModalConfig] = useState({
    title: 'Yêu cầu đăng nhập',
    description: '',
    redirectUrl: '/coaches',
  });

  const triggerGuestModal = (title: string, description: string, redirectUrl: string) => {
    setGuestModalConfig({ title, description, redirectUrl });
    setIsGuestModalOpen(true);
  };

  // Filter logic (client-side on mock data)
  const filteredCoaches = MOCK_COACHES.filter((c) => {
    const matchSport =
      !selectedSport || c.sports.includes(selectedSport as SportType);
    const matchKeyword =
      !keyword ||
      c.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      c.headline.toLowerCase().includes(keyword.toLowerCase()) ||
      c.bio.toLowerCase().includes(keyword.toLowerCase());
    return matchSport && matchKeyword;
  });

  const filteredCourses = MOCK_COURSES.filter((c) => {
    const matchSport = !selectedSport || c.sport === (selectedSport as SportType);
    const matchKeyword =
      !keyword ||
      c.title.toLowerCase().includes(keyword.toLowerCase()) ||
      c.coachName.toLowerCase().includes(keyword.toLowerCase());
    return matchSport && matchKeyword;
  });

  // Handlers
  const handleViewCoachDetail = (coachId: string) => {
    if (!isAuthenticated) {
      triggerGuestModal(
        'Xem chi tiết hồ sơ Huấn luyện viên',
        'Tài khoản Khách chỉ có thể duyệt danh sách tổng quan. Để xem toàn bộ hồ sơ, bằng cấp và đặt lịch, bạn cần đăng nhập.',
        `/coaches/${coachId}`
      );
    } else {
      router.push(`/coaches/${coachId}`);
    }
  };

  const handleEnrollCourse = (coachId: string, courseId: string) => {
    if (!isAuthenticated) {
      triggerGuestModal(
        'Đăng ký khoá học thể thao',
        'Khách không thể đăng ký giữ chỗ khoá học. Vui lòng đăng nhập để chọn lớp học phù hợp.',
        `/coaches/${coachId}?courseId=${courseId}`
      );
    } else {
      router.push(`/coaches/${coachId}?courseId=${courseId}`);
    }
  };

  const handlePartnerRegister = () => {
    if (!isAuthenticated) {
      triggerGuestModal(
        'Đăng ký trở thành Huấn luyện viên đối tác',
        'Chỉ thành viên đã có tài khoản CourtMate mới có thể gửi hồ sơ làm HLV. Vui lòng đăng nhập để tiếp tục.',
        '/coaches/register'
      );
    } else {
      router.push('/coaches/register');
    }
  };

  // GSAP
  useGSAP(
    () => {
      gsap.fromTo(
        '.gsap-page-header',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.gsap-filter-bar',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' }
      );
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      gsap.fromTo(
        '.gsap-card-item',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    },
    { scope: containerRef, dependencies: [activeTab, selectedSport, keyword] }
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] pt-20 pb-20">
      {/* ─── PAGE HEADER ─── */}
      <div className="gsap-page-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[#1E5AA8] uppercase tracking-widest mb-1">
              Cầu lông · Pickleball · Đà Nẵng
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Huấn luyện viên & Khoá học
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {MOCK_COACHES.length} HLV đã kiểm duyệt · {MOCK_COURSES.length} khoá học đang mở
            </p>
          </div>
          <button
            type="button"
            onClick={handlePartnerRegister}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-[#1E5AA8] transition-all shadow-sm cursor-pointer"
          >
            Đăng ký làm HLV đối tác
          </button>
        </div>
      </div>

      {/* ─── MAIN ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Guest notice */}
        {!isAuthenticated && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              <span className="font-bold">Chế độ Khách:</span> Bạn có thể tìm kiếm và xem danh sách. Đăng nhập để xem chi tiết và đặt lịch.
            </span>
            <button
              type="button"
              onClick={() => triggerGuestModal('Đăng nhập vào CourtMate', 'Đăng nhập để xem chi tiết hồ sơ HLV, trao đổi tin nhắn và đặt lịch thuê buổi tập.', '/coaches')}
              className="shrink-0 px-4 py-1.5 rounded-lg bg-[#1E5AA8] text-white font-bold text-xs hover:bg-[#154687] transition-colors cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="gsap-filter-bar bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-200 mb-5 flex flex-col sm:flex-row gap-3">
          {/* Sport filter */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8] cursor-pointer"
          >
            <option value="">Tất cả môn (Cầu lông & Pickleball)</option>
            <option value={SportType.BADMINTON}>Cầu lông</option>
            <option value={SportType.PICKLEBALL}>Pickleball</option>
          </select>

          {/* Keyword */}
          <input
            type="text"
            placeholder="Tìm theo tên HLV, chuyên môn..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-[1.5] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]"
          />

          {/* Clear */}
          {(selectedSport || keyword) && (
            <button
              type="button"
              onClick={() => { setSelectedSport(''); setKeyword(''); }}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('coaches')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'coaches'
                ? 'border-[#1E5AA8] text-[#1E5AA8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Huấn luyện viên ({filteredCoaches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'courses'
                ? 'border-[#1E5AA8] text-[#1E5AA8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Khoá học mở sẵn ({filteredCourses.length})
          </button>
        </div>

        {/* ─── TAB: COACHES ─── */}
        {activeTab === 'coaches' && (
          <div>
            {filteredCoaches.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">Không tìm thấy HLV phù hợp. Hãy thử từ khoá khác.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCoaches.map((coach) => (
                  <CoachCard
                    key={coach.id}
                    coach={coach}
                    isAuthenticated={isAuthenticated}
                    onViewDetail={handleViewCoachDetail}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: COURSES ─── */}
        {activeTab === 'courses' && (
          <div>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">Không tìm thấy khoá học phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isAuthenticated={isAuthenticated}
                    onEnroll={handleEnrollCourse}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── GUEST MODAL ─── */}
      <GuestActionModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title={guestModalConfig.title}
        description={guestModalConfig.description}
        redirectUrl={guestModalConfig.redirectUrl}
      />
    </div>
  );
}
