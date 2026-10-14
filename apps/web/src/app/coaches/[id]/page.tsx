'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CoachProfile,
  CoachBookingType,
  SportType,
} from '@courtmate/shared';
import { coachesApi } from '../../../lib/coaches.api';
import { useAuth } from '../../../context/AuthContext';
import { GuestActionModal } from '../../../components/shared/GuestActionModal';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function CoachDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const coachId = params?.id as string;
  const initialCourseId = searchParams?.get('courseId');

  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Guest restriction Modal State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestModalConfig, setGuestModalConfig] = useState({
    title: 'Yêu cầu đăng nhập tài khoản',
    description: 'Tài khoản Khách chỉ có quyền xem danh sách và tìm kiếm. Bạn không thể xem chi tiết hồ sơ hoặc đặt lịch. Vui lòng đăng nhập để tiếp tục.',
    redirectUrl: `/coaches/${coachId}`,
  });

  // Booking Form State
  const [bookingType, setBookingType] = useState<CoachBookingType>(
    initialCourseId ? CoachBookingType.COURSE : CoachBookingType.HOURLY
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || '');
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('18:00');
  const [durationHours, setDurationHours] = useState<number>(1);
  const [courtLocation, setCourtLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Review State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // STRICT GUEST CHECK ON LOAD: Guest cannot view details
  useEffect(() => {
    if (!isAuthenticated) {
      setGuestModalConfig({
        title: 'Giới hạn quyền truy cập chi tiết HLV',
        description: 'Tài khoản Khách chỉ có thể xem danh bạ tổng quan. Để xem chi tiết hồ sơ, bằng cấp, khoá học và đặt lịch hẹn cùng HLV, vui lòng đăng nhập.',
        redirectUrl: `/coaches/${coachId}`,
      });
      setIsGuestModalOpen(true);
    }
  }, [isAuthenticated, coachId]);

  const fetchCoach = async () => {
    setLoading(true);
    try {
      const data = await coachesApi.getCoachDetails(coachId);
      setCoach(data);
      if (data?.preferredCourts?.length) {
        setCourtLocation(data.preferredCourts[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không tìm thấy thông tin HLV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coachId) fetchCoach();
  }, [coachId]);

  useGSAP(
    () => {
      if (!loading && coach) {
        gsap.fromTo(
          '.gsap-profile-header',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.gsap-section',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
        );
      }
    },
    { scope: containerRef, dependencies: [loading, coach] }
  );

  const calculateTotal = () => {
    if (!coach) return 0;
    if (bookingType === CoachBookingType.COURSE) {
      const selectedCourse = coach.courses?.find((c) => c.id === selectedCourseId);
      return selectedCourse ? selectedCourse.price : 0;
    }
    return coach.hourlyRate * durationHours;
  };

  // Submit Booking with Strict Guest Protection
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setGuestModalConfig({
        title: 'Đăng nhập để đặt lịch học',
        description: 'Bạn cần đăng nhập tài khoản để đặt lịch hẹn hoặc đăng ký khoá học cùng HLV.',
        redirectUrl: `/coaches/${coachId}`,
      });
      setIsGuestModalOpen(true);
      return;
    }
    if (!courtLocation && bookingType === CoachBookingType.HOURLY) {
      toast.error('Vui lòng chọn hoặc nhập sân tập');
      return;
    }

    setSubmitting(true);
    try {
      await coachesApi.bookCoach(coachId, {
        userId: user?.id,
        userName: user?.name,
        userPhone: '',
        userEmail: user?.email,
        bookingType,
        courseId: bookingType === CoachBookingType.COURSE ? selectedCourseId : undefined,
        sport: coach?.sports[0] || SportType.BADMINTON,
        bookingDate,
        startTime,
        durationHours,
        courtLocation: bookingType === CoachBookingType.COURSE ? 'Sân theo lịch khoá học' : courtLocation,
        totalPrice: calculateTotal(),
        notes,
      });

      toast.success(
        bookingType === CoachBookingType.COURSE
          ? 'Đăng ký khoá học thành công! HLV sẽ liên hệ xác nhận.'
          : 'Đặt lịch thuê HLV thành công! HLV sẽ nhận thông báo.'
      );
      setNotes('');
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi đặt lịch');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Review with Strict Guest Protection
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setGuestModalConfig({
        title: 'Đăng nhập để gửi nhận xét',
        description: 'Chỉ học viên đã đăng nhập mới có thể gửi đánh giá cho Huấn luyện viên.',
        redirectUrl: `/coaches/${coachId}`,
      });
      setIsGuestModalOpen(true);
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nhận xét của bạn');
      return;
    }

    setSubmittingReview(true);
    try {
      await coachesApi.submitReview(coachId, {
        userName: user?.name || 'Học viên CourtMate',
        userAvatar: user?.avatarUrl,
        rating: reviewRating,
        comment: reviewComment,
        bookingType,
      });

      toast.success('Cảm ơn bạn đã gửi đánh giá!');
      setReviewComment('');
      fetchCoach();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      setGuestModalConfig({
        title: 'Đăng nhập để trao đổi với HLV',
        description: 'Vui lòng đăng nhập tài khoản để nhắn tin trực tiếp với Huấn luyện viên.',
        redirectUrl: `/coaches/${coachId}`,
      });
      setIsGuestModalOpen(true);
    } else {
      router.push('/chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 flex justify-center">
        <div className="text-sm font-bold text-slate-500">Đang tải thông tin Huấn luyện viên...</div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 text-center">
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy thông tin Huấn luyện viên</h2>
        <Link href="/coaches" className="mt-3 inline-block text-[#1E5AA8] text-sm font-bold">
          Quay lại danh bạ HLV
        </Link>
      </div>
    );
  }

  // IF GUEST: Show Restricted Overlay over detail content
  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] pb-24 pt-24 relative">
      {/* ─── BREADCRUMB ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link
          href="/coaches"
          className="text-xs font-bold text-slate-500 hover:text-[#1E5AA8] transition-colors"
        >
          ← Danh bạ Huấn luyện viên
        </Link>
      </div>

      {/* Guest Warning Card if guest */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold">Nội dung yêu cầu đăng nhập:</span> Bạn đang ở chế độ Khách. Chi tiết hồ sơ và tính năng đặt lịch được bảo vệ. Vui lòng đăng nhập để mở khoá toàn bộ tính năng.
            </div>
            <button
              type="button"
              onClick={() => setIsGuestModalOpen(true)}
              className="px-4 py-2 bg-[#1E5AA8] text-white rounded-xl text-xs font-bold hover:bg-[#154687] transition-colors cursor-pointer whitespace-nowrap"
            >
              Đăng nhập để xem
            </button>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${!isAuthenticated ? 'filter blur-[1px] pointer-events-none select-none opacity-80' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── LEFT: PROFILE INFO & REVIEWS (2 COLS) ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <div className="gsap-profile-header bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <img
                  src={coach.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(coach.fullName)}`}
                  alt={coach.fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-2xl font-black text-slate-900">
                      {coach.fullName}
                    </h1>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      Đánh giá: {coach.rating} / 5.0 ({coach.reviewCount} lượt)
                    </span>
                  </div>

                  <p className="text-sm font-bold text-[#1E5AA8] mt-1">
                    {coach.headline}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">
                      Kinh nghiệm: {coach.experienceYears} năm
                    </span>
                    <span>•</span>
                    <span>
                      Môn: {coach.sports.map(s => s === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball').join(', ')}
                    </span>
                    <span>•</span>
                    <span>
                      Khu vực: {coach.city} {coach.districts?.length > 0 && `(${coach.districts.join(', ')})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat action */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleChatClick}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-[#1E5AA8] hover:text-white transition-colors cursor-pointer"
                >
                  Nhắn tin trao đổi trước với HLV
                </button>
              </div>
            </div>

            {/* Giới thiệu */}
            <div className="gsap-section bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200">
              <h2 className="text-base font-black text-slate-900 mb-3">
                Giới thiệu & Phương pháp huấn luyện
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {coach.bio}
              </p>

              {coach.preferredCourts?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Sân tập đề xuất / quen thuộc:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {coach.preferredCourts.map((court, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                      >
                        {court}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bằng cấp & Chứng chỉ */}
            <div className="gsap-section bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200">
              <h2 className="text-base font-black text-slate-900 mb-3">
                Chứng chỉ & Thành tích
              </h2>
              <div className="space-y-2.5">
                {coach.certificates && coach.certificates.length > 0 ? (
                  coach.certificates.map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cert.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Đơn vị cấp: {cert.issuedBy} • Năm {cert.year}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Đang cập nhật chứng chỉ</p>
                )}
              </div>
            </div>

            {/* Khoá học mở sẵn */}
            {coach.courses && coach.courses.length > 0 && (
              <div className="gsap-section bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200">
                <h2 className="text-base font-black text-slate-900 mb-3">
                  Khoá học mở sẵn của {coach.fullName}
                </h2>
                <div className="space-y-3">
                  {coach.courses.map((course) => (
                    <div
                      key={course.id}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedCourseId === course.id && bookingType === CoachBookingType.COURSE
                          ? 'border-[#1E5AA8] bg-blue-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {course.level}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{course.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {course.totalSessions} buổi ({course.durationPerSession} phút/buổi) • {course.scheduleDescription}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-sm font-black text-[#1E5AA8]">
                            {course.price.toLocaleString()}đ
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setBookingType(CoachBookingType.COURSE);
                              setSelectedCourseId(course.id);
                            }}
                            className="mt-1 text-xs font-bold text-[#1E5AA8] hover:underline cursor-pointer"
                          >
                            Chọn khoá này để đăng ký
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── REVIEW SECTION ─── */}
            <div className="gsap-section bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Đánh giá từ những người đã học
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nhận xét thực tế từ học viên đã hoàn thành buổi học cùng HLV
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900">{coach.rating}</span>
                  <span className="text-xs text-slate-400"> / 5.0</span>
                </div>
              </div>

              {/* Form gửi đánh giá */}
              <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Viết nhận xét của bạn
                </h4>
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-xs text-slate-600">Chọn số sao:</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                  >
                    <option value={5}>5 sao - Xuất sắc</option>
                    <option value={4}>4 sao - Tốt</option>
                    <option value={3}>3 sao - Khá</option>
                    <option value={2}>2 sao - Trung bình</option>
                    <option value={1}>1 sao - Cần cải thiện</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Nhập cảm nhận của bạn về buổi tập cùng HLV..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                />
                <div className="mt-2 text-right">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-1.5 bg-[#1E5AA8] text-white rounded-lg text-xs font-bold hover:bg-[#154687] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}
                  </button>
                </div>
              </form>

              {/* Danh sách nhận xét */}
              <div className="space-y-3">
                {coach.reviews && coach.reviews.length > 0 ? (
                  coach.reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            ({rev.bookingType === CoachBookingType.COURSE ? 'Khoá học' : 'Thuê theo giờ'})
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-700">
                          {rev.rating} / 5.0
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-3">Chưa có đánh giá nào cho HLV này</p>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: BOOKING CARD ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-black text-slate-900 mb-0.5">Đặt lịch học cùng HLV</h3>
              <p className="text-xs text-slate-500 mb-4">
                HLV trực tiếp xác nhận lịch hẹn
              </p>

              {/* Booking Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setBookingType(CoachBookingType.HOURLY)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    bookingType === CoachBookingType.HOURLY
                      ? 'bg-white text-[#1E5AA8] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thuê theo giờ
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType(CoachBookingType.COURSE)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    bookingType === CoachBookingType.COURSE
                      ? 'bg-white text-[#1E5AA8] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Khoá học mở sẵn
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                {/* Form fields if HOURLY */}
                {bookingType === CoachBookingType.HOURLY && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Ngày tập dự kiến
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Giờ bắt đầu
                        </label>
                        <input
                          type="time"
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Thời lượng
                        </label>
                        <select
                          value={durationHours}
                          onChange={(e) => setDurationHours(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                        >
                          <option value={1}>1 giờ</option>
                          <option value={1.5}>1.5 giờ</option>
                          <option value={2}>2 giờ</option>
                          <option value={3}>3 giờ</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Sân tập
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Sân Kỳ Đồng, CLB Tiên Sơn..."
                        value={courtLocation}
                        onChange={(e) => setCourtLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                      />
                    </div>
                  </>
                )}

                {/* Form fields if COURSE */}
                {bookingType === CoachBookingType.COURSE && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Chọn khoá học
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                    >
                      <option value="">-- Chọn khoá học --</option>
                      {coach.courses?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.price.toLocaleString()}đ)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Ghi chú mục tiêu tập luyện
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: Cần chỉnh kỹ thuật đập cầu, rèn thể lực..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                  />
                </div>

                {/* Pricing Summary */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Học phí:</span>
                    <span>
                      {bookingType === CoachBookingType.HOURLY
                        ? `${coach.hourlyRate.toLocaleString()}đ x ${durationHours}h`
                        : 'Trọn gói khoá'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-slate-900">
                    <span>Tổng tiền:</span>
                    <span className="text-[#1E5AA8] text-base font-black">
                      {calculateTotal().toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#1E5AA8] text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-[#154687] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Modal */}
      <GuestActionModal
        isOpen={isGuestModalOpen}
        onClose={() => {
          setIsGuestModalOpen(false);
          // If guest, redirect back to coaches catalog
          if (!isAuthenticated) {
            router.push('/coaches');
          }
        }}
        title={guestModalConfig.title}
        description={guestModalConfig.description}
        redirectUrl={guestModalConfig.redirectUrl}
      />
    </div>
  );
}
