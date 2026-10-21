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
import { emitUserNotification } from '../../../lib/notifications-api';

const input = 'cm-control mt-2 w-full rounded-xl border border-ink bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary';
const primary = 'cm-button cm-action flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40';
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
  const setNotice = (body: string) => { if (body) void emitUserNotification({ type: 'COACH_ACTIVITY', title: 'Cập nhật học tập', body, link: '/coaches/' + params.id }); };
  const paymentLock = useRef(false);
  const bookingRef = useRef<HTMLElement>(null);
  const learningRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isAuthenticated) { setStep('profile'); setReviewId(''); }
  }, [isAuthenticated]);
  if (!coach) return <div className="mx-auto max-w-xl px-5 py-24 text-center">
    <h1 className="text-2xl font-bold">Không tìm thấy huấn luyện viên</h1>
    <p className="mt-3 text-muted">Hồ sơ này hiện không khả dụng.</p>
    <Link href="/coaches" className="cm-link mt-6 inline-block text-primary">Danh sách huấn luyện viên</Link>
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
  const scrollToBooking = () => requireLogin(() => { setStep('schedule'); bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
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
  return <><GuestActionModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} redirectUrl={`/coaches/${coach.id}${courseId ? `?courseId=${courseId}` : ''}`} /><div className="min-h-screen bg-canvas pb-20 text-ink">
    <div className="page-container page-section">
      <Link href="/coaches" className="cm-link inline-flex items-center gap-2 text-sm text-muted hover:text-primary">
        <ArrowLeft size={16} /> Danh sách huấn luyện viên</Link>
      <div className="mt-6 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-ink bg-surface shadow-card">

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:gap-5">
                <CoachAvatar className="h-20 w-20 rounded-2xl sm:h-24 sm:w-24" src={coach.avatarUrl} name={coach.fullName} />
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap gap-2">{coach.sports.map(s => <span className="rounded-md bg-accent-baby px-2 py-1 text-xs font-medium text-primary" key={s}>{sportLabel(s)}</span>)}</div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{coach.fullName}</h1>
                  <p className="mt-2 text-sm leading-6 text-muted">{coach.headline}</p>
                </div>
                <button
                  onClick={() =>
                    requireLogin(async () => {
                      const wasFav = isAuthenticated && demo.favorites.includes(coach.id);
                      const saved = await demo.toggleFavorite(coach.id);

                    })
                  }
                  aria-pressed={isAuthenticated && demo.favorites.includes(coach.id)}
                  className="cm-button col-span-2 flex items-center gap-2 justify-self-start rounded-xl border border-ink px-3 py-2.5 text-xs font-semibold text-primary sm:col-span-1"
                >
                  <Heart
                    size={17}
                    fill={isAuthenticated && demo.favorites.includes(coach.id) ? 'currentColor' : 'none'}
                  />
                  {isAuthenticated && demo.favorites.includes(coach.id) ? 'Đã yêu thích' : 'Yêu thích'}
                </button>
              </div>
              <div className="mt-7 grid grid-cols-3 divide-x divide-ink border-y border-ink py-5 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 text-xl font-bold">
                    <Star size={17} className="fill-primary text-primary" />{displayRating.toFixed(1)}</p>
                  <p className="mt-1 text-sm text-muted">{coach.reviewCount + extraReviews.length} đánh giá</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{coach.experienceYears} năm</p>
                  <p className="mt-1 text-sm text-muted">Kinh nghiệm</p>
                </div>
                <div>
                  <p className="text-xl font-bold">1 kèm 1</p>
                  <p className="mt-1 text-sm text-muted">Hướng dẫn sát sao</p>
                </div>
              </div>
              <h2 className="mt-6 text-lg font-bold">Giới thiệu</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{coach.bio}</p>


              <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold">
                <MapPin size={18} className="text-primary" />Địa điểm tập luyện</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{coach.districts.join(' · ')} · {coach.city}</p>
              <div className="mt-3 flex flex-wrap gap-2">{coach.preferredCourts.map(c => <span className="rounded-lg bg-white px-3 py-2 text-xs text-muted" key={c}>{c}</span>)}</div>
            </div>
          </section>
          {isAuthenticated && <section ref={learningRef} className="scroll-mt-24 rounded-2xl border border-ink bg-surface shadow-card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CalendarDays size={20} className="text-primary" />Lịch học của bạn</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Theo dõi lịch học và đánh giá huấn luyện viên sau khi hoàn thành khóa học.</p>
            {bookings.length === 0 && <div className="mt-5 rounded-xl border border-dashed border-ink py-8 text-center text-sm text-muted">Bạn chưa có lịch học cùng {coach.fullName}.</div>}{bookings.map(b => <div key={b.id} className="mt-5 border-t border-ink pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted">{dateLabel(b.date)} · {b.time} · {b.sport}</p>
                  <p className="mt-1 text-sm text-muted">{b.location}</p>
                </div>
                <span className="rounded-lg bg-accent-baby px-3 py-2 text-xs text-primary">{b.status === 'paid' ? 'Đã cọc · Sắp học' : b.status === 'completed' ? 'Đã hoàn thành' : 'Đã đánh giá'}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">Đã cọc: <strong className="text-muted">{money(b.deposit)}</strong> · Còn lại thanh toán tại sân: {money(b.total - b.deposit)}</p>{b.status === 'paid' && <button className="cm-button mt-3 rounded-lg border border-primary px-4 py-2.5 text-xs font-semibold text-primary" onClick={() => requireLogin(() => { demo.complete(b.id); setNotice('Bạn đã hoàn thành khóa học. Hãy chia sẻ đánh giá về trải nghiệm của mình.'); })}>Hoàn thành khóa học</button>}{b.status === 'completed' && reviewId !== b.id && <button className="cm-action cm-button mt-3 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white" onClick={() => requireLogin(() => { setReviewId(b.id); setRating(5); setComment(''); })}>Viết đánh giá</button>}{b.status === 'completed' && reviewId === b.id && <form className="mt-5" onSubmit={e => { e.preventDefault(); if (!isAuthenticated) { setLoginOpen(true); return; } if (!comment.trim()) return; demo.review({ coachId: coach.id, bookingId: b.id, author: user?.name || 'Học viên CourtMate', rating, comment: comment.trim() }); setReviewId(''); setComment(''); setNotice('Cảm ơn bạn! Đánh giá đã được thêm vào hồ sơ HLV.'); }}>
                <fieldset>
                  <legend className="text-sm font-semibold">Trải nghiệm của bạn thế nào?</legend>
                  <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} aria-label={`${n} sao`} aria-pressed={rating === n} className="cm-button rounded p-2 text-primary focus-visible:ring-2 focus-visible:ring-primary" onClick={() => setRating(n)}>
                    <Star size={24} fill={n <= rating ? 'currentColor' : 'none'} />
                  </button>)}</div>
                </fieldset>
                <label className="mt-3 block text-sm font-semibold">Nhận xét của bạn<textarea required maxLength={1000} className={input} rows={3} placeholder="Chia sẻ về cách hướng dẫn, bài tập và sự tiến bộ của bạn..." value={comment} onChange={e => setComment(e.target.value)} />
                </label>
                <div className="mt-3 flex gap-3">
                  <button disabled={!comment.trim()} className={primary}>Gửi đánh giá</button>
                  <button type="button" className="cm-button px-4 text-sm text-muted" onClick={() => setReviewId('')}>Hủy</button>
                </div>
              </form>}</div>)}</section>}
          <section className="rounded-2xl border border-ink bg-surface shadow-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Đánh giá của học viên</h2>
              <p className="flex items-center gap-1 text-sm">
                <Star size={16} className="fill-primary text-primary" />
                <strong>{displayRating.toFixed(1)}</strong>
                <span className="text-muted"> / 5</span>
              </p>
            </div>
            <p className="mt-2 text-sm text-muted">{coach.reviewCount + extraReviews.length} đánh giá từ học viên</p>{[...extraReviews, ...coach.reviews].map((r, i) => <article key={i} className="mt-5 border-t border-ink pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-baby text-sm font-bold text-primary">{r.author.split(' ').pop()?.slice(0, 1)}</div>
                <div>
                  <p className="text-sm font-semibold">{r.author}</p>
                  <p className="mt-1 flex gap-0.5 text-primary" aria-label={`${r.rating} trên 5 sao`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} size={12} fill={n <= r.rating ? 'currentColor' : 'none'} />)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{r.comment}</p>
            </article>)}</section>
        </div>
        <aside ref={bookingRef} className="scroll-mt-24 rounded-2xl border border-ink bg-surface shadow-card p-6  lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Clock3 size={16} />Giờ học: 06:00–22:00</div>
          <p className="mt-4 text-3xl font-bold tracking-tight">{money(coach.hourlyRate)}<span className="text-sm font-normal text-muted"> / giờ</span>
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">Đặt cọc 20%, trả phần còn lại tại sân.</p>
          <ol className="my-6 flex justify-between border-y border-ink py-4 text-xs">{['Hồ sơ', 'Chọn lịch', 'Thanh toán'].map((label, i) => <li key={label} className={`flex items-center gap-1.5 ${['profile', 'schedule', 'payment'].indexOf(step) >= i ? 'font-semibold text-primary' : 'text-muted'}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">{i + 1}</span>{label}</li>)}</ol>
          {step === 'profile' && <>
            <h2 className="text-lg font-bold">Đặt lịch học</h2>
            <p className="my-4 text-sm leading-7 text-muted">Chọn hình thức học và thời gian.</p>
            <button onClick={scrollToBooking} className={primary}>Đặt lịch học <ArrowRight size={17} />
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
              <ShieldCheck size={15} />Đặt cọc 20% để giữ lịch</p>
          </>}
          {step === 'schedule' && <form onSubmit={e => { e.preventDefault(); if (validSchedule) setStep('payment'); }} className="space-y-5">
            <h2 className="text-lg font-bold">Chọn lịch phù hợp</h2>
            <label className="block text-sm font-semibold text-muted">Hình thức học<select className={input} value={courseId} onChange={e => { setCourseId(e.target.value); setTime(''); }}>
              <option value="">Buổi học cá nhân · 1 kèm 1</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
            </label>{course ? <p className="rounded-xl bg-accent-baby p-3 text-sm leading-6 text-primary">{course.totalSessions} buổi × {course.durationPerSession} phút · {money(course.price)} / khóa. Chọn lịch buổi đầu; các buổi sau thống nhất cùng HLV.</p> : <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold text-muted">Thời lượng<select className={input} value={hours} onChange={e => { setHours(Number(e.target.value)); setTime(''); }}>
                <option value="1">1 giờ</option>
                <option value="1.5">1,5 giờ</option>
                <option value="2">2 giờ</option>
              </select>
              </label>
              <label className="text-sm font-semibold text-muted">Bộ môn<select className={input} value={selectedSport} onChange={e => setSelectedSport(e.target.value)}>{coach.sports.map(s => <option key={s} value={s}>{sportLabel(s)}</option>)}</select>
              </label>
            </div>}
            <label className="block text-sm font-semibold text-muted">Sân tập<select required className={input} value={location} onChange={e => setLocation(e.target.value)}>{coach.preferredCourts.map(c => <option key={c}>{c}</option>)}</select>
            </label>
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-muted">{course ? 'Ngày bắt đầu khóa học' : 'Ngày học'} · 14 ngày tới</legend>
              <div className="grid grid-cols-4 gap-2">{dates.map(d => <button type="button" key={d} aria-pressed={date === d} onClick={() => { setDate(d); setTime(''); }} className={`cm-button rounded-lg border px-1 py-2 text-[11px] leading-5 ${date === d ? 'border-primary bg-accent-baby font-semibold text-primary' : 'border-ink text-muted hover:border-ink'}`}>{dateLabel(d)}</button>)}</div>
            </fieldset>
            <fieldset disabled={!date}>
              <legend className="mb-2 text-xs font-semibold text-muted">Chọn giờ bắt đầu</legend>
              <div className="grid grid-cols-4 gap-2">{slots.map(t => <button type="button" key={t} aria-pressed={time === t} onClick={() => setTime(t)} className={`cm-button rounded-lg border px-2 py-2 text-xs disabled:opacity-40 ${time === t ? 'border-primary bg-accent-baby font-semibold text-primary' : 'border-ink text-muted'}`}>{t}</button>)}</div>
            </fieldset>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Tổng học phí</span>
              <strong>{money(total)}</strong>
            </div>
            <button disabled={!validSchedule} className={primary}>Tiếp tục · Cọc {money(deposit)} <ArrowRight size={16} />
            </button>
            <button type="button" className="cm-button w-full text-xs text-muted" onClick={() => setStep('profile')}>Quay lại hồ sơ</button>
          </form>}
          {step === 'payment' && <div className="space-y-5">
            <h2 className="text-lg font-bold">Xác nhận & thanh toán</h2>
            <div className="space-y-2 rounded-xl bg-white p-4 text-sm">
              <p className="font-semibold">{course?.title || `Học cá nhân · ${hours} giờ`}</p>
              <p className="text-muted">{dateLabel(date)} · {time}</p>
              <p className="text-sm leading-6 text-muted">{location} · {course ? sportLabel(course.sport) : sportLabel(selectedSport as typeof coach.sports[number])}</p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Tổng học phí</dt>
                <dd>{money(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Thanh toán tại sân (80%)</dt>
                <dd>{money(total - deposit)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink pt-4 font-bold">
                <dt>Cọc hôm nay (20%)</dt>
                <dd className="text-primary">{money(deposit)}</dd>
              </div>
            </dl>
            <fieldset>
              <legend className="mb-3 text-xs font-semibold text-muted">Phương thức thanh toán</legend>{['Ví CourtMate', 'Thẻ ngân hàng'].map(p => <label key={p} className="mb-2 flex cursor-pointer items-center gap-3 rounded-xl border border-ink p-3 text-sm">
                <input type="radio" name="payment" value={p} checked={payment === p} onChange={() => setPayment(p)} />
                <CreditCard size={17} />{p}</label>)}</fieldset>
            <button disabled={!demo.ready} onClick={pay} className={primary}>
              <CheckCircle2 size={17} />Thanh toán cọc {money(deposit)}</button>
            <button className="cm-button w-full text-xs font-medium text-muted" onClick={() => setStep('schedule')}>Quay lại chọn lịch</button>
          </div>}
        </aside>
      </div>
    </div>
  </div></>;
}
