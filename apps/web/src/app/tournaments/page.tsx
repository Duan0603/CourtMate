'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
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
  Sparkles,
  Bell,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Tournament, TournamentFilterDto } from '@courtmate/shared';
import { tournamentsApi } from '../../lib/tournaments.api';
import { TournamentCard } from '../../components/tournaments/TournamentCard';
import { TournamentFilters } from '../../components/tournaments/TournamentFilters';
import { useAuth } from '../../context/AuthContext';

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
  const { user, updateProfile } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

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
  
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(user?.bookmarkedTournaments || []);

  useEffect(() => {
    if (user) {
      setBookmarkedIds(user.bookmarkedTournaments || []);
    }
  }, [user]);

  // Fetch data
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
        setCurrentPage(1); // Reset to page 1 on filter change
      } catch (err) {
        console.error('Error fetching tournaments:', err);
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
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    handleResetFilters();
    setKeyword('');
    setCity('Tất cả');
    setCurrentPage(1);
  };

  const handleBookmarkToggle = async (id: string) => {
    const isBookmarked = bookmarkedIds.includes(id);
    const newBookmarks = isBookmarked
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
      
    setBookmarkedIds(newBookmarks);
    
    if (user) {
      await updateProfile({ bookmarkedTournaments: newBookmarks });
    }
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
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12 relative overflow-hidden">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1E5AA8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section Header */}
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-[#1E5AA8]/20">
            <Trophy className="w-3.5 h-3.5 text-[#1E5AA8]" />
            <span>Khám phá & Đăng ký giải đấu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
            Danh Sách Giải Đấu Thể Thao
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed font-medium">
            Cập nhật các giải đấu Cầu lông, Pickleball, Quần vợt hàng đầu trên toàn quốc. Đăng ký slot thi đấu chuẩn xác và chuyên nghiệp.
          </p>
        </div>

        {/* Main Toolbar (Search & Filter) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          
          {/* Main Search Bar Container */}
          <div className="flex flex-1 items-center bg-white rounded-2xl sm:rounded-full border border-slate-200/90 shadow-sm hover:border-[#1E5AA8]/40 transition-all p-2 w-full">
            
            {/* Dropdown City Selector */}
            <div className="relative shrink-0" ref={cityRef}>
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className={`flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 text-navy font-bold text-xs sm:text-sm pl-3.5 pr-3 py-2.5 rounded-xl sm:rounded-full outline-none transition-all border ${
                  isCityOpen ? 'border-[#1E5AA8] bg-slate-100' : 'border-slate-200/60'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#1E5AA8]" />
                <span className="truncate max-w-[110px]">
                  {city === 'Tất cả' ? 'Tất cả khu vực' : city}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCityOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
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
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                          isSelected 
                            ? 'bg-[#1E5AA8]/10 text-[#1E5AA8] font-bold' 
                            : 'text-[#475467] hover:bg-slate-50 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#1E5AA8]' : 'text-slate-400'}`} />
                          <span>{c.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1E5AA8]" />}
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
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm tên giải đấu, môn thể thao, địa điểm..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent pl-9 pr-4 py-2 text-xs sm:text-sm outline-none text-navy placeholder:text-slate-400 font-medium"
              />
              {keyword && (
                <button 
                  onClick={() => {
                    setKeyword('');
                    setCurrentPage(1);
                  }}
                  className="mr-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Drawer Trigger Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${
              activeDrawerFiltersCount > 0
                ? 'bg-[#1E5AA8] text-white hover:bg-[#154687] border border-[#1E5AA8]'
                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
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

        {/* Top Anchor for Scroll */}
        <div ref={listTopRef} className="scroll-mt-6" />

        {/* Results Info Bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 mb-6 px-1 font-medium">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1E5AA8]" />
            <span>
              Tìm thấy <strong className="text-navy font-bold">{totalTournaments}</strong> giải đấu 
              {city !== 'Tất cả' && (
                <span className="text-[#1E5AA8] font-semibold"> tại {city}</span>
              )}
            </span>
          </div>
        </div>

        {/* Tournaments Grid / Loading / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border border-slate-100 p-4 animate-pulse flex flex-col justify-between shadow-xs">
                <div className="h-44 bg-slate-200 rounded-xl w-full" />
                <div className="space-y-2.5 mt-3">
                  <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : totalTournaments === 0 ? (
          /* High-end Animated Empty State */
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center shadow-lg my-6 max-w-3xl mx-auto transition-all">
            {/* Glowing Accent Effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#1E5AA8]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Animated Pulsing Icon Ring */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-[#1E5AA8]/15 animate-ping duration-1000 scale-125 pointer-events-none" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#1E5AA8]/10 to-sky-100/60 border border-[#1E5AA8]/20 flex items-center justify-center shadow-inner relative z-10">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#1E5AA8] drop-shadow-xs" />
              </div>
            </div>

            {/* Badge Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>Đang cập nhật giải đấu mới</span>
            </div>

            {/* Main Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight max-w-xl mx-auto leading-snug">
              Chúng tôi đang cập nhật thêm các thông tin, xin vui lòng đợi các thông báo mới.
            </h3>
            
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              {city !== 'Tất cả' ? (
                <>Hiện chưa có giải đấu nào chính thức mở cổng tại khu vực <strong className="text-navy">{city}</strong>.</>
              ) : (
                <>Không tìm thấy giải đấu phù hợp với từ khóa hoặc bộ lọc đã chọn.</>
              )}
              {' '}Ban tổ chức đang hoàn thiện các lịch trình thi đấu tiếp theo. Đăng ký thông báo để không bỏ lỡ cơ hội tham gia!
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {city !== 'Đà Nẵng' && (
                <button
                  onClick={() => {
                    setCity('Đà Nẵng');
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1E5AA8]/20 transition-all transform hover:-translate-y-0.5"
                >
                  Khám phá giải tại Đà Nẵng
                </button>
              )}

              {city !== 'Tất cả' && (
                <button
                  onClick={() => {
                    setCity('Tất cả');
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 transition-all"
                >
                  Xem tất cả khu vực
                </button>
              )}

              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-bold border border-slate-200 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Xóa tất cả bộ lọc</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tournaments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onBookmarkToggle={handleBookmarkToggle}
                  isBookmarked={bookmarkedIds.includes(tournament.id)}
                />
              ))}
            </div>

            {/* Pagination Controls (Only displayed when there are items) */}
            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Pagination Info */}
                <span className="text-xs sm:text-sm font-semibold text-slate-500">
                  Hiển thị <strong className="text-navy">{startIndex + 1}</strong> - <strong className="text-navy">{endIndex}</strong> trong tổng số <strong className="text-[#1E5AA8]">{totalTournaments}</strong> giải đấu
                </span>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
                  {/* Prev Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      currentPage === 1
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-navy'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                          isActive
                            ? 'bg-[#1E5AA8] text-white shadow-md shadow-[#1E5AA8]/20 scale-105'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      currentPage === totalPages
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-navy'
                    }`}
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </>
        )}
      </div>

      {/* ─── FILTER DRAWER ─── */}
      <div 
        className={`fixed inset-0 bg-navy/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
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

    </div>
  );
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-semibold">Đang tải danh sách giải đấu...</div>}>
      <TournamentsContent />
    </Suspense>
  );
}
