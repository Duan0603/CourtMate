'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Star } from 'lucide-react';
import { Tournament } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { MOCK_COACHES, money, sportLabel } from '../../lib/coaches.mock';
import { CoachAvatar } from '../shared/CoachAvatar';
import { TournamentCard } from '../tournaments/TournamentCard';
import { FavoriteButton } from '../shared/FavoriteButton';

export function FavoritesPanel({ tournaments, loading }: { tournaments: Tournament[]; loading: boolean }) {
  const { user, toggleBookmark, toggleCoachFavorite } = useAuth();
  const [category, setCategory] = useState<'tournaments' | 'coaches'>('tournaments');
  const [pending, setPending] = useState<string[]>([]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('category') === 'coaches') setCategory('coaches');
  }, []);
  const coaches = MOCK_COACHES.filter(c => user?.bookmarkedCoaches?.includes(c.id));
  const saved = tournaments.filter(t => user?.bookmarkedTournaments?.includes(t.id));
  const count = (user?.bookmarkedTournaments?.length || 0) + (user?.bookmarkedCoaches?.length || 0);
  async function removeCoach(id: string) {
    setPending(ids => [...ids, id]);
    try { await toggleCoachFavorite(id); } finally { setPending(ids => ids.filter(item => item !== id)); }
  }
  return <section className="space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Yêu thích</h2>
          <p className="mt-2 text-sm text-slate-500">Những giải đấu và huấn luyện viên bạn muốn theo dõi.</p>
        </div>
        <Heart className="shrink-0 text-[#1E5AA8]" size={24} />
      </div>
      <p className="mt-3 text-xs text-slate-400">{count} mục yêu thích</p>
      <div role="tablist" aria-label="Loại yêu thích" className="mt-5 flex gap-5 border-b border-slate-200">
        {([['tournaments', 'Giải đấu', user?.bookmarkedTournaments?.length || 0], ['coaches', 'Huấn luyện viên', coaches.length]] as const).map(([id, label, total]) => <button key={id} id={`favorites-tab-${id}`} type="button" role="tab" aria-selected={category === id} aria-controls={`favorites-panel-${id}`} onClick={() => setCategory(id)} className={`border-b-2 pb-3 text-sm font-semibold ${category === id ? 'border-[#1E5AA8] text-[#1E5AA8]' : 'border-transparent text-slate-500'}`}>{label} ({total})</button>)}
      </div>
    </div>
    <div role="tabpanel" id={`favorites-panel-${category}`} aria-labelledby={`favorites-tab-${category}`}>
      {category === 'tournaments' && (loading ? <p role="status" className="py-12 text-center text-sm text-slate-500">Đang tải giải đấu yêu thích...</p> : saved.length ? <div className="grid gap-4 sm:grid-cols-2">{saved.map(tournament => <TournamentCard key={tournament.id} tournament={tournament} isBookmarked onBookmarkToggle={id => toggleBookmark(id)} />)}</div> : <Empty category="tournaments" />)}
      {category === 'coaches' && (coaches.length ? <div className="grid gap-4 sm:grid-cols-2">{coaches.map(coach => <article key={coach.id} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <CoachAvatar name={coach.fullName} src={coach.avatarUrl} className="h-16 w-16 rounded-xl" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900">{coach.fullName}</h3>
            <p className="mt-1 text-xs text-[#1E5AA8]">{coach.sports.map(sportLabel).join(' · ')}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <Star size={12} className="fill-amber-400 text-amber-400" />{coach.rating.toFixed(1)} · {coach.experienceYears} năm kinh nghiệm</p>
          </div>
          <FavoriteButton selected name={coach.fullName} pending={pending.includes(coach.id)} onToggle={() => removeCoach(coach.id)} />
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{coach.headline}</p>
        <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={13} />{coach.city} · {coach.districts.join(', ')}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold">{money(coach.hourlyRate)}<span className="text-xs font-normal text-slate-400"> / giờ</span>
          </p>
          <Link href={`/coaches/${coach.id}`} className="text-xs font-semibold text-[#1E5AA8]">Xem hồ sơ</Link>
        </div>
      </article>)}</div> : <Empty category="coaches" />)}
    </div>
  </section>;
}

function Empty({ category }: { category: 'tournaments' | 'coaches' }) {
  return <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
    <Heart size={30} className="mx-auto mb-4 text-[#1E5AA8]" />
    <h3 className="font-semibold text-slate-900">{category === 'coaches' ? 'Chưa có huấn luyện viên yêu thích' : 'Chưa có giải đấu yêu thích'}</h3>
    <p className="mt-2 text-sm text-slate-500">Bấm biểu tượng trái tim để thêm vào danh sách của bạn.</p>
    <Link href={category === 'coaches' ? '/coaches' : '/tournaments'} className="mt-5 inline-block rounded-xl bg-[#1E5AA8] px-5 py-3 text-sm font-semibold text-white">{category === 'coaches' ? 'Khám phá huấn luyện viên' : 'Khám phá giải đấu'}</Link>
  </div>;
}
