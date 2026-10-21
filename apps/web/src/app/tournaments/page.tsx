'use client';

import { DirectoryEmptyState } from '../../components/shared/DirectoryEmptyState';
import { PageContainer } from '../../components/layout/PageContainer';

import { ContentSkeleton } from '../../components/loading/ContentSkeleton';
import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Trophy,
  Search,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Target,
  Check,
  RefreshCw,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Tournament, TournamentFilterDto, SportType, TournamentStatus } from '@courtmate/shared';
import { tournamentsApi } from '../../lib/tournaments.api';
import { TournamentCard } from '../../components/tournaments/TournamentCard';
import { TournamentFilters } from '../../components/tournaments/TournamentFilters';
import { GuestActionModal } from '../../components/shared/GuestActionModal';
import { useAuth } from '../../context/AuthContext';
import { useSmartAsync } from '../../context/useSmartAsync';
import { SmartAsyncContainer } from '../../components/loading/SmartAsyncContainer';

const ITEMS_PER_PAGE = 10;

const POPULAR_CITIES = [
  { name: 'Tất cả khu vực', val: 'Tất cả' },
  { name: 'Đà Nẵng', val: 'Đà Nẵng' },
  { name: 'Hà Nội', val: 'Hà Nội' },
  { name: 'TP. Hồ Chí Minh', val: 'TP. HCM' },
];

function TournamentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, toggleBookmark } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const activeRequestIdRef = useRef(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Dropdown state
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);

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
  const [city, setCity] = useState(searchParams.get('city') || 'Đà Nẵng'); // Default to Đà Nẵng
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [level, setLevel] = useState(searchParams.get('level') || '');

  const initialMaxFee = searchParams.get('maxFee');
  const [maxFee, setMaxFee] = useState<number | undefined>(initialMaxFee ? Number(initialMaxFee) : undefined);
  const [isFreeOnly, setIsFreeOnly] = useState(searchParams.get('isFree') === 'true');

  const bookmarkedIds = isAuthenticated ? user?.bookmarkedTournaments || [] : [];

  // Reliable Fetch
  const fetchTournaments = useCallback(async () => {
    const requestId = ++activeRequestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const filters: TournamentFilterDto = {};
      if (keyword.trim()) filters.keyword = keyword.trim();
      if (sport && sport !== 'ALL') filters.sport = sport as any;
      if (city && city !== 'Tất cả' && city !== 'Tất cả khu vực') filters.city = city;
      if (status && status !== 'ALL') filters.status = status as any;

      const res = await tournamentsApi.getTournaments(filters);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

      // Default sorting by date
      const sorted = [...list].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      if (requestId === activeRequestIdRef.current) {
        setTournaments(sorted);
        setLoading(false);
      }
    } catch (err: any) {
      if (requestId === activeRequestIdRef.current) {
        console.error('Error fetching tournaments:', err);
        setError(err);
        setLoading(false);
      }
    }
  }, [keyword, sport, city, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTournaments();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchTournaments]);

  const handleResetFilters = () => {
    setSport('');
    setStatus('');
    setLevel('');
    setMaxFee(undefined);
    setIsFreeOnly(false);
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    handleResetFilters();
    setKeyword('');
    setCity('Tất cả');
    setCurrentPage(1);
  };

  const handleBookmarkToggle = async (id: string) => {
    if (!isAuthenticated) { setLoginOpen(true); return; }
    const wasSaved = bookmarkedIds.includes(id);
    const saved = await toggleBookmark(id);
    if (saved === wasSaved) return;


  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeDrawerFiltersCount = [
    sport !== '',
    status !== '',
    level !== '',
    maxFee !== undefined && maxFee !== 1000 && !isFreeOnly,
    isFreeOnly
  ].filter(Boolean).length;

  // Pagination Math
  const totalTournaments = tournaments.length;
  const totalPages = Math.max(1, Math.ceil(totalTournaments / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalTournaments);
  const currentTournaments = tournaments.slice(startIndex, endIndex);

  return (
    <div className="bg-canvas min-h-screen page-section relative overflow-hidden">

      {/* Background Decorative Blur Orbs */}

      <PageContainer className="relative z-10">

        {/* Hero Section Header */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
            Giải đấu
          </h1>
        </div>

        {/* Main Toolbar (Search & Filter) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">

          {/* Main Search Bar Container */}
          <div className="cm-searchbar flex flex-1 items-center bg-surface shadow-card rounded-2xl sm:rounded-full border border-ink  hover:border-primary/40 transition-all p-2 w-full">

            {/* Dropdown City Selector */}
            <div className="relative shrink-0" ref={cityRef}>
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className={`cm-button flex items-center gap-2 bg-white hover:bg-white text-navy font-bold text-xs sm:text-sm pl-3.5 pr-3 py-2.5 rounded-xl sm:rounded-full outline-none transition-all border ${
                  isCityOpen ? 'border-primary bg-white' : 'border-ink'
                }`}
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate max-w-[110px]">
                  {city === 'Tất cả' ? 'Tất cả khu vực' : city}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isCityOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-surface shadow-card rounded-2xl  border border-ink py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {POPULAR_CITIES.map((c) => {
                    const isSelected = city === c.val || (c.val === 'Tất cả' && (city === 'Tất cả' || city === 'Tất cả khu vực'));
                    return (
                      <button
                        key={c.name}
                        onClick={() => {
                          setCity(c.val);
                          setIsCityOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`cm-button w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                          isSelected
                            ? 'bg-accent-baby text-primary font-bold'
                            : 'text-muted hover:bg-white font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted'}`} />
                          <span>{c.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-6 bg-white mx-2 shrink-0 hidden sm:block" />

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm tên giải đấu, môn thể thao, địa điểm..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="cm-control w-full bg-transparent pl-9 pr-4 py-2 text-xs sm:text-sm outline-none text-navy placeholder:text-muted font-medium"
              />
              {keyword && (
                <button
                  onClick={() => {
                    setKeyword('');
                    setCurrentPage(1);
                  }}
                  className="cm-button mr-2 text-muted hover:text-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Drawer Trigger Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`cm-button shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold transition-all  ${
              activeDrawerFiltersCount > 0
                ? 'bg-primary text-white hover:bg-primary-dark border border-primary'
                : 'bg-surface shadow-card text-navy border border-ink hover:bg-white hover:border-ink'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc {activeDrawerFiltersCount > 0 && `· ${activeDrawerFiltersCount}`}</span>
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

          {/* View Mode Toggle - Synchronized with Matches (Ảnh 1) */}
          <div className="shrink-0 flex items-center bg-white shadow-[3px_3px_0px_0px_#000] border-2 border-black rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-black hover:bg-accent-baby'
              }`}
              title="Xem dạng lưới (5 cột)"
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'list'
                  ? 'bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-black hover:bg-slate-100'
              }`}
              title="Xem dạng danh sách (2 cột)"
            >
              <ListIcon className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Top Anchor for Scroll */}
        <div ref={listTopRef} className="scroll-mt-6" />

        {/* Tournaments Grid / Loading / Empty State */}
        {loading ? (
          <ContentSkeleton layout="tournaments" count={10} />
        ) : error ? (
          <div role="alert" className="w-full max-w-xl mx-auto my-8 p-8 text-center bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000]">
            <p className="text-sm font-bold text-red-600 mb-4">Không thể kết nối máy chủ để tải giải đấu.</p>
            <button
              onClick={fetchTournaments}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000]"
            >
              Thử lại ngay
            </button>
          </div>
        ) : totalTournaments === 0 ? (
          <DirectoryEmptyState
            kind="tournaments"
            filtered={Boolean(keyword.trim() || sport || status || level || maxFee !== undefined || isFreeOnly || (city && city !== 'Tất cả'))}
            onReset={handleClearAll}
            onRefresh={fetchTournaments}
          />
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5' : 'grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5'}`}>
            {currentTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                viewMode={viewMode}
                onBookmarkToggle={handleBookmarkToggle}
                isBookmarked={bookmarkedIds.includes(tournament.id)}
              />
            ))}
          </div>
        )}

            {/* Pagination Controls (Only displayed when there are items) */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-12 pt-6 border-t-2 border-black flex items-center justify-end">
                {/* Pagination Buttons */}
                <div className="flex items-center gap-1.5 bg-white shadow-[4px_4px_0px_0px_#000] p-1.5 rounded-2xl border-2 border-black">
                  {/* Prev Button - Only visible when currentPage > 1 */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="p-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 border-2 border-transparent hover:border-black hover:bg-slate-100 text-black"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Trước</span>
                    </button>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center border-2 ${
                          isActive
                            ? 'bg-primary text-white border-black shadow-[2px_2px_0px_0px_#000]'
                            : 'text-black border-transparent hover:border-black hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="p-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 border-2 border-transparent hover:border-black hover:bg-slate-100 text-black"
                    >
                      <span className="hidden sm:inline">Sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
      </PageContainer>

      {/* ─── FILTER DRAWER ─── */}
      <div
        className={`fixed inset-0 bg-navy/40 z-[100] transition-opacity duration-300 ${
          isFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsFilterOpen(false)}
      />

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
            setCurrentPage(1);
          }}
          onClose={() => setIsFilterOpen(false)}
        />
      </div>
      <GuestActionModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} redirectUrl="/tournaments" />
    </div>
  );
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="page-container page-section"><ContentSkeleton layout="tournaments" count={10} /></div>}>
      <TournamentsContent />
    </Suspense>
  );
}
