'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowUpDown 
} from 'lucide-react';
import { Tournament, TournamentFilterDto } from '@courtmate/shared';
import { tournamentsApi } from '../../lib/tournaments.api';
import { TournamentCard } from '../../components/tournaments/TournamentCard';
import { TournamentFilters } from '../../components/tournaments/TournamentFilters';

function TournamentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'fee'>('date');

  // Filters state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      try {
        const filters: TournamentFilterDto = {};
        if (keyword) filters.keyword = keyword;
        if (sport) filters.sport = sport as any;
        if (city) filters.city = city;
        if (status) filters.status = status as any;

        const res = await tournamentsApi.getTournaments(filters);
        let list = res.data;

        // Apply sorting
        if (sortBy === 'fee') {
          list = [...list].sort((a, b) => (a.registrationFee || 0) - (b.registrationFee || 0));
        } else {
          list = [...list].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        }

        setTournaments(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
  }, [keyword, sport, city, status, sortBy]);

  const handleResetFilters = () => {
    setKeyword('');
    setSport('');
    setCity('');
    setStatus('');
    router.replace('/tournaments');
  };

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" />
            <span>Khám phá thi đấu</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy">
            Danh Sách Giải Đấu Thể Thao
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tìm kiếm và đăng ký tham gia các giải đấu Cầu lông, Pickleball, Quần vợt trên cả nước
          </p>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Sticky Filters Sidebar */}
          <div className="lg:col-span-1">
            <TournamentFilters
              selectedSport={sport}
              onSelectSport={(val) => setSport(val || '')}
              selectedCity={city}
              onSelectCity={(val) => setCity(val || '')}
              selectedStatus={status}
              onSelectStatus={(val) => setStatus(val || '')}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Column: Search Bar, Toolbar & Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              
              {/* Keyword Search */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm giải đấu theo tên hoặc địa điểm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                />
              </div>

              {/* View & Sort Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-navy focus:outline-none cursor-pointer"
                  >
                    <option value="date">Theo ngày diễn ra</option>
                    <option value="fee">Theo lệ phí thấp nhất</option>
                  </select>
                </div>

                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'grid' ? 'bg-white text-primary shadow-xs' : 'text-slate-400 hover:text-navy'
                    }`}
                    title="Dạng lưới"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list' ? 'bg-white text-primary shadow-xs' : 'text-slate-400 hover:text-navy'
                    }`}
                    title="Dạng danh sách"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Status Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Tìm thấy <strong className="text-navy">{tournaments.length}</strong> giải đấu phù hợp</span>
              {(sport || city || status || keyword) && (
                <span className="text-primary font-medium">Đang áp dụng bộ lọc</span>
              )}
            </div>

            {/* Tournaments Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-navy">Không có giải đấu nào</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Không tìm thấy giải đấu phù hợp với điều kiện lọc hiện tại.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
                {tournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onBookmarkToggle={handleBookmarkToggle}
                    isBookmarked={bookmarkedIds.includes(tournament.id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Đang tải giải đấu...</div>}>
      <TournamentsContent />
    </Suspense>
  );
}
