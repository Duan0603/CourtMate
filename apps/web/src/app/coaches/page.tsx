'use client';

import { PageContainer } from '../../components/layout/PageContainer';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, MapPin, Search, SlidersHorizontal, Star, Users, X } from 'lucide-react';
import { Drawer, Select, notification } from 'antd';
import { SportType } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { GuestActionModal } from '../../components/shared/GuestActionModal';
import { FavoriteButton } from '../../components/shared/FavoriteButton';
import { CoachAvatar } from '../../components/shared/CoachAvatar';
import { MOCK_COACHES, MOCK_COURSES, money, sportLabel } from '../../lib/coaches.mock';
import { useCoachDemo } from '../../lib/coach-demo-store';
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
  const [draft, setDraft] = useState({ sport: '', district: '', budget: '', minRating: '', minExperience: '' });
  const demo = useCoachDemo();
  const { isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/coaches');
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
      notificationApi.success({
        message: saved ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích',
        description: saved ? `${name} đã được lưu trong Hồ sơ → Yêu thích → Huấn luyện viên.` : `${name} đã được xóa khỏi mục Yêu thích của bạn.`,
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setPendingFavorites(previous => previous.filter(id => id !== coachId));
    }
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
            Trở thành HLV đối tác <ArrowUpRight size={17} />
          </Link>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Search size={18} className={styles.searchIcon} />
            <input aria-label={tab === 'courses' ? 'Tìm khóa học' : 'Tìm huấn luyện viên'} placeholder={tab === 'courses' ? 'Tên khóa học, huấn luyện viên, sân tập…' : 'Tên huấn luyện viên, chuyên môn, sân tập…'} value={keyword} onChange={event => setKeyword(event.target.value)} />
            {keyword && <button aria-label="Xóa tìm kiếm" onClick={() => setKeyword('')} className={styles.iconButton}><X size={17} /></button>}
          </div>
          <button className={styles.filterButton} aria-expanded={filtersOpen} aria-haspopup="dialog" onClick={() => { setDraft({ sport, district, budget, minRating, minExperience }); setFiltersOpen(true); }}><SlidersHorizontal size={17} /> Bộ lọc{filterCount > 0 && <span>{filterCount}</span>}</button>
        </div>

        <div className={styles.layout}>
          <section className={styles.results} aria-label="Danh sách huấn luyện và khóa học">
            <div className={styles.tabs} role="tablist" aria-label="Nội dung huấn luyện">
              {[['coaches', 'Huấn luyện viên'], ['courses', 'Khóa học']].map(([value, label]) => <button key={value} id={`tab-${value}`} role="tab" aria-selected={tab === value} aria-controls="coach-results" tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'coaches' : event.key === 'End' ? 'courses' : tab === 'coaches' ? 'courses' : 'coaches'; setTab(next); document.getElementById(`tab-${next}`)?.focus(); } }} className={tab === value ? styles.activeTab : ''}>{label}<span>{value === 'coaches' ? MOCK_COACHES.length : MOCK_COURSES.length}</span></button>)}
            </div>
            {(filterCount > 0 || keyword) && <div className={styles.activeFilters}>{[[sport ? sportLabel(sport as SportType) : '', () => setSport('')], [district, () => setDistrict('')], [budget ? `Đến ${money(Number(budget))}/giờ` : '', () => setBudget('')], [minRating ? `Từ ${minRating} sao` : '', () => setMinRating('')], [minExperience ? `Từ ${minExperience} năm kinh nghiệm` : '', () => setMinExperience('')], [keyword ? `“${keyword}”` : '', () => setKeyword('')]].map(([label, remove], index) => label && <button key={index} onClick={remove as () => void}>{label as string}<X size={13} /><span className="sr-only">Xóa bộ lọc</span></button>)}<button className={styles.clearFilters} onClick={reset}>Xóa tất cả</button></div>}

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
                <div className={styles.sports}><span>{sportLabel(course.sport)}</span><span className={styles.courseLevel}>{course.level}</span></div>
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
      <Drawer title="Bộ lọc" open={filtersOpen} onClose={() => setFiltersOpen(false)} width={400} rootClassName={styles.filterDrawer} footer={<div className={styles.drawerActions}><button onClick={() => setDraft({ sport: '', district: '', budget: '', minRating: '', minExperience: '' })}>Đặt lại</button><button onClick={() => { setSport(draft.sport); setDistrict(draft.district); setBudget(draft.budget); setMinRating(draft.minRating); setMinExperience(draft.minExperience); setFiltersOpen(false); }}>Áp dụng</button></div>}>
        <fieldset className={styles.drawerGroup}>
          <legend>Môn thể thao</legend>
          <div className={styles.filterChoices}>{[['', 'Tất cả'], [SportType.BADMINTON, 'Cầu lông'], [SportType.PICKLEBALL, 'Pickleball']].map(([value, label]) => <button key={value} aria-pressed={draft.sport === value} onClick={() => setDraft({ ...draft, sport: value })}>{label}</button>)}</div>
        </fieldset>
        <div className={styles.drawerGroup}>
          <label htmlFor="filter-district">Khu vực (Đà Nẵng)</label>
          <Select id="filter-district" aria-label="Lọc theo quận" value={draft.district} onChange={value => setDraft({ ...draft, district: value })} size="large" options={[{ value: '', label: 'Tất cả các quận' }, ...districts.map(value => ({ value, label: `Quận ${value}` }))]} />
        </div>
        <fieldset className={styles.drawerGroup}>
          <legend>Đánh giá của học viên</legend>
          <div className={styles.filterChoices}>{[['', 'Tất cả'], ['4', 'Từ 4 sao'], ['4.5', 'Từ 4,5 sao'], ['4.9', 'Từ 4,9 sao']].map(([value, label]) => <button key={value} aria-pressed={draft.minRating === value} onClick={() => setDraft({ ...draft, minRating: value })}>{value && <Star size={14} />} {label}</button>)}</div>
        </fieldset>
        <fieldset className={styles.drawerGroup}>
          <legend>Kinh nghiệm huấn luyện</legend>
          <div className={styles.filterChoices}>{[['', 'Tất cả'], ['5', 'Từ 5 năm'], ['10', 'Từ 10 năm'], ['15', 'Từ 15 năm']].map(([value, label]) => <button key={value} aria-pressed={draft.minExperience === value} onClick={() => setDraft({ ...draft, minExperience: value })}>{label}</button>)}</div>
        </fieldset>
        <div className={styles.drawerGroup}>
          <label htmlFor="coach-budget">Ngân sách mỗi giờ</label>
          <div className={styles.budgetValue}><span>Học phí tối đa</span><output htmlFor="coach-budget">{draft.budget ? money(Number(draft.budget)) : 'Mọi mức giá'}</output></div>
          <input id="coach-budget" type="range" min="0" max="500000" step="25000" value={draft.budget || '500000'} aria-valuetext={draft.budget ? `${money(Number(draft.budget))} mỗi giờ` : 'Mọi mức giá'} onChange={event => setDraft({ ...draft, budget: event.target.value === '500000' ? '' : event.target.value })} />
          <div className={styles.rangeLabels}><span>0đ</span><span>250.000đ</span><span>500.000đ+</span></div>
          <p className={styles.filterHint}>{tab === 'courses' ? 'Ngân sách được quy đổi theo tổng số giờ của khóa học.' : 'Kéo để chọn mức học phí phù hợp với bạn.'}</p>
        </div>
      </Drawer>
      <GuestActionModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} redirectUrl={redirectUrl} />
    </div>
  );
}
