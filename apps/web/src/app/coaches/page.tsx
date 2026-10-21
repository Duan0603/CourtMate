'use client';

import { PageContainer } from '../../components/layout/PageContainer';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, MapPin, Search, SlidersHorizontal, Star, Users, X, Check } from 'lucide-react';
import { notification } from 'antd';
import { SportType } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { GuestActionModal } from '../../components/shared/GuestActionModal';
import { FavoriteButton } from '../../components/shared/FavoriteButton';
import { CoachAvatar } from '../../components/shared/CoachAvatar';
import { MOCK_COACHES, MOCK_COURSES, money, sportLabel } from '../../lib/coaches.mock';
import { useCoachDemo } from '../../lib/coach-demo-store';
import { emitFavoriteNotification } from '../../lib/notifications-api';
import { CoachFilters } from '../../components/coaches/CoachFilters';
import styles from './coaches.module.css';

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
const districts = Array.from(new Set(MOCK_COACHES.flatMap(coach => coach.districts)));

export default function CoachesPage() {
  const [notificationApi, notificationHolder] = notification.useNotification();
  const [tab, setTab] = useState('coaches');
  const [keyword, setKeyword] = useState('');
  const [sport, setSport] = useState('');
  const [district, setDistrict] = useState('');
  const [budget, setBudget] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [pendingFavorites, setPendingFavorites] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const demo = useCoachDemo();
  const { isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/coaches');
  const [favoriteCourses, setFavoriteCourses] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('courtmate_favorite_courses');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const favorites = isAuthenticated ? demo.favorites : [];
  const requireLogin = (action: () => void, redirect = '/coaches') => {
    if (!isAuthenticated) { setRedirectUrl(redirect); setLoginOpen(true); return; }
    action();
  };
  const toggleFavorite = async (coachId: string, name: string) => {
    if (pendingFavorites.includes(coachId)) return;
    const wasFavorite = favorites.includes(coachId);
    setPendingFavorites(previous => [...previous, coachId]);
    try {
      const saved = await demo.toggleFavorite(coachId);
      if (saved === wasFavorite) return;
      if (saved) {
        void emitFavoriteNotification({
          type: 'FAVORITE_COACH',
          title: 'Yêu thích huấn luyện viên',
          body: `Đã lưu HLV ${name} vào danh sách yêu thích.`,
          link: `/coaches/${coachId}`,
        });
      }
      notificationApi.success({
        message: saved ? 'Đã lưu thành công' : 'Đã bỏ lưu thành công',
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setPendingFavorites(previous => previous.filter(id => id !== coachId));
    }
  };

  const toggleCourseFavorite = (course: typeof MOCK_COURSES[number]) => {
    const wasFav = favoriteCourses.includes(course.id);
    const next = wasFav ? favoriteCourses.filter(id => id !== course.id) : [...favoriteCourses, course.id];
    setFavoriteCourses(next);
    try {
      localStorage.setItem('courtmate_favorite_courses', JSON.stringify(next));
    } catch {}

    if (!wasFav) {
      void emitFavoriteNotification({
        type: 'FAVORITE_COURSE',
        title: 'Yêu thích khóa học',
        body: `Đã lưu khóa học "${course.title}" của HLV ${course.coachName} vào danh sách yêu thích.`,
        link: `/coaches/${course.coachId}?courseId=${course.id}`,
      });
    }

    notificationApi.success({
      message: !wasFav ? 'Đã lưu thành công' : 'Đã bỏ lưu thành công',
      placement: 'topRight',
      duration: 3,
    });
  };
  const reset = () => { setKeyword(''); setSport(''); setDistrict(''); setBudget(''); setMinRating(''); setMinExperience(''); };
  const filterCount = [sport, district, budget, minRating, minExperience].filter(Boolean).length;
  const ratedCoaches = MOCK_COACHES.map(coach => {
    const reviews = demo.reviews.filter(review => review.coachId === coach.id);
    return { ...coach, rating: (coach.rating * coach.reviewCount + reviews.reduce((sum, review) => sum + review.rating, 0)) / (coach.reviewCount + reviews.length), reviewCount: coach.reviewCount + reviews.length };
  });
  const matchesQualifications = (coach: typeof ratedCoaches[number]) => (!minRating || coach.rating >= Number(minRating)) && (!minExperience || coach.experienceYears >= Number(minExperience));
  const coaches = ratedCoaches.filter(coach => matchesQualifications(coach) && (!sport || coach.sports.includes(sport as SportType)) && (!district || coach.districts.includes(district)) && (!budget || coach.hourlyRate <= Number(budget)) && normalize(`${coach.fullName} ${coach.headline} ${coach.bio} ${coach.districts.join(' ')} ${coach.preferredCourts.join(' ')}`).includes(normalize(keyword)));
  const courses = MOCK_COURSES.filter(course => {
    const coach = ratedCoaches.find(item => item.id === course.coachId);
    return coach && matchesQualifications(coach) && (!sport || course.sport === sport) && (!district || coach.districts.includes(district)) && (!budget || course.price / (course.totalSessions * course.durationPerSession / 60) <= Number(budget)) && normalize(`${course.title} ${course.coachName} ${course.location}`).includes(normalize(keyword));
  });
  const resultCount = tab === 'courses' ? courses.length : coaches.length;

  return (
    <div className={`${styles.page} page-section`}>
      {notificationHolder}
      <PageContainer>
        <header className={styles.header}>
          <div>
            <h1>Huấn luyện viên</h1>
            <p>Khám phá huấn luyện viên cầu lông và pickleball tại các sân Đà Nẵng.</p>
          </div>
          <Link className={styles.partnerLink} href="/coaches/register">
            Đăng ký làm huấn luyện viên <ArrowUpRight size={17} />
          </Link>
        </header>

        {/* Main Toolbar (Search & Filter) - Synchronized with Tournaments UI */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          {/* Main Search Bar Container */}
          <div className="flex flex-1 items-center bg-surface shadow-card rounded-2xl sm:rounded-full border border-slate-200/90 hover:border-primary/40 transition-all p-2 w-full">
            {/* District Selector Dropdown Pill */}
            <div className="relative shrink-0" ref={districtRef}>
              <button
                type="button"
                onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                className={`cm-button flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 text-navy font-bold text-xs sm:text-sm pl-3.5 pr-3 py-2.5 rounded-xl sm:rounded-full outline-none transition-all border ${
                  isDistrictOpen ? 'border-primary bg-slate-100' : 'border-slate-200/60'
                }`}
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate max-w-[120px]">
                  {district ? `Quận ${district}` : 'Tất cả khu vực'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isDistrictOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDistrictOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-surface shadow-card rounded-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      setDistrict('');
                      setIsDistrictOpen(false);
                    }}
                    className={`cm-button w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                      !district
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-4 h-4 ${!district ? 'text-primary' : 'text-muted'}`} />
                      <span>Tất cả các quận</span>
                    </div>
                    {!district && <Check className="w-4 h-4 text-primary" />}
                  </button>
                  {districts.map((d) => {
                    const isSelected = district === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setDistrict(d);
                          setIsDistrictOpen(false);
                        }}
                        className={`cm-button w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-muted hover:bg-slate-50 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted'}`} />
                          <span>Quận {d}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-6 bg-slate-200 mx-2 shrink-0 hidden sm:block" />

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder={tab === 'courses' ? 'Tìm tên khóa học, huấn luyện viên, sân tập...' : 'Tìm tên huấn luyện viên, chuyên môn, sân tập...'}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="cm-control w-full bg-transparent pl-9 pr-4 py-2 text-xs sm:text-sm outline-none text-navy placeholder:text-muted font-medium"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="cm-button mr-2 text-muted hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={`cm-button shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold transition-all ${
              filterCount > 0
                ? 'bg-primary text-white hover:bg-primary-dark border border-primary'
                : 'bg-surface shadow-card text-navy border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc {filterCount > 0 && `· ${filterCount}`}</span>
            {filterCount > 0 && (
              <div
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
              >
                <X className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </div>

        {/* ACTIVE FILTER CHIPS ROW */}
        {(filterCount > 0 || keyword) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {sport && (
              <button
                type="button"
                onClick={() => setSport('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Môn: {sportLabel(sport as SportType)}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {district && (
              <button
                type="button"
                onClick={() => setDistrict('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Khu vực: Q. {district}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {budget && (
              <button
                type="button"
                onClick={() => setBudget('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Học phí: Đến {money(Number(budget))}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {minRating && (
              <button
                type="button"
                onClick={() => setMinRating('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Đánh giá: Từ {minRating} sao</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {minExperience && (
              <button
                type="button"
                onClick={() => setMinExperience('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Kinh nghiệm: Từ {minExperience} năm</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Từ khóa: “{keyword}”</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors ml-1 underline underline-offset-2"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Tabs and Results Section */}
        <div className={styles.layout}>
          <section className={styles.results} aria-label="Danh sách huấn luyện và khóa học">
            <div className={styles.tabs} role="tablist" aria-label="Nội dung huấn luyện">
              {[['coaches', 'Huấn luyện viên'], ['courses', 'Khóa học']].map(([value, label]) => (
                <button
                  key={value}
                  id={`tab-${value}`}
                  role="tab"
                  aria-selected={tab === value}
                  aria-controls="coach-results"
                  tabIndex={tab === value ? 0 : -1}
                  onClick={() => setTab(value)}
                  onKeyDown={(event) => {
                    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                      event.preventDefault();
                      const next = event.key === 'Home' ? 'coaches' : event.key === 'End' ? 'courses' : tab === 'coaches' ? 'courses' : 'coaches';
                      setTab(next);
                      document.getElementById(`tab-${next}`)?.focus();
                    }
                  }}
                  className={tab === value ? styles.activeTab : ''}
                >
                  {label}
                  <span>{value === 'coaches' ? MOCK_COACHES.length : MOCK_COURSES.length}</span>
                </button>
              ))}
            </div>

            <div id="coach-results" role="tabpanel" aria-labelledby={`tab-${tab}`}>
              {tab === 'coaches' ? <div className={styles.grid}>{coaches.map(coach => <article key={coach.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <CoachAvatar className={styles.avatar} src={coach.avatarUrl} name={coach.fullName} />
                  <div className={styles.identity}><h2><Link href={`/coaches/${coach.id}`}>{coach.fullName}</Link></h2><p className={styles.experience}>{coach.experienceYears} năm huấn luyện</p></div>
                  <FavoriteButton className={styles.favorite} selected={favorites.includes(coach.id)} name={coach.fullName} pending={pendingFavorites.includes(coach.id)} onToggle={() => requireLogin(() => { void toggleFavorite(coach.id, coach.fullName); })} />
                </div>
                <div className={styles.cardMeta}><div className={styles.sports}>{coach.sports.map(value => <span key={value}>{sportLabel(value)}</span>)}</div><div className={styles.rating}><Star size={15} fill="currentColor" /><strong>{coach.rating.toFixed(1)}</strong><span>({coach.reviewCount})</span><span className="sr-only">đánh giá</span></div></div>
                <p className={styles.headline}>{coach.headline}</p>
                <details className={styles.venues}>
                  <summary><MapPin size={17} /><span><strong>{coach.preferredCourts[0]} {coach.preferredCourts.length > 1 && <small>+{coach.preferredCourts.length - 1} sân</small>}</strong><span>Q. {coach.districts.join(' · Q. ')}</span></span><ChevronDown size={16} /></summary>
                  <div><p className={styles.venueLabel}>Các sân huấn luyện</p>{coach.preferredCourts.map(court => <p key={court}>{court}</p>)}</div>
                </details>
                <div className={styles.cardFooter}><p><span>Học phí mỗi giờ</span><strong>{money(coach.hourlyRate)}</strong></p><Link href={`/coaches/${coach.id}`} aria-label={`Xem hồ sơ ${coach.fullName}`}>Xem hồ sơ <ArrowRight size={17} /></Link></div>
              </article>)}</div> : <div className={styles.grid}>{courses.map(course => <article key={course.id} className={`${styles.card} ${styles.courseCard}`}>
                <div className={styles.sports} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{sportLabel(course.sport)}</span>
                    <span className={styles.courseLevel}>{course.level}</span>
                  </div>
                  <FavoriteButton
                    className={styles.favorite}
                    selected={favoriteCourses.includes(course.id)}
                    name={course.title}
                    onToggle={() => requireLogin(() => { void toggleCourseFavorite(course); })}
                  />
                </div>
                <h2><Link href={`/coaches/${course.coachId}?courseId=${course.id}`}>{course.title}</Link></h2>
                <Link className={styles.courseCoach} href={`/coaches/${course.coachId}`}>HLV {course.coachName}<ArrowUpRight size={14} /></Link>
                <p className={styles.courseDescription}>{course.description}</p>
                <div className={styles.facts}><p><CalendarDays size={16} /><span>{course.totalSessions} buổi × {course.durationPerSession} phút</span></p><p><MapPin size={16} /><span>{course.location}</span></p><p><Users size={16} /><span>{course.enrolledCount}/{course.maxStudents} học viên đã đăng ký</span></p></div>
                <div className={styles.cardFooter}><p><strong>{money(course.price)}</strong><span> / khóa</span></p><Link href={`/coaches/${course.coachId}?courseId=${course.id}`}>Xem khóa học <ArrowRight size={16} /></Link></div>
              </article>)}</div>}
              {resultCount === 0 && <div className={styles.empty}><Search size={28} /><h2>Chưa tìm thấy kết quả phù hợp</h2><p>Thử một từ khóa khác hoặc mở rộng bộ môn, khu vực và ngân sách.</p><button onClick={reset}>Xóa bộ lọc <ArrowRight size={16} /></button></div>}
            </div>
            <p className={styles.demoNote}>Hồ sơ và khóa học hiện là dữ liệu minh họa.</p>
          </section>
        </div>
      </PageContainer>
      {/* ─── FILTER DRAWER ─── */}
      <div
        className={`fixed inset-0 bg-navy/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          filtersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setFiltersOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          filtersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <CoachFilters
          isOpen={filtersOpen}
          initialFilters={{
            sport,
            district,
            budget,
            minRating,
            minExperience,
          }}
          districts={districts}
          tab={tab}
          onApply={(applied) => {
            setSport(applied.sport);
            setDistrict(applied.district);
            setBudget(applied.budget);
            setMinRating(applied.minRating);
            setMinExperience(applied.minExperience);
            setFiltersOpen(false);
          }}
          onClose={() => setFiltersOpen(false)}
        />
      </div>
      <GuestActionModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} redirectUrl={redirectUrl} />
    </div>
  );
}
