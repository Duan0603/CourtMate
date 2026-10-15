'use client';

import { useEffect, useRef, useState } from 'react';
import { GuestActionModal } from '../../../components/shared/GuestActionModal';
import { CoachAvatar } from '../../../components/shared/CoachAvatar';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Award, CalendarDays, CheckCircle2, Clock3, CreditCard, Heart, MapPin, ShieldCheck, Star } from 'lucide-react';
import { MOCK_COACHES, MOCK_COURSES, money, sportLabel } from '../../../lib/coaches.mock';
import { useCoachDemo, DemoBooking } from '../../../lib/coach-demo-store';
import { useAuth } from '../../../context/AuthContext';

const input = 'mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-600';
const primary = 'flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E5AA8] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#164781] disabled:cursor-not-allowed disabled:opacity-40';
function localDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function dateLabel(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }); }

export default function CoachDetailPage() {
  const params = useParams();
  const query = useSearchParams();
  const coach = MOCK_COACHES.find(c => c.id === params.id);
  const courses = MOCK_COURSES.filter(c => c.coachId === coach?.id);
  const demo = useCoachDemo();
  const { user, isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const requireLogin = (action: () => void) => {
    if (!isAuthenticated) { setLoginOpen(true); return; }
    action();
  };
  const [courseId, setCourseId] = useState(() => courses.some(c => c.id === query.get('courseId')) ? query.get('courseId')! : '');
  const [step, setStep] = useState<'profile' | 'schedule' | 'payment'>('profile');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hours, setHours] = useState(1);
  const [location, setLocation] = useState(coach?.preferredCourts[0] || '');
  const [selectedSport, setSelectedSport] = useState(coach?.sports[0] || '');
  const [payment, setPayment] = useState('Ví CourtMate');
  const [reviewId, setReviewId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [notice, setNotice] = useState('');
  const paymentLock = useRef(false);
  const bookingRef = useRef<HTMLElement>(null);
  const learningRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isAuthenticated) { setStep('profile'); setReviewId(''); }
  }, [isAuthenticated]);
  if (!coach) return <div className="mx-auto max-w-xl px-5 py-24 text-center">
    <h1 className="text-2xl font-bold">Không tìm thấy huấn luyện viên</h1>
    <p className="mt-3 text-slate-500">Hồ sơ này hiện không khả dụng.</p>
    <Link href="/coaches" className="mt-6 inline-block text-[#1E5AA8]">Quay lại danh sách HLV</Link>
  </div>;
  const course = courses.find(c => c.id === courseId);
  const total = course ? course.price : coach.hourlyRate * hours;
  const deposit = Math.round(total * 0.2);
  const bookings = isAuthenticated ? demo.bookings.filter(b => b.coachId === coach.id) : [];
  const extraReviews = demo.reviews.filter(r => r.coachId === coach.id);
  const displayRating = (coach.rating * coach.reviewCount + extraReviews.reduce((sum, r) => sum + r.rating, 0)) / (coach.reviewCount + extraReviews.length);
  const dates = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return localDate(d); });
  const slots = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`).filter(t => Number(t.slice(0, 2)) + (course ? course.durationPerSession / 60 : hours) <= 22);
  const validSchedule = dates.includes(date) && slots.includes(time) && Boolean(location) && Boolean(selectedSport);
  const scrollToBooking = () => requireLogin(() => { setStep('schedule'); setNotice(''); bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  function pay() {
    if (!isAuthenticated) { setLoginOpen(true); return; }
    if (!validSchedule || !demo.ready || paymentLock.current || !coach) return;
    paymentLock.current = true;
    const booking: DemoBooking = { id: crypto.randomUUID(), coachId: coach.id, title: course?.title || `Buổi học cá nhân · ${hours} giờ`, date, time, location, total, deposit, sport: sportLabel((course?.sport || selectedSport) as typeof coach.sports[number]), status: 'paid' };
    demo.addBooking(booking);
    setNotice(`Thanh toán thành công! Đã cọc ${money(deposit)}. Lịch học được lưu bên dưới.`);
    setStep('profile'); setTime('');
    paymentLock.current = false;
    learningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return <><GuestActionModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} redirectUrl={`/coaches/${coach.id}${courseId ? `?courseId=${courseId}` : ''}`} /><div className="min-h-screen bg-[#f7f9fc] pb-20 text-slate-900">
    <div className="page-container page-section">
      <Link href="/coaches" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1E5AA8]">
        <ArrowLeft size={16} /> Khám phá huấn luyện viên</Link>
      <div className="mt-6 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between bg-[#eaf0f9] px-6 py-4 text-xs font-semibold text-[#1E5AA8]">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} /> HỒ SƠ HUẤN LUYỆN VIÊN</span>
              <span>Đà Nẵng</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:gap-5">
                <CoachAvatar className="h-20 w-20 rounded-2xl sm:h-24 sm:w-24" src={coach.avatarUrl} name={coach.fullName} />
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap gap-2">{coach.sports.map(s => <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-[#1E5AA8]" key={s}>{sportLabel(s)}</span>)}</div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{coach.fullName}</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{coach.headline}</p>
                </div>
                <button onClick={() => requireLogin(() => demo.toggleFavorite(coach.id))} aria-pressed={(isAuthenticated && demo.favorites.includes(coach.id))} className="col-span-2 flex items-center gap-2 justify-self-start rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-[#1E5AA8] sm:col-span-1">
                  <Heart size={17} fill={(isAuthenticated && demo.favorites.includes(coach.id)) ? 'currentColor' : 'none'} />{(isAuthenticated && demo.favorites.includes(coach.id)) ? 'Đã yêu thích' : 'Yêu thích'}</button>
              </div>
              <div className="mt-7 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-100 py-5 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 text-xl font-bold">
                    <Star size={17} className="fill-amber-400 text-amber-400" />{displayRating.toFixed(1)}</p>
                  <p className="mt-1 text-xs text-slate-500">{coach.reviewCount + extraReviews.length} đánh giá</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{coach.experienceYears} năm</p>
                  <p className="mt-1 text-xs text-slate-500">Kinh nghiệm</p>
                </div>
                <div>
                  <p className="text-xl font-bold">1 kèm 1</p>
                  <p className="mt-1 text-xs text-slate-500">Hướng dẫn sát sao</p>
                </div>
              </div>
              <h2 className="mt-6 text-lg font-bold">Đồng hành cùng bạn trên sân</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{coach.bio}</p>
              <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold">
                <Award size={18} className="text-[#1E5AA8]" />Kinh nghiệm & chuyên môn</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{coach.headline}. {coach.experienceYears} năm kinh nghiệm huấn luyện. Trao đổi mục tiêu và điều chỉnh bài tập theo trình độ của từng học viên.</p>
              <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold">
                <MapPin size={18} className="text-[#1E5AA8]" />Địa điểm tập luyện</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{coach.districts.join(' · ')} · {coach.city}</p>
              <div className="mt-3 flex flex-wrap gap-2">{coach.preferredCourts.map(c => <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600" key={c}>{c}</span>)}</div>
            </div>
          </section>
          {isAuthenticated && <section ref={learningRef} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CalendarDays size={20} className="text-[#1E5AA8]" />Lịch học của bạn</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Theo dõi lịch học và đánh giá huấn luyện viên sau khi hoàn thành khóa học.</p>
            <div role="status" className={notice ? 'mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-[#1E5AA8]' : 'sr-only'}>{notice}</div>{bookings.length === 0 && <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">Bạn chưa có lịch học cùng {coach.fullName}.</div>}{bookings.map(b => <div key={b.id} className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{b.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">{dateLabel(b.date)} · {b.time} · {b.sport}</p>
                  <p className="mt-1 text-xs text-slate-500">{b.location}</p>
                </div>
                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-[#1E5AA8]">{b.status === 'paid' ? 'Đã cọc · Sắp học' : b.status === 'completed' ? 'Đã hoàn thành' : 'Đã đánh giá'}</span>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-500">Đã cọc: <strong className="text-slate-700">{money(b.deposit)}</strong> · Còn lại thanh toán tại sân: {money(b.total - b.deposit)}</p>{b.status === 'paid' && <button className="mt-3 rounded-lg border border-[#1E5AA8] px-4 py-2.5 text-xs font-semibold text-[#1E5AA8]" onClick={() => requireLogin(() => demo.complete(b.id))}>Hoàn thành khóa học</button>}{b.status === 'completed' && reviewId !== b.id && <button className="mt-3 rounded-lg bg-[#1E5AA8] px-4 py-2.5 text-xs font-semibold text-white" onClick={() => requireLogin(() => { setReviewId(b.id); setRating(5); setComment(''); })}>Viết đánh giá</button>}{b.status === 'completed' && reviewId === b.id && <form className="mt-5" onSubmit={e => { e.preventDefault(); if (!isAuthenticated) { setLoginOpen(true); return; } if (!comment.trim()) return; demo.review({ coachId: coach.id, bookingId: b.id, author: user?.name || 'Học viên CourtMate', rating, comment: comment.trim() }); setReviewId(''); setComment(''); setNotice('Cảm ơn bạn! Đánh giá đã được thêm vào hồ sơ HLV.'); }}>
                <fieldset>
                  <legend className="text-sm font-semibold">Trải nghiệm của bạn thế nào?</legend>
                  <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} aria-label={`${n} sao`} aria-pressed={rating === n} className="rounded p-2 text-amber-500 focus-visible:ring-2 focus-visible:ring-blue-600" onClick={() => setRating(n)}>
                    <Star size={24} fill={n <= rating ? 'currentColor' : 'none'} />
                  </button>)}</div>
                </fieldset>
                <label className="mt-3 block text-xs font-semibold">Nhận xét của bạn<textarea required maxLength={1000} className={input} rows={3} placeholder="Chia sẻ về cách hướng dẫn, bài tập và sự tiến bộ của bạn..." value={comment} onChange={e => setComment(e.target.value)} />
                </label>
                <div className="mt-3 flex gap-3">
                  <button disabled={!comment.trim()} className={primary}>Gửi đánh giá</button>
                  <button type="button" className="px-4 text-sm text-slate-500" onClick={() => setReviewId('')}>Hủy</button>
                </div>
              </form>}</div>)}</section>}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Học viên nói gì?</h2>
              <p className="flex items-center gap-1 text-sm">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <strong>{displayRating.toFixed(1)}</strong>
                <span className="text-slate-400"> / 5</span>
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">{coach.reviewCount + extraReviews.length} đánh giá từ học viên</p>{[...extraReviews, ...coach.reviews].map((r, i) => <article key={i} className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#1E5AA8]">{r.author.split(' ').pop()?.slice(0, 1)}</div>
                <div>
                  <p className="text-sm font-semibold">{r.author}</p>
                  <p className="mt-1 flex gap-0.5 text-amber-500" aria-label={`${r.rating} trên 5 sao`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} size={12} fill={n <= r.rating ? 'currentColor' : 'none'} />)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{r.comment}</p>
            </article>)}</section>
        </div>
        <aside ref={bookingRef} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E5AA8]">
            <Clock3 size={16} />LỊCH LINH HOẠT · 06:00–22:00</div>
          <p className="mt-4 text-3xl font-bold tracking-tight">{money(coach.hourlyRate)}<span className="text-sm font-normal text-slate-400"> / giờ</span>
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-500">Học theo nhịp của bạn. Chỉ cọc 20% để giữ lịch.</p>
          <ol className="my-6 flex justify-between border-y border-slate-100 py-4 text-xs">{['Hồ sơ', 'Chọn lịch', 'Thanh toán'].map((label, i) => <li key={label} className={`flex items-center gap-1.5 ${['profile', 'schedule', 'payment'].indexOf(step) >= i ? 'font-semibold text-[#1E5AA8]' : 'text-slate-400'}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">{i + 1}</span>{label}</li>)}</ol>
          {step === 'profile' && <>
            <h2 className="text-lg font-bold">Sẵn sàng cho buổi tập đầu tiên?</h2>
            <p className="my-4 text-sm leading-7 text-slate-500">Chọn buổi học cá nhân hoặc một khóa học, sau đó tìm khung giờ phù hợp với bạn.</p>
            <button onClick={scrollToBooking} className={primary}>Đặt lịch học <ArrowRight size={17} />
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />Đặt cọc 20% để giữ lịch</p>
          </>}
          {step === 'schedule' && <form onSubmit={e => { e.preventDefault(); if (validSchedule) setStep('payment'); }} className="space-y-5">
            <h2 className="text-lg font-bold">Chọn lịch phù hợp</h2>
            <label className="block text-xs font-semibold text-slate-600">Hình thức học<select className={input} value={courseId} onChange={e => { setCourseId(e.target.value); setTime(''); }}>
              <option value="">Buổi học cá nhân · 1 kèm 1</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
            </label>{course ? <p className="rounded-xl bg-blue-50 p-3 text-xs leading-6 text-[#1E5AA8]">{course.totalSessions} buổi × {course.durationPerSession} phút · {money(course.price)} / khóa. Chọn lịch buổi đầu; các buổi sau thống nhất cùng HLV.</p> : <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-600">Thời lượng<select className={input} value={hours} onChange={e => { setHours(Number(e.target.value)); setTime(''); }}>
                <option value="1">1 giờ</option>
                <option value="1.5">1,5 giờ</option>
                <option value="2">2 giờ</option>
              </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">Bộ môn<select className={input} value={selectedSport} onChange={e => setSelectedSport(e.target.value)}>{coach.sports.map(s => <option key={s} value={s}>{sportLabel(s)}</option>)}</select>
              </label>
            </div>}
            <label className="block text-xs font-semibold text-slate-600">Sân tập<select required className={input} value={location} onChange={e => setLocation(e.target.value)}>{coach.preferredCourts.map(c => <option key={c}>{c}</option>)}</select>
            </label>
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-slate-600">{course ? 'Ngày bắt đầu khóa học' : 'Ngày học'} · 14 ngày tới</legend>
              <div className="grid grid-cols-4 gap-2">{dates.map(d => <button type="button" key={d} aria-pressed={date === d} onClick={() => { setDate(d); setTime(''); }} className={`rounded-lg border px-1 py-2 text-[11px] leading-5 ${date === d ? 'border-[#1E5AA8] bg-blue-50 font-semibold text-[#1E5AA8]' : 'border-slate-200 text-slate-500 hover:border-blue-400'}`}>{dateLabel(d)}</button>)}</div>
            </fieldset>
            <fieldset disabled={!date}>
              <legend className="mb-2 text-xs font-semibold text-slate-600">Chọn giờ bắt đầu</legend>
              <div className="grid grid-cols-4 gap-2">{slots.map(t => <button type="button" key={t} aria-pressed={time === t} onClick={() => setTime(t)} className={`rounded-lg border px-2 py-2 text-xs disabled:opacity-40 ${time === t ? 'border-[#1E5AA8] bg-blue-50 font-semibold text-[#1E5AA8]' : 'border-slate-200 text-slate-500'}`}>{t}</button>)}</div>
            </fieldset>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng học phí</span>
              <strong>{money(total)}</strong>
            </div>
            <button disabled={!validSchedule} className={primary}>Tiếp tục · Cọc {money(deposit)} <ArrowRight size={16} />
            </button>
            <button type="button" className="w-full text-xs text-slate-500" onClick={() => setStep('profile')}>Quay lại hồ sơ</button>
          </form>}
          {step === 'payment' && <div className="space-y-5">
            <h2 className="text-lg font-bold">Xác nhận & thanh toán</h2>
            <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold">{course?.title || `Học cá nhân · ${hours} giờ`}</p>
              <p className="text-slate-500">{dateLabel(date)} · {time}</p>
              <p className="text-xs leading-6 text-slate-500">{location} · {course ? sportLabel(course.sport) : sportLabel(selectedSport as typeof coach.sports[number])}</p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Tổng học phí</dt>
                <dd>{money(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Thanh toán tại sân (80%)</dt>
                <dd>{money(total - deposit)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-4 font-bold">
                <dt>Cọc hôm nay (20%)</dt>
                <dd className="text-[#1E5AA8]">{money(deposit)}</dd>
              </div>
            </dl>
            <fieldset>
              <legend className="mb-3 text-xs font-semibold text-slate-600">Phương thức thanh toán</legend>{['Ví CourtMate', 'Thẻ ngân hàng'].map(p => <label key={p} className="mb-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-xs">
                <input type="radio" name="payment" value={p} checked={payment === p} onChange={() => setPayment(p)} />
                <CreditCard size={17} />{p}</label>)}</fieldset>
            <button disabled={!demo.ready} onClick={pay} className={primary}>
              <CheckCircle2 size={17} />Thanh toán cọc {money(deposit)}</button>
            <button className="w-full text-xs font-medium text-slate-500" onClick={() => setStep('schedule')}>Quay lại chọn lịch</button>
          </div>}
        </aside>
      </div>
    </div>
  </div></>;
}
