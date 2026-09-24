'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  Search, 
  MapPin,
  ChevronDown,
  X,
  SlidersHorizontal,
  Target,
  Check
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
  
  // Drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Dropdown state
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filters state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'Đà Nẵng'); // Default to Đà Nẵng for UI demo
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [level, setLevel] = useState(searchParams.get('level') || '');
  
  const initialMaxFee = searchParams.get('maxFee');
  const [maxFee, setMaxFee] = useState<number | undefined>(initialMaxFee ? Number(initialMaxFee) : undefined);
  const [isFreeOnly, setIsFreeOnly] = useState(searchParams.get('isFree') === 'true');
  
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      try {
        const filters: TournamentFilterDto = {};
        if (keyword) filters.keyword = keyword;
        if (sport) filters.sport = sport as any;
        if (city && city !== 'Tất cả') filters.city = city;
        if (status) filters.status = status as any;

        const res = await tournamentsApi.getTournaments(filters);
        let list = res.data;

        // Default sorting by date
        list = [...list].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        setTournaments(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
  }, [keyword, sport, city, status, level, maxFee, isFreeOnly]);

  const handleResetFilters = () => {
    setSport('');
    setStatus('');
    setLevel('');
    setMaxFee(undefined);
    setIsFreeOnly(false);
  };

  const handleClearAll = () => {
    handleResetFilters();
    setKeyword('');
    setCity('Tất cả');
  };

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeDrawerFiltersCount = [
    sport !== '',
    status !== '',
    level !== '',
    maxFee !== undefined && maxFee !== 1000 && !isFreeOnly,
    isFreeOnly
  ].filter(Boolean).length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-6">
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

        {/* Top Toolbar (Search & Filter) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          
          {/* Main Search Container */}
          <div className="flex flex-1 items-center bg-white rounded-full border border-slate-200/80 shadow-sm p-1.5 w-full">
            {/* City Selector */}
            <div className="relative shrink-0" ref={cityRef}>
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className={`flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-navy font-semibold text-sm pl-4 pr-3 py-2.5 rounded-full outline-none transition-colors border ${
                  isCityOpen ? 'border-[#1E5AA8]/30 bg-slate-100' : 'border-transparent'
                }`}
              >
                <Target className="w-4 h-4 text-[#1E5AA8]" />
                <span>{city}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {['Tất cả khu vực', 'Đà Nẵng', 'Hà Nội', 'TP. HCM'].map((c) => {
                    const isSelected = city === c || (c === 'Tất cả khu vực' && city === 'Tất cả');
                    const val = c === 'Tất cả khu vực' ? 'Tất cả' : c;
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          setCity(val);
                          setIsCityOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          isSelected 
                            ? 'bg-[#1E5AA8]/5 text-[#1E5AA8] font-bold' 
                            : 'text-slate-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Target className={`w-4 h-4 ${isSelected ? 'text-[#1E5AA8]' : 'text-slate-400'}`} />
                          <span>{c}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1E5AA8]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-slate-200 mx-2 shrink-0" />

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm sân, khu vực, nội dung buổi..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent pl-9 pr-4 py-2.5 text-sm outline-none text-navy placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => {
              if (activeDrawerFiltersCount > 0) {
                // If clicking X part, clear filters. But wait, standard behavior is clicking button opens drawer.
                // We'll make the whole button open drawer, unless they click the X specifically.
                setIsFilterOpen(true);
              } else {
                setIsFilterOpen(true);
              }
            }}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
              activeDrawerFiltersCount > 0
                ? 'bg-[#1E5AA8] text-white hover:bg-[#154687] border border-[#1E5AA8]'
                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ lọc {activeDrawerFiltersCount > 0 && `· ${activeDrawerFiltersCount}`}</span>
            {activeDrawerFiltersCount > 0 && (
              <div 
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetFilters();
                }}
              >
                <X className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

        </div>

        {/* Results Status Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <span>Tìm thấy <strong className="text-navy">{tournaments.length}</strong> giải đấu phù hợp</span>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy">Không có giải đấu nào</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Không tìm thấy giải đấu phù hợp với điều kiện lọc hiện tại.
            </p>
            <button
              onClick={handleClearAll}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* ─── FILTER DRAWER ─── */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-navy/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsFilterOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isFilterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <TournamentFilters
          isOpen={isFilterOpen}
          initialFilters={{ sport, status, level, maxFee, isFreeOnly }}
          onApply={(filters) => {
            setSport(filters.sport);
            setStatus(filters.status);
            setLevel(filters.level);
            setMaxFee(filters.maxFee);
            setIsFreeOnly(filters.isFreeOnly);
            setIsFilterOpen(false);
          }}
          onClose={() => setIsFilterOpen(false)}
        />
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
