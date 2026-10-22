'use client';

import { DirectoryEmptyState } from '../../components/shared/DirectoryEmptyState';
import { PageContainer } from '../../components/layout/PageContainer';

import { ContentSkeleton } from '../../components/loading/ContentSkeleton';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Match,
  BadmintonSkillLevel,
  BADMINTON_SKILL_LABELS,
  SportType,
  MatchStatus,
  CreateMatchDto,
} from '@courtmate/shared';
import { matchesApi } from '@/lib/matches.api';
import { useAuth } from '@/context/AuthContext';
import { useSmartAsync } from '@/context/useSmartAsync';
import { SmartAsyncContainer } from '@/components/loading/SmartAsyncContainer';
import { MatchFilters } from '../../components/matches/MatchFilters';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Check,
  X,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Users,
} from 'lucide-react';

// Ant Design Components & Icons
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Tag,
  Modal,
  InputNumber,
  Segmented,
  Empty,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FilterOutlined,
  ReloadOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';

const DISTRICTS = [
  'Tất cả',
  'Hải Châu',
  'Thanh Khê',
  'Sơn Trà',
  'Ngũ Hành Sơn',
  'Cẩm Lệ',
  'Liên Chiểu',
];

const SKILL_OPTIONS: { value: BadmintonSkillLevel | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả trình độ' },
  { value: BadmintonSkillLevel.YEU, label: 'Yếu (Mới chơi)' },
  { value: BadmintonSkillLevel.TBY, label: 'Trung bình yếu (TBY)' },
  { value: BadmintonSkillLevel.TB, label: 'Trung bình (TB)' },
  { value: BadmintonSkillLevel.TB_PLUS, label: 'Trung bình khá (TB+)' },
  { value: BadmintonSkillLevel.KHA, label: 'Khá' },
  { value: BadmintonSkillLevel.KHA_PLUS, label: 'Khá+ (Bán chuyên)' },
];

