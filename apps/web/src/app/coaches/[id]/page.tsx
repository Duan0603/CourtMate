'use client';

import { useEffect, useRef, useState } from 'react';
import { GuestActionModal } from '../../../components/shared/GuestActionModal';
import { CoachAvatar } from '../../../components/shared/CoachAvatar';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  User,
  Phone,
  Mail,
  Award,
  BookOpen,
} from 'lucide-react';
import { MOCK_COACHES, MOCK_COURSES, money, sportLabel } from '../../../lib/coaches.mock';
import { useCoachDemo, DemoBooking } from '../../../lib/coach-demo-store';
import { useAuth } from '../../../context/AuthContext';
import { emitUserNotification } from '../../../lib/notifications-api';

const inputStyle = 'cm-control mt-1.5 w-full rounded-xl border border-ink bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary text-ink font-semibold';
const primaryBtn = 'cm-button cm-action flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white hover:bg-primary shadow-lg shadow-black transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateLabel(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

export default function CoachDetailPage() {
  const params = useParams();
  const query = useSearchParams();

  // Find coach by id or _id
  const coach = MOCK_COACHES.find(c => c.id === params.id || (c as any)._id === params.id);
  const courses = MOCK_COURSES.filter(c => c.coachId === coach?.id || (c as any).coachId === (coach as any)?._id);

  const demo = useCoachDemo();
  const { user, isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const requireLogin = (action: () => void) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    action();
  };

  const initialCourseId = query.get('courseId');
  const [courseId, setCourseId] = useState(() => (courses.some(c => c.id === initialCourseId) ? initialCourseId! : ''));
  const [step, setStep] = useState<'profile' | 'info' | 'schedule' | 'payment' | 'confirmed'>('profile');

  // Student Review Form Fields
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentPhone, setStudentPhone] = useState((user as any)?.phone || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [studentSkill, setStudentSkill] = useState('Người mới bắt đầu (Chưa từng cầm vợt)');
  const [studentGoals, setStudentGoals] = useState('');

  // Booking schedule
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hours, setHours] = useState(1);
  const [location, setLocation] = useState(coach?.preferredCourts[0] || 'Nhà thi đấu Tiên Sơn');
  const [selectedSport, setSelectedSport] = useState(coach?.sports[0] || 'BADMINTON');

  // Payment method: Only PayOS (VietQR) or VNPAY
  const [paymentProvider, setPaymentProvider] = useState<'PAYOS' | 'VNPAY'>('PAYOS');

  const [reviewId, setReviewId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [latestBooking, setLatestBooking] = useState<any>(null);

  const setNotice = (body: string) => {
    if (body) {
      void emitUserNotification({
        type: 'COACH_ACTIVITY',
        title: 'Cập nhật học tập',
        body,
        link: '/coaches/' + params.id,
      });
    }
  };

  const paymentLock = useRef(false);
  const bookingRef = useRef<HTMLElement>(null);
  const learningRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (user) {
      if (user.name && !studentName) setStudentName(user.name);
      if (user.email && !studentEmail) setStudentEmail(user.email);
      if ((user as any)?.phone && !studentPhone) setStudentPhone((user as any).phone);
    }
  }, [user]);

  useEffect(() => {
    if (initialCourseId && courses.some(c => c.id === initialCourseId)) {
      setCourseId(initialCourseId);
      setStep('info');
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialCourseId]);

  if (!coach) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy huấn luyện viên</h1>
        <p className="mt-3 text-muted">Hồ sơ này hiện không khả dụng.</p>
        <Link href="/coaches" className="cm-link mt-6 inline-block text-primary font-bold">
          Danh sách huấn luyện viên
        </Link>
      </div>
    );
  }

  const course = courses.find(c => c.id === courseId);
  const total = course ? course.price : coach.hourlyRate * hours;
  const deposit = Math.round(total * 0.2);
  const bookings = isAuthenticated ? demo.bookings.filter(b => b.coachId === coach.id) : [];
  const extraReviews = demo.reviews.filter(r => r.coachId === coach.id);
  const displayRating =
    (coach.rating * coach.reviewCount + extraReviews.reduce((sum, r) => sum + r.rating, 0)) /
    (coach.reviewCount + extraReviews.length);

  // Future dates (next 14 days)
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return localDate(d);
  });

  const slots = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`).filter(
    t => Number(t.slice(0, 2)) + (course ? course.durationPerSession / 60 : hours) <= 22
  );

  const validInfo = Boolean(studentName.trim()) && Boolean(studentPhone.trim()) && Boolean(studentEmail.trim());
  const validSchedule = dates.includes(date) && slots.includes(time) && Boolean(location) && Boolean(selectedSport);

  const startBooking = () => {
    requireLogin(() => {
      setStep('info');
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validInfo) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email.');
      return;
    }
    setStep('schedule');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validSchedule) {
      alert('Vui lòng chọn ngày học và khung giờ bắt đầu.');
      return;
    }
    setStep('payment');
  };

  function pay() {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    if (!validSchedule || !demo.ready || paymentLock.current || !coach) return;
    paymentLock.current = true;

    const bookingId = crypto.randomUUID();
    const bookingTitle = course?.title || `Buổi học cá nhân 1 kèm 1 · ${hours} giờ`;
    const resolvedSport = course ? course.sport : selectedSport;

    const booking: DemoBooking = {
      id: bookingId,
      coachId: coach.id,
      title: bookingTitle,
      date,
      time,
      location,
      total,
      deposit,
      sport: sportLabel(resolvedSport as any),
      status: 'paid',
    };
    demo.addBooking(booking);

    // ─── REAL-TIME SYNCHRONIZATION WITH PERSONAL CALENDAR ───
    try {
      const durationHours = course ? course.durationPerSession / 60 : hours;
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationHours * 3600 * 1000);

      const calendarEvent = {
        id: `coach-booking-${bookingId}`,
        title: course ? `Khóa học: ${course.title} (HLV ${coach.fullName})` : `Học 1 kèm 1 với HLV ${coach.fullName}`,
        type: 'training',
        sport: resolvedSport as any,
        venueName: location,
        courtNumber: 'Sân HLV',
        address: coach.city || 'Đà Nẵng',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        linkUrl: `/coaches/${coach.id}`,
        notes: `Học viên: ${studentName} (${studentPhone}) • Trình độ: ${studentSkill} • Mục tiêu: ${studentGoals || 'Nâng cao kỹ thuật'} • HLV: ${coach.fullName} (${coach.phone})`,
      };

      const raw = localStorage.getItem('courtmate_personal_schedule');
      const list = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((e: any) => e.id !== calendarEvent.id);
      filtered.push(calendarEvent);
      localStorage.setItem('courtmate_personal_schedule', JSON.stringify(filtered));

      // Trigger instant cross-tab & component wakeup
      window.dispatchEvent(new Event('courtmate_schedule_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Could not sync to personal calendar:', e);
    }

    setLatestBooking({
      ...booking,
      studentName,
      studentPhone,
      studentEmail,
      studentSkill,
      studentGoals,
      paymentProvider,
    });

    setNotice(`Đăng ký thành công! Đã cọc ${money(deposit)}. Lịch học đã được tự động thêm vào Lịch trình cá nhân.`);
    setStep('confirmed');
    paymentLock.current = false;
  }

  return (
    <>
      <GuestActionModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        redirectUrl={`/coaches/${coach.id}${courseId ? `?courseId=${courseId}` : ''}`}
      />
      <div className="min-h-screen bg-canvas pb-20 text-ink">
        <div className="page-container page-section">
          {/* Breadcrumb */}
          <Link href="/coaches" className="cm-link inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Danh sách huấn luyện viên & Khóa học
          </Link>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            {/* Left Column (Main Profile & Courses) */}
            <div className="min-w-0 space-y-6">
              {/* Profile Card */}
              <section className="overflow-hidden rounded-3xl border border-ink bg-surface shadow-card">
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:gap-5">
                    <CoachAvatar className="h-20 w-20 rounded-2xl sm:h-24 sm:w-24 border border-ink shadow-sm" src={coach.avatarUrl} name={coach.fullName} />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {coach.sports.map(s => (
                          <span className="rounded-full bg-accent-baby px-3 py-0.5 text-xs font-bold text-primary border border-ink/20" key={s}>
                            {sportLabel(s)}
                          </span>
                        ))}
                      </div>
                      <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-ink">{coach.fullName}</h1>
                      <p className="mt-1 text-sm leading-6 text-muted font-medium">{coach.headline}</p>
                    </div>

                    <button
                      onClick={() =>
                        requireLogin(async () => {
                          await demo.toggleFavorite(coach.id);
                        })
                      }
                      aria-pressed={isAuthenticated && demo.favorites.includes(coach.id)}
                      className="cm-button col-span-2 flex items-center gap-2 justify-self-start rounded-xl border border-ink px-3 py-2 text-xs font-bold text-primary sm:col-span-1 shadow-xs hover:bg-slate-50 transition"
                    >
                      <Heart size={16} fill={isAuthenticated && demo.favorites.includes(coach.id) ? 'currentColor' : 'none'} />
                      {isAuthenticated && demo.favorites.includes(coach.id) ? 'Đã lưu' : 'Lưu hồ sơ'}
                    </button>
                  </div>

                  {/* Highlights Bar */}
                  <div className="mt-7 grid grid-cols-3 divide-x divide-ink border-y border-ink py-4 text-center bg-white rounded-2xl">
                    <div>
                      <p className="flex items-center justify-center gap-1 text-xl font-black text-ink">
                        <Star size={18} className="fill-amber-400 text-amber-500" />
                        {displayRating.toFixed(1)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted font-semibold">{coach.reviewCount + extraReviews.length} đánh giá</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-ink">{coach.experienceYears} năm</p>
                      <p className="mt-0.5 text-xs text-muted font-semibold">Kinh nghiệm</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-primary">1 kèm 1</p>
                      <p className="mt-0.5 text-xs text-muted font-semibold">Kèm cặp sát sao</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <h2 className="mt-6 text-base font-extrabold text-ink">Giới thiệu & Triết lý huấn luyện</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted font-medium">{coach.bio}</p>

                  {/* Preferred Courts */}
                  <h3 className="mt-6 flex items-center gap-2 text-sm font-bold text-ink">
                    <MapPin size={17} className="text-primary" />
                    Khu vực & Sân tập thường trực
                  </h3>
                  <p className="mt-1 text-xs text-muted">{coach.districts.join(' • ')} • {coach.city}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coach.preferredCourts.map(c => (
                      <span className="rounded-xl bg-white border border-ink px-3 py-1.5 text-xs font-semibold text-ink shadow-xs" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Courses Showcase by this Coach */}
              {courses.length > 0 && (
                <section className="rounded-3xl border border-ink bg-surface shadow-card p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-ink">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black text-ink">Các khóa học của HLV {coach.fullName}</h2>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {courses.length} Khóa đang mở
                    </span>
                  </div>

                  <div className="space-y-4">
                    {courses.map(crs => (
                      <div
                        key={crs.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          courseId === crs.id
                            ? 'border-primary bg-accent-baby ring-2 ring-primary/20 shadow-md'
                            : 'border-ink bg-white hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary text-white">
                                {sportLabel(crs.sport)}
                              </span>
                              <span className="text-xs font-bold text-muted">{crs.level}</span>
                            </div>
                            <h3 className="text-base font-extrabold text-ink">{crs.title}</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{crs.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted mt-3">
                              <span>📅 {crs.scheduleDescription}</span>
                              <span>📍 {crs.location}</span>
                              <span>👥 {crs.enrolledCount}/{crs.maxStudents} học viên</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                            <span className="text-lg font-black text-primary">{money(crs.price)}</span>
                            <button
                              onClick={() => {
                                setCourseId(crs.id);
                                startBooking();
                              }}
                              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition"
                            >
                              Đăng ký khóa này
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* My Learning History / Bookings */}
              {isAuthenticated && (
                <section ref={learningRef} className="scroll-mt-24 rounded-3xl border border-ink bg-surface shadow-card p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-base sm:text-lg font-black text-ink">
                    <CalendarDays size={20} className="text-primary" /> Lịch học cá nhân đã đăng ký
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted">
                    Lịch học cùng HLV được lưu tự động và đồng bộ thời gian thực vào Lịch trình cá nhân.
                  </p>

                  {bookings.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-ink py-8 text-center text-xs sm:text-sm text-muted bg-white">
                      Bạn chưa có lịch học nào với HLV {coach.fullName}.
                    </div>
                  ) : (
                    bookings.map(b => (
                      <div key={b.id} className="mt-4 rounded-2xl border border-ink bg-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-extrabold text-ink">{b.title}</h3>
                            <p className="mt-1 text-xs text-muted font-medium">
                              {dateLabel(b.date)} • {b.time} • {b.sport}
                            </p>
                            <p className="mt-0.5 text-xs text-muted">{b.location}</p>
                          </div>
                          <span className="rounded-full bg-accent-baby px-3 py-1 text-xs font-bold text-primary border border-ink/20">
                            {b.status === 'paid' ? 'Đã cọc • Sắp diễn ra' : 'Đã hoàn thành'}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-ink/15 flex items-center justify-between text-xs">
                          <span className="text-muted">
                            Đã cọc: <strong className="text-primary font-bold">{money(b.deposit)}</strong> (Còn lại trả tại sân: {money(b.total - b.deposit)})
                          </span>
                          <Link href="/profile?tab=schedule" className="font-bold text-primary hover:underline">
                            Xem trên lịch tuần →
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </section>
              )}
            </div>

            {/* Right Column: Sticky Booking & Registration Engine */}
            <aside ref={bookingRef} className="scroll-mt-24 rounded-3xl border border-ink bg-surface shadow-card p-6 sm:p-7 lg:sticky lg:top-24 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-ink">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Clock3 size={16} /> Giờ tập: 06:00 – 22:00
                </div>
                <span className="text-xs font-black text-muted uppercase">Học kèm & Khóa học</span>
              </div>

              <div>
                <span className="text-xs font-bold text-muted uppercase tracking-wider block">Học phí</span>
                <p className="text-3xl font-black text-primary tracking-tight">
                  {course ? money(course.price) : money(coach.hourlyRate)}
                  <span className="text-xs font-bold text-muted ml-1.5">{course ? '/ toàn khóa' : '/ giờ'}</span>
                </p>
                <p className="mt-1 text-xs text-muted font-medium">Chính sách: Đặt cọc 20% giữ lịch, 80% trả tại sân khi bắt đầu.</p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-ink text-center text-[11px] font-bold">
                {[
                  { id: 'info', label: '1. Thông tin' },
                  { id: 'schedule', label: '2. Chọn lịch' },
                  { id: 'payment', label: '3. Thanh toán' },
                ].map((sItem) => {
                  const isActive = step === sItem.id;
                  const isPassed =
                    (step === 'schedule' && sItem.id === 'info') ||
                    (step === 'payment' && (sItem.id === 'info' || sItem.id === 'schedule')) ||
                    step === 'confirmed';
                  return (
                    <div
                      key={sItem.id}
                      className={`py-1.5 px-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : isPassed
                          ? 'bg-blue-50 text-primary border border-blue-200'
                          : 'bg-white text-muted border border-ink/20'
                      }`}
                    >
                      {sItem.label}
                    </div>
                  );
                })}
              </div>

              {/* STEP 0: INITIAL PROFILE OVERVIEW */}
              {step === 'profile' && (
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-ink">Bắt đầu đặt lịch học</h2>
                  <p className="text-xs text-muted leading-relaxed">
                    Bạn có thể chọn học cá nhân 1 kèm 1 theo giờ hoặc đăng ký trọn gói khóa học của HLV {coach.fullName}.
                  </p>
                  <button onClick={startBooking} className={primaryBtn}>
                    <span>Tiếp tục điền thông tin</span>
                    <ArrowRight size={17} />
                  </button>
                  <div className="p-3 bg-white rounded-xl border border-ink text-center text-xs text-muted font-medium flex items-center justify-center gap-2">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>Cam kết bảo mật & hoàn cọc nếu hủy trước 24h</span>
                  </div>
                </div>
              )}

              {/* STEP 1: STUDENT INFORMATION FORM (FOR COACH REVIEW) */}
              {step === 'info' && (
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-ink flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" /> Thông tin học viên
                    </h2>
                    <span className="text-[10px] font-bold text-muted bg-white px-2 py-0.5 rounded border border-ink/20">
                      HLV xét duyệt
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                      Họ và tên người học <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Hoàng"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                      Số điện thoại Zalo <span className="text-primary">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0905 xxx xxx"
                      value={studentPhone}
                      onChange={e => setStudentPhone(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                      Email nhận lịch học <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@gmail.com"
                      value={studentEmail}
                      onChange={e => setStudentEmail(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                      Trình độ hiện tại
                    </label>
                    <select
                      value={studentSkill}
                      onChange={e => setStudentSkill(e.target.value)}
                      className={inputStyle}
                    >
                      <option value="Mới bắt đầu (Chưa từng cầm vợt)">Mới bắt đầu (Chưa từng cầm vợt)</option>
                      <option value="Cơ bản (Đã biết luật & đánh qua lưới)">Cơ bản (Đã biết luật & đánh qua lưới)</option>
                      <option value="Trung bình khá (Muốn nâng cao chiến thuật & smash)">Trung bình khá (Muốn nâng cao chiến thuật & smash)</option>
                      <option value="Nâng cao (Rèn luyện chuẩn bị thi đấu giải)">Nâng cao (Rèn luyện chuẩn bị thi đấu giải)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                      Mục tiêu học tập & Ghi chú cho HLV
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Muốn tập trung sửa bộ chân di chuyển và tăng lực smash..."
                      value={studentGoals}
                      onChange={e => setStudentGoals(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <button type="submit" className={primaryBtn}>
                    <span>Tiếp tục: Chọn lịch học</span>
                    <ArrowRight size={17} />
                  </button>
                  <button type="button" className="cm-button w-full text-xs text-muted font-bold text-center" onClick={() => setStep('profile')}>
                    Quay lại
                  </button>
                </form>
              )}

              {/* STEP 2: CHOOSE SCHEDULE */}
              {step === 'schedule' && (
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <h2 className="text-base font-black text-ink flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" /> Chọn lịch học & Địa điểm
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider">Hình thức đào tạo</label>
                    <select
                      className={inputStyle}
                      value={courseId}
                      onChange={e => {
                        setCourseId(e.target.value);
                        setTime('');
                      }}
                    >
                      <option value="">Buổi học cá nhân · 1 kèm 1 ({money(coach.hourlyRate)}/giờ)</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>
                          Khóa: {c.title} ({money(c.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {course ? (
                    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-primary leading-relaxed font-semibold">
                      📘 <strong>{course.title}</strong>
                      <div className="mt-1 text-slate-700 font-normal">
                        {course.totalSessions} buổi × {course.durationPerSession} phút • Lịch cố định: {course.scheduleDescription}.
                      </div>
                      <div className="mt-1 text-muted text-[11px]">* Hãy chọn ngày bắt đầu buổi khai giảng đầu tiên bên dưới.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wider">Thời lượng</label>
                        <select className={inputStyle} value={hours} onChange={e => { setHours(Number(e.target.value)); setTime(''); }}>
                          <option value="1">1 giờ</option>
                          <option value="1.5">1,5 giờ</option>
                          <option value="2">2 giờ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wider">Bộ môn</label>
                        <select className={inputStyle} value={selectedSport} onChange={e => setSelectedSport(e.target.value)}>
                          {coach.sports.map(s => (
                            <option key={s} value={s}>{sportLabel(s)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider">Sân tập luyện</label>
                    <select required className={inputStyle} value={location} onChange={e => setLocation(e.target.value)}>
                      {coach.preferredCourts.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                      {course ? 'Ngày khai giảng khóa học' : 'Ngày học'} (14 ngày tới)
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {dates.map(d => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => { setDate(d); setTime(''); }}
                          className={`cm-button rounded-xl border py-2 px-1 text-[11px] font-bold text-center transition ${
                            date === d
                              ? 'border-primary bg-accent-baby text-primary ring-2 ring-primary/20 shadow-xs'
                              : 'border-ink bg-white text-muted hover:border-ink hover:text-ink'
                          }`}
                        >
                          {dateLabel(d)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {date && (
                    <div className="animate-in fade-in duration-200">
                      <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        Khung giờ bắt đầu
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {slots.map(t => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setTime(t)}
                            className={`cm-button rounded-xl border py-2 px-1 text-xs font-bold text-center transition ${
                              time === t
                                ? 'border-primary bg-primary text-white shadow-xs'
                                : 'border-ink bg-white text-muted hover:border-ink hover:text-ink'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-ink flex items-center justify-between text-sm">
                    <span className="text-muted font-bold">Tổng học phí:</span>
                    <strong className="text-lg font-black text-ink">{money(total)}</strong>
                  </div>

                  <button type="submit" disabled={!validSchedule} className={primaryBtn}>
                    <span>Tiếp tục: Xác nhận & Cọc {money(deposit)}</span>
                    <ArrowRight size={17} />
                  </button>
                  <button type="button" className="cm-button w-full text-xs text-muted font-bold text-center" onClick={() => setStep('info')}>
                    Quay lại thông tin
                  </button>
                </form>
              )}

              {/* STEP 3: PAYMENT GATEWAY (NO MOMO) */}
              {step === 'payment' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-ink flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" /> Xác nhận & Thanh toán cọc
                  </h2>

                  {/* Summary Card */}
                  <div className="rounded-2xl bg-white border border-ink p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-muted font-medium">Khóa/Buổi học:</span>
                      <strong className="text-ink font-bold text-right">{course?.title || `Buổi 1 kèm 1 (${hours} giờ)`}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted font-medium">Huấn luyện viên:</span>
                      <strong className="text-ink font-bold">{coach.fullName}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted font-medium">Thời gian:</span>
                      <strong className="text-primary font-bold">{dateLabel(date)} lúc {time}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted font-medium">Sân tập:</span>
                      <span className="text-ink font-semibold">{location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted font-medium">Học viên:</span>
                      <span className="text-ink font-semibold">{studentName} ({studentPhone})</span>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="rounded-2xl bg-slate-50 border border-ink/20 p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted font-medium">Tổng học phí:</span>
                      <span className="text-ink font-bold">{money(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted font-medium">Thanh toán tại sân (80%):</span>
                      <span className="text-ink font-bold">{money(total - deposit)}</span>
                    </div>
                    <div className="flex justify-between border-t border-ink/15 pt-2 text-sm">
                      <span className="font-bold text-ink">Đặt cọc trực tuyến hôm nay (20%):</span>
                      <span className="font-black text-primary text-base">{money(deposit)}</span>
                    </div>
                  </div>

                  {/* 2 Payment Gateways: PayOS & VNPAY */}
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                      Chọn cổng thanh toán <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        {
                          id: 'PAYOS' as const,
                          name: 'Quét mã VietQR (PayOS)',
                          desc: 'Chuyển khoản trực tiếp 24/7 từ mọi ứng dụng ngân hàng',
                        },
                        {
                          id: 'VNPAY' as const,
                          name: 'Cổng VNPAY',
                          desc: 'Thẻ ATM nội địa & thẻ quốc tế Visa / Mastercard',
                        },
                      ].map(pg => (
                        <label
                          key={pg.id}
                          className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                            paymentProvider === pg.id
                              ? 'border-primary bg-accent-baby ring-2 ring-primary/20'
                              : 'border-ink bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name="coachPayment"
                                checked={paymentProvider === pg.id}
                                onChange={() => setPaymentProvider(pg.id)}
                                className="cm-control text-primary focus:ring-primary"
                              />
                              <strong className="text-xs sm:text-sm font-extrabold text-ink">{pg.name}</strong>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-ink/20 text-muted">
                              {pg.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted font-medium mt-1.5 ml-6 block leading-snug">
                            {pg.desc}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button disabled={!demo.ready} onClick={pay} className={primaryBtn}>
                    <CheckCircle2 size={17} />
                    <span>Xác nhận & Thanh toán cọc {money(deposit)}</span>
                  </button>
                  <button type="button" className="cm-button w-full text-xs text-muted font-bold text-center" onClick={() => setStep('schedule')}>
                    Quay lại chọn lịch
                  </button>
                </div>
              )}

              {/* STEP 4: SUCCESS CONFIRMATION & CALENDAR JUMP */}
              {step === 'confirmed' && latestBooking && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto border border-green-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="text-center">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-green-100 text-green-800 border border-green-300">
                      ĐÃ ĐẶT LỊCH THÀNH CÔNG
                    </span>
                    <h2 className="text-lg font-black text-ink mt-2">Lịch học đã sẵn sàng!</h2>
                    <p className="text-xs text-muted font-medium mt-1">
                      Buổi học cùng HLV {coach.fullName} đã được kích hoạt và đồng bộ tự động vào Lịch trình cá nhân của bạn.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-ink p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Buổi học:</span>
                      <strong className="text-ink font-bold">{latestBooking.title}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Thời gian:</span>
                      <span className="text-primary font-bold">{dateLabel(latestBooking.date)} lúc {latestBooking.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Địa điểm:</span>
                      <span className="text-ink font-medium">{latestBooking.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Học viên:</span>
                      <span className="text-ink font-medium">{latestBooking.studentName}</span>
                    </div>
                  </div>

                  <Link href="/profile?tab=schedule" className="block w-full">
                    <button className={primaryBtn}>
                      <Calendar className="w-4 h-4" />
                      <span>Xem trong Lịch trình cá nhân →</span>
                    </button>
                  </Link>

                  <button
                    onClick={() => {
                      setStep('profile');
                      setTime('');
                    }}
                    className="cm-button w-full py-2.5 rounded-xl border border-ink bg-white text-xs font-bold text-ink hover:bg-slate-50 transition"
                  >
                    Tiếp tục xem hồ sơ HLV
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