export default function MatchesPage() {
  const { user, isAuthenticated } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const activeRequestIdRef = useRef(0);

  // Filters
  const [selectedSport, setSelectedSport] = useState<SportType>(SportType.BADMINTON);
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [selectedSkill, setSelectedSkill] = useState<BadmintonSkillLevel | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtRef = useRef<HTMLDivElement>(null);

  // View mode & Pagination (6 matches per page)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 6;
  const listTopRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(matches.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedMatches = matches.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (listTopRef.current) {
        listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const activeDrawerFiltersCount =
    (selectedSport !== SportType.BADMINTON ? 1 : 0) +
    (selectedSkill !== 'ALL' ? 1 : 0);
  const hasActiveFilters =
    selectedSport !== SportType.BADMINTON ||
    selectedDistrict !== 'Tất cả' ||
    selectedSkill !== 'ALL' ||
    Boolean(searchKeyword.trim());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal Create Match
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateMatchDto>>({
    sport: SportType.BADMINTON,
    title: '',
    venueName: '',
    venueAddress: '',
    district: 'Thanh Khê',
    courtNumber: 'Sân 1',
    startTime: '',
    endTime: '',
    totalSlots: 4,
    minSkillLevel: BadmintonSkillLevel.TBY,
    maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
    estimatedCostText: 'Chia đều tiền sân tại chỗ (~40k/người)',
    notes: 'Đánh cầu Thành Công hoặc Hải Yến',
  });



  // Trận đấu active mà user đang tham gia
  const userActiveMatch = matches.find((m) => {
    if (!user) return false;
    const uid = user.id || (user as any)._id;
    return (
      m.players?.some((p) => p.userId === uid) &&
      m.status !== MatchStatus.CANCELLED &&
      m.status !== MatchStatus.COMPLETED
    );
  });

  const getGoogleCalendarUrl = (m: Match) => {
    try {
      const start = new Date(m.startTime);
      const end = m.endTime
        ? new Date(m.endTime)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      const formatTime = (d: Date) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

      const title = encodeURIComponent(`[CourtMate] ${m.title}`);
      const details = encodeURIComponent(
        `Trận đấu: ${m.title}\nBộ môn: ${m.sport === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball'
        }\nĐịa điểm: ${m.venueName} (${m.courtNumber || 'Sân giao lưu'})\nĐịa chỉ: ${m.venueAddress
        }, Q. ${m.district}\nChi phí: ${m.estimatedCostText
        }\n\n* Nhắc nhở từ CourtMate: Có mặt trước 15 phút để khởi động và gặp gỡ bạn chơi!`
      );
      const location = encodeURIComponent(`${m.venueName}, ${m.venueAddress}, Đà Nẵng`);
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatTime(start)}/${formatTime(end)}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  const fetchMatches = useCallback(async () => {
    const requestId = ++activeRequestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await matchesApi.getMatches({
        sport: selectedSport,
        district: selectedDistrict !== 'Tất cả' ? selectedDistrict : undefined,
        skillLevel: selectedSkill !== 'ALL' ? selectedSkill : undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (requestId === activeRequestIdRef.current) {
        setMatches(list);
        setLoading(false);
      }
    } catch (err: any) {
      if (requestId === activeRequestIdRef.current) {
        console.error('Lỗi tải danh sách kèo đấu:', err);
        setError(err);
        setLoading(false);
      }
    }
  }, [selectedSport, selectedDistrict, selectedSkill, searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchMatches();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchMatches]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchMatches();
  };

  const handleResetFilters = () => {
    setSelectedSport(SportType.BADMINTON);
    setSelectedDistrict('Tất cả');
    setSelectedSkill('ALL');
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/matches';
      return;
    }

    if (!formData.title || !formData.venueName || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    setSubmitting(true);
    try {
      await matchesApi.createMatch(formData as CreateMatchDto);
      setIsCreateOpen(false);

      fetchMatches();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo trận. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' · ' +
        d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-canvas page-section">
      <PageContainer>
        {/* TOP COMMAND BAR */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ink">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Tìm bạn chơi
            </h1>
            <p className="text-sm text-muted mt-1 max-w-2xl font-normal">
              Chọn trận theo trình độ, thời gian và địa điểm.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = '/login?redirect=/matches';
                } else if (userActiveMatch) {
                  alert(
                    `Bạn đang tham gia trận "${userActiveMatch.title}". Mỗi người chơi chỉ được giữ 1 slot tại một thời điểm để đảm bảo lịch trình!`
                  );
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="font-black bg-primary hover:bg-primary text-white border-2 border-black rounded-full px-5 py-2.5 shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2 text-xs sm:text-sm"
            >
              <PlusOutlined />
              <span>Tạo trận giao lưu</span>
            </button>
          </div>
        </div>

        {/* BANNER NHẮC LỊCH THI ĐẤU ĐÃ THAM GIA */}
        {userActiveMatch && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary text-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000] text-lg">
                <CalendarOutlined />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-black text-xs rounded-full px-3 py-0.5 bg-white text-black border-2 border-black uppercase">
                    Đã tham gia
                  </span>
                  <span className="text-xs font-black text-white bg-primary px-3 py-0.5 rounded-full border-2 border-black">
                    {userActiveMatch.sport === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-black tracking-tight">
                  {userActiveMatch.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted mt-1 flex-wrap font-medium">
                  <span className="flex items-center gap-1 font-black text-black">
                    <ClockCircleOutlined className="text-primary" />
                    {formatDateTime(userActiveMatch.startTime)}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-bold text-black">
                    <EnvironmentOutlined className="text-primary" />
                    {userActiveMatch.venueName} {userActiveMatch.courtNumber ? `(${userActiveMatch.courtNumber})` : ''} - Q. {userActiveMatch.district}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <a
                href={getGoogleCalendarUrl(userActiveMatch)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none"
              >
                <button
                  className="w-full font-black text-xs bg-primary hover:bg-primary text-white border-2 border-black rounded-xl px-4 py-2 shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1.5 transition-all"
                >
                  <CalendarOutlined />
                  <span>Lưu Calendar</span>
                </button>
              </a>
              <Link href={`/matches/${userActiveMatch.id || userActiveMatch._id}`} className="flex-1 md:flex-none">
                <button className="w-full font-black text-xs bg-white hover:bg-white text-black border-2 border-black rounded-xl px-4 py-2 shadow-[2px_2px_0px_0px_#000] transition-all">
                  Xem trận
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* MAIN TOOLBAR (Search & Filter & View Mode) - Clean Neobrutalism (White - Blue - Black) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 mb-4">
          {/* Main Search Bar Container */}
          <div className="flex flex-1 items-center bg-white shadow-[4px_4px_0px_0px_#000] rounded-full border-2 border-black p-1.5 w-full">
            {/* District Selector Dropdown Pill */}
            <div className="relative shrink-0" ref={districtRef}>
              <button
                type="button"
                onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                className="flex items-center gap-2 bg-white text-black font-black text-xs sm:text-sm pl-4 pr-3 py-2 rounded-full outline-none transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-white"
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate max-w-[120px]">
                  {selectedDistrict === 'Tất cả' ? 'Đà Nẵng' : `Quận ${selectedDistrict}`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-black transition-transform duration-200 ${isDistrictOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDistrictOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white shadow-[4px_4px_0px_0px_#000] rounded-2xl border-2 border-black py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {DISTRICTS.map((d) => {
                    const isSelected = selectedDistrict === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDistrict(d);
                          setIsDistrictOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary text-white font-black'
                            : 'text-black hover:bg-white font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                          <span>{d === 'Tất cả' ? 'Tất cả các quận' : `Quận ${d}`}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="w-[2px] h-6 bg-black mx-2.5 shrink-0 hidden sm:block" />

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-black absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm tên sân, địa chỉ, trận đấu..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setCurrentPage(1);
                    fetchMatches();
                  }
                }}
                className="w-full bg-transparent pl-9 pr-4 py-1.5 text-xs sm:text-sm outline-none text-black placeholder:text-muted font-bold"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setCurrentPage(1);
                  }}
                  className="mr-2 text-black hover:opacity-70"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border-2 border-black shadow-[3px_3px_0px_0px_#000] ${
              activeDrawerFiltersCount > 0
                ? 'bg-primary text-white hover:bg-primary'
                : 'bg-white text-black hover:bg-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc {activeDrawerFiltersCount > 0 && `· ${activeDrawerFiltersCount}`}</span>
          </button>

          {/* View Mode Toggle (Grid 6 vs Thẻ ngang 6) - Synchronized with Ảnh 1 */}
          <div className="shrink-0 flex items-center bg-white shadow-[3px_3px_0px_0px_#000] border-2 border-black rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-black hover:bg-accent-baby'
              }`}
              title="Xem dạng lưới (Grid 6 trận)"
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'list'
                  ? 'bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-black hover:bg-accent-baby'
              }`}
              title="Xem dạng thẻ ngang (Full width 6 trận)"
            >
              <ListIcon className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* LIST STATUS HEADER */}
        <div className="mt-8 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-black text-black tracking-tight">
              Danh Sách Trận Giao Lưu
            </h2>
            <span className="bg-primary text-white border-2 border-black font-black text-xs px-3 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
              {loading ? 'Đang tải...' : `${matches.length} trận`}
            </span>
          </div>
          <span className="text-xs text-muted font-bold hidden sm:inline">
            Tự do tham gia hoặc mời đồng đội chia sẻ chi phí
          </span>
        </div>

        {/* Top Anchor for Smooth Scroll */}
        <div ref={listTopRef} className="scroll-mt-6" />

        {/* MATCHES LIST */}
        {loading ? (
          <ContentSkeleton layout="matches" count={6} />
        ) : error ? (
          <div role="alert" className="w-full max-w-xl mx-auto my-8 p-8 text-center bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000]">
            <p className="text-sm font-bold text-red-600 mb-4">Không thể kết nối đến máy chủ để tải danh sách kèo đấu.</p>
            <button
              onClick={fetchMatches}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000]"
            >
              Thử lại ngay
            </button>
          </div>
        ) : matches.length === 0 ? (
          <DirectoryEmptyState
            kind="matches"
            filtered={hasActiveFilters}
            onReset={handleResetFilters}
            onRefresh={fetchMatches}
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
            /* ─── DẠNG GRID (6 trận / trang) ─── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {paginatedMatches.map((match) => {
                const minMeta = BADMINTON_SKILL_LABELS[match.minSkillLevel] || {
                  label: match.minSkillLevel,
                };
                const maxMeta = BADMINTON_SKILL_LABELS[match.maxSkillLevel] || {
                  label: match.maxSkillLevel,
                };
                const availableSlots = match.totalSlots - match.joinedCount;
                const isCompleted = match.status === MatchStatus.COMPLETED;
                const isFull = match.status === MatchStatus.FULL || availableSlots <= 0;

                const uid = user ? (user.id || (user as any)._id) : null;
                const isUserInThisMatch = Boolean(
                  uid && match.players?.some((p) => p.userId === uid)
                );

                return (
                  <div
                    key={match.id || match._id}
                    className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs rounded-full px-3 py-1 bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider">
                            {match.sport === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball'}
                          </span>
                          {isUserInThisMatch && (
                            <span className="font-black text-[11px] rounded-full px-2.5 py-0.5 bg-white text-primary border-2 border-black">
                              Đã tham gia
                            </span>
                          )}
                        </div>

                        {/* Status Tag */}
                        {isCompleted ? (
                          <span className="text-xs font-black text-black bg-white border-2 border-black px-2.5 py-0.5 rounded-full">
                            Đã hoàn thành
                          </span>
                        ) : isFull ? (
                          <span className="text-xs font-black text-muted bg-white border-2 border-black px-2.5 py-0.5 rounded-full">
                            Đã đủ người
                          </span>
                        ) : (
                          <span className="text-xs font-black text-black bg-white border-2 border-black px-2.5 py-0.5 rounded-full">
                            Còn trống {availableSlots} chỗ
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-black text-black text-base mb-2 line-clamp-2 hover:text-primary transition-colors leading-snug">
                        <Link href={`/matches/${match.id || match._id}`}>
                          {match.title}
                        </Link>
                      </h3>

                      {/* Venue & Time with Icons */}
                      <div className="space-y-1.5 text-xs text-muted mb-3.5">
                        <div className="font-black text-black truncate flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>
                            {match.venueName} {match.courtNumber ? `· ${match.courtNumber}` : ''}
                          </span>
                        </div>
                        <div className="truncate text-muted pl-5 font-semibold">
                          {match.venueAddress} · Q. {match.district}
                        </div>
                        <div className="font-black text-black flex items-center gap-1.5 pt-0.5">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{formatDateTime(match.startTime)}</span>
                        </div>
                      </div>

                      {/* Skill requirements */}
                      <div className="pt-3 border-t-2 border-black text-xs flex items-center gap-1.5">
                        <span className="text-black font-black">Trình độ:</span>
                        <span className="font-black px-2 py-0.5 rounded-lg bg-white border-2 border-black text-black text-[11px]">
                          {minMeta.label}
                        </span>
                        <span className="font-black text-black">→</span>
                        <span className="font-black px-2 py-0.5 rounded-lg bg-primary text-white border-2 border-black text-[11px]">
                          {maxMeta.label}
                        </span>
                      </div>

                      {/* Cost Note */}
                      <div className="mt-3 text-xs bg-white rounded-xl p-2.5 text-black font-bold border-2 border-black flex items-start gap-1.5">
                        <DollarCircleOutlined className="text-primary mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{match.estimatedCostText}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 mt-4 border-t-2 border-black flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <TeamOutlined className="text-black" />
                        <span>
                          {match.joinedCount} / {match.totalSlots} VĐV
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUserInThisMatch && (
                          <a
                            href={getGoogleCalendarUrl(match)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="font-black text-xs rounded-xl bg-white hover:bg-white text-black border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 transition-all"
                            >
                              <CalendarOutlined />
                              <span>Lịch</span>
                            </button>
                          </a>
                        )}

                        <Link href={`/matches/${match.id || match._id}`}>
                          <button
                            className={`font-black text-xs rounded-xl px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all ${
                              isCompleted
                                ? 'bg-white hover:bg-white text-black'
                                : 'bg-primary hover:bg-primary text-white'
                            }`}
                          >
                            {isCompleted ? 'Xem chi tiết' : 'Xem trận'}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── DẠNG THẺ NGANG / LIST (6 trận / trang, kéo dài hết layout) ─── */
            <div className="flex flex-col gap-4 w-full">
              {paginatedMatches.map((match) => {
                const minMeta = BADMINTON_SKILL_LABELS[match.minSkillLevel] || {
                  label: match.minSkillLevel,
                };
                const maxMeta = BADMINTON_SKILL_LABELS[match.maxSkillLevel] || {
                  label: match.maxSkillLevel,
                };
                const availableSlots = match.totalSlots - match.joinedCount;
                const isCompleted = match.status === MatchStatus.COMPLETED;
                const isFull = match.status === MatchStatus.FULL || availableSlots <= 0;

                const uid = user ? (user.id || (user as any)._id) : null;
                const isUserInThisMatch = Boolean(
                  uid && match.players?.some((p) => p.userId === uid)
                );

                return (
                  <div
                    key={match.id || match._id}
                    className="w-full bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
                  >
                    {/* Left Column: Sport & Date/Time Badge Box */}
                    <div className="flex items-center sm:flex-col justify-between sm:justify-center gap-3 shrink-0 sm:min-w-[150px] w-full sm:w-auto">
                      <span className="font-black text-xs rounded-full px-3 py-1 bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider text-center">
                        {match.sport === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball'}
                      </span>
                      <div className="bg-white border-2 border-black rounded-xl p-2 text-center w-full shadow-[2px_2px_0px_0px_#000]">
                        <div className="flex items-center justify-center gap-1 text-black font-black text-xs">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{formatDateTime(match.startTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column: Title & Info */}
                    <div className="flex-1 min-w-0 space-y-2 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCompleted ? (
                          <span className="text-xs font-black text-black bg-white border-2 border-black px-2.5 py-0.5 rounded-full">
                            Đã hoàn thành
                          </span>
                        ) : isFull ? (
                          <span className="text-xs font-black text-muted bg-white border-2 border-black px-2.5 py-0.5 rounded-full">
                            Đã đủ người
                          </span>
                        ) : (
                          <span className="text-xs font-black text-black bg-white border-2 border-black px-2.5 py-0.5 rounded-full">
                            Còn trống {availableSlots} chỗ
                          </span>
                        )}
                        {isUserInThisMatch && (
                          <span className="font-black text-[11px] rounded-full px-2.5 py-0.5 bg-white text-primary border-2 border-black">
                            Đã tham gia
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-black text-base sm:text-lg hover:text-primary transition-colors leading-snug line-clamp-1">
                        <Link href={`/matches/${match.id || match._id}`}>
                          {match.title}
                        </Link>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="font-black text-black flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {match.venueName} {match.courtNumber ? `· ${match.courtNumber}` : ''}
                        </span>
                        <span>·</span>
                        <span className="font-bold text-muted">
                          {match.venueAddress} · Q. {match.district}
                        </span>
                        <span>·</span>
                        <div className="flex items-center gap-1 font-bold text-black">
                          <span>Trình độ:</span>
                          <span className="px-1.5 py-0.5 bg-white border border-black rounded text-[11px] font-black">
                            {minMeta.label}
                          </span>
                          <span>→</span>
                          <span className="px-1.5 py-0.5 bg-primary text-white border border-black rounded text-[11px] font-black">
                            {maxMeta.label}
                          </span>
                        </div>
                      </div>

                      {match.estimatedCostText && (
                        <div className="text-xs text-black font-bold flex items-center gap-1 pt-0.5">
                          <DollarCircleOutlined className="text-primary" />
                          <span>{match.estimatedCostText}</span>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Player count & CTA button */}
                    <div className="shrink-0 flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-3 lg:pt-0 border-t-2 lg:border-t-0 border-black">
                      <div className="flex items-center gap-1.5 text-xs font-black text-black">
                        <TeamOutlined className="text-black text-sm" />
                        <span>{match.joinedCount} / {match.totalSlots} VĐV</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUserInThisMatch && (
                          <a
                            href={getGoogleCalendarUrl(match)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="font-black text-xs rounded-xl bg-white hover:bg-white text-black border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 transition-all"
                            >
                              <CalendarOutlined />
                              <span className="hidden sm:inline">Lịch</span>
                            </button>
                          </a>
                        )}

                        <Link href={`/matches/${match.id || match._id}`}>
                          <button
                            className={`font-black text-xs sm:text-sm rounded-xl px-5 py-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all whitespace-nowrap ${
                              isCompleted
                                ? 'bg-white hover:bg-white text-black'
                                : 'bg-primary hover:bg-primary text-white'
                            }`}
                          >
                            {isCompleted ? 'Xem chi tiết' : 'Xem trận'}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── SHARED PAGINATION CONTROLS ─── */}
          {totalPages > 1 && (
            <div className="mt-12 pt-6 border-t-2 border-black flex items-center justify-end">
              <div className="flex items-center gap-1.5 bg-white shadow-[4px_4px_0px_0px_#000] p-1.5 rounded-2xl border-2 border-black">
                {/* Prev Button - Only visible when currentPage > 1 */}
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 border-2 border-transparent hover:border-black hover:bg-accent-baby text-black"
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
                          : 'text-black border-transparent hover:border-black hover:bg-accent-baby'
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
                    className="p-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 border-2 border-transparent hover:border-black hover:bg-accent-baby text-black"
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

        {/* MODAL: TẠO BUỔI GIAO LƯU */}
        <Modal
          title={
            <div>
              <h3 className="text-lg font-black text-ink">
                Tạo Buổi Giao Lưu Mới
              </h3>
              <p className="text-sm text-muted font-normal mt-0.5">
                Chọn địa điểm, thời gian và số người cần tìm.
              </p>
            </div>
          }
          open={isCreateOpen}
          onCancel={() => setIsCreateOpen(false)}
          footer={null}
          width={640}
          className="rounded-2xl"
          destroyOnHidden
        >
          <form onSubmit={handleCreateMatch} className="space-y-4 pt-3">
            {/* Bộ môn */}
            <div>
              <label className="block text-sm font-bold text-muted   mb-1.5">
                Bộ môn thi đấu *
              </label>
              <Segmented
                options={[
                  { label: ' Cầu lông', value: SportType.BADMINTON },
                  { label: ' Pickleball', value: SportType.PICKLEBALL },
                ]}
                value={formData.sport}
                onChange={(val) => setFormData({ ...formData, sport: val as SportType })}
                className="w-full bg-white font-bold p-1 rounded-xl"
                block
              />
            </div>

            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-bold text-muted   mb-1.5">
                Tiêu đề buổi giao lưu *
              </label>
              <Input
                required
                placeholder="Ví dụ: Tuyển 2 chân giao lưu đôi nam tối Thứ 5"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="large"
                className="rounded-xl"
              />
            </div>

            {/* Sân & Quận */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-muted   mb-1.5">
                  Tên sân thi đấu *
                </label>
                <Input
                  required
                  placeholder="Ví dụ: Sân Cầu Lông Kỳ Đồng"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  size="large"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted   mb-1.5">
                  Quận (Đà Nẵng) *
                </label>
                <Select
                  value={formData.district}
                  onChange={(val) => setFormData({ ...formData, district: val })}
                  size="large"
                  className="w-full"
                  options={DISTRICTS.filter((d) => d !== 'Tất cả').map((d) => ({
                    value: d,
                    label: `Quận ${d}`,
                  }))}
                />
              </div>
            </div>

            {/* Địa chỉ cụ thể */}
            <div>
              <label className="block text-sm font-bold text-muted   mb-1.5">
                Địa chỉ cụ thể *
              </label>
              <Input
                required
                placeholder="Ví dụ: 20 Kỳ Đồng, P. Xuân Hà, Thanh Khê, Đà Nẵng"
                value={formData.venueAddress}
                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                size="large"
                className="rounded-xl"
              />
            </div>

            {/* Giờ bắt đầu & Giờ kết thúc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-muted   mb-1.5">
                  Thời gian bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="cm-control w-full h-10 px-3.5 rounded-xl border border-ink text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted   mb-1.5">
                  Thời gian kết thúc *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="cm-control w-full h-10 px-3.5 rounded-xl border border-ink text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Slot & Trình độ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-muted   mb-1.5">
                  Tổng số người
                </label>
                <InputNumber
                  min={2}
                  max={12}
                  value={formData.totalSlots}
                  onChange={(val) => setFormData({ ...formData, totalSlots: Number(val) || 4 })}
                  size="large"
                  className="w-full rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted   mb-1.5">
                  Trình tối thiểu
                </label>
                <Select
                  value={formData.minSkillLevel}
                  onChange={(val) => setFormData({ ...formData, minSkillLevel: val })}
                  size="large"
                  className="w-full"
                  options={SKILL_OPTIONS.filter((o) => o.value !== 'ALL').map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted   mb-1.5">
                  Trình tối đa
                </label>
                <Select
                  value={formData.maxSkillLevel}
                  onChange={(val) => setFormData({ ...formData, maxSkillLevel: val })}
                  size="large"
                  className="w-full"
                  options={SKILL_OPTIONS.filter((o) => o.value !== 'ALL').map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              </div>
            </div>

            {/* Chi phí */}
            <div>
              <label className="block text-sm font-bold text-muted   mb-1.5">
                Hình thức chi phí
              </label>
              <Input
                placeholder="Ví dụ: Chia đều tiền sân tại chỗ (~40k/người)"
                value={formData.estimatedCostText}
                onChange={(e) => setFormData({ ...formData, estimatedCostText: e.target.value })}
                size="large"
                className="rounded-xl"
              />
              <p className="text-[11px] text-muted mt-1">
                * CourtMate không thu cọc trung gian. Người chơi chia đều chi phí trực tiếp tại sân.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-ink flex items-center justify-end gap-3">
              <Button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl font-semibold"
              >
                Hủy bỏ
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="rounded-xl font-bold cursor-pointer"
              >
                Xác nhận tạo trận
              </Button>
            </div>
          </form>
        </Modal>
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
        <MatchFilters
          isOpen={isFilterOpen}
          initialFilters={{
            sport: selectedSport,
            district: selectedDistrict,
            skill: selectedSkill,
          }}
          districts={DISTRICTS}
          skillOptions={SKILL_OPTIONS}
          onApply={(filters) => {
            setSelectedSport(filters.sport);
            setSelectedDistrict(filters.district);
            setSelectedSkill(filters.skill);
            setIsFilterOpen(false);
          }}
          onClose={() => setIsFilterOpen(false)}
        />
      </div>
    </div>
  );
}

