'use client';

import { PageContainer } from '../../components/layout/PageContainer';

import { ContentSkeleton } from '../../components/loading/ContentSkeleton';
import React, { useState, useEffect, useRef } from 'react';
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
import { MapPin, Search, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { MatchFilters } from '../../components/matches/MatchFilters';

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
  Alert,
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
  const {
    loading,
    isThresholdElapsed,
    error,
    execute,
    resetError,
  } = useSmartAsync({ initialLoading: true });

  // Filters
  const [selectedSport, setSelectedSport] = useState<SportType>(SportType.BADMINTON);
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [selectedSkill, setSelectedSkill] = useState<BadmintonSkillLevel | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtRef = useRef<HTMLDivElement>(null);

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

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const fetchMatches = async () => {
    try {
      await execute(async () => {
        const res = await matchesApi.getMatches({
          sport: selectedSport,
          district: selectedDistrict !== 'Tất cả' ? selectedDistrict : undefined,
          skillLevel: selectedSkill !== 'ALL' ? selectedSkill : undefined,
          keyword: searchKeyword || undefined,
        });
        setMatches(res.data);
      });
    } catch (err) {
      console.error('Lỗi tải danh sách kèo đấu:', err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedSport, selectedDistrict, selectedSkill]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchMatches();
  };

  const handleResetFilters = () => {
    setSelectedSport(SportType.BADMINTON);
    setSelectedDistrict('Tất cả');
    setSelectedSkill('ALL');
    setSearchKeyword('');
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
      setMessage({ text: 'Đã tạo trận giao lưu.', type: 'success' });
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tìm bạn chơi
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
              Chọn trận theo trình độ, thời gian và địa điểm.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
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
              className="font-bold shadow-md shadow-blue-500/20   transition-all cursor-pointer"
            >
              Tạo trận giao lưu
            </Button>
          </div>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className="mt-4">
            <Alert
              message={message.text}
              type={message.type}
              showIcon
              closable
              onClose={() => setMessage(null)}
              className="rounded-xl shadow-xs font-medium"
            />
          </div>
        )}

        {/* BANNER NHẮC LỊCH THI ĐẤU ĐÃ THAM GIA */}
        {userActiveMatch && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-white border border-primary/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 text-lg">
                <CalendarOutlined />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Tag color="green" className="font-bold text-xs rounded-full px-2.5 py-0.5 border-none uppercase">
                    Đã tham gia
                  </Tag>
                  <span className="text-xs font-bold text-primary bg-blue-100/70 px-2 py-0.5 rounded-full">
                    {userActiveMatch.sport === SportType.BADMINTON ? ' Cầu lông' : ' Pickleball'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Mỗi người chơi tham gia 1 slot/lần)
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {userActiveMatch.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap font-medium">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <ClockCircleOutlined className="text-amber-500" />
                    {formatDateTime(userActiveMatch.startTime)}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
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
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  className="w-full font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
                >
                  Lưu vào Google Calendar
                </Button>
              </a>
              <Link href={`/matches/${userActiveMatch.id || userActiveMatch._id}`} className="flex-1 md:flex-none">
                <Button className="w-full font-bold text-xs rounded-xl text-slate-700">
                  Xem trận
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* MAIN TOOLBAR (Search & Filter) - Synchronized with Tournaments UI */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 mb-4">
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
                  {selectedDistrict === 'Tất cả' ? 'Tất cả khu vực' : `Quận ${selectedDistrict}`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isDistrictOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDistrictOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-surface shadow-card rounded-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
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
                        className={`cm-button w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-muted hover:bg-slate-50 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted'}`} />
                          <span>{d === 'Tất cả' ? 'Tất cả các quận' : `Quận ${d}`}</span>
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
                placeholder="Tìm tên sân, địa chỉ, trận đấu..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchMatches();
                  }
                }}
                className="cm-control w-full bg-transparent pl-9 pr-4 py-2 text-xs sm:text-sm outline-none text-navy placeholder:text-muted font-medium"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                  }}
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
            onClick={() => setIsFilterOpen(true)}
            className={`cm-button shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeDrawerFiltersCount > 0
                ? 'bg-primary text-white hover:bg-primary-dark border border-primary'
                : 'bg-surface shadow-card text-navy border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc {activeDrawerFiltersCount > 0 && `· ${activeDrawerFiltersCount}`}</span>
            {activeDrawerFiltersCount > 0 && (
              <div
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSport(SportType.BADMINTON);
                  setSelectedSkill('ALL');
                }}
              >
                <X className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </div>

        {/* ACTIVE FILTER CHIPS ROW */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {selectedSport !== SportType.BADMINTON && (
              <button
                type="button"
                onClick={() => setSelectedSport(SportType.BADMINTON)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Môn: {selectedSport === SportType.PICKLEBALL ? 'Pickleball' : 'Cầu lông'}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {selectedDistrict !== 'Tất cả' && (
              <button
                type="button"
                onClick={() => setSelectedDistrict('Tất cả')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Khu vực: Q. {selectedDistrict}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {selectedSkill !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedSkill('ALL')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Trình độ: {SKILL_OPTIONS.find((s) => s.value === selectedSkill)?.label}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {searchKeyword.trim() && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <span>Từ khóa: “{searchKeyword}”</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors ml-1 underline underline-offset-2"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* LIST STATUS HEADER */}
        <div className="mt-8 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Danh Sách Trận Giao Lưu
            </h2>
            <Tag color="#1E5AA8" className="font-bold text-xs rounded-full px-2.5 py-0.5 border-none">
              {loading ? 'Đang tải...' : `${matches.length} trận`}
            </Tag>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Tự do tham gia hoặc mời đồng đội chia sẻ chi phí
          </span>
        </div>

        {/* MATCHES LIST */}
        <SmartAsyncContainer
          skeleton={<ContentSkeleton layout="matches" count={6} />}
          loading={loading}
          isThresholdElapsed={isThresholdElapsed}
          error={error}
          onRetry={fetchMatches}
          errorMessage="Không thể kết nối đến máy chủ để tải danh sách kèo đấu."
        >
          {matches.length === 0 ? (
            <div className="text-center py-16 bg-surface shadow-card rounded-2xl border border-slate-200/90 p-8 ">
              <Empty
                description={
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-800">
                      Chưa có trận giao lưu nào phù hợp tiêu chí lọc
                    </p>
                    <p className="text-sm sm:text-sm text-slate-500 max-w-md mx-auto">
                      Bạn có thể chọn quận khác, hoặc là người đầu tiên tạo buổi giao lưu để các tay vợt quanh khu vực tham gia.
                    </p>
                  </div>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = '/login?redirect=/matches';
                    } else {
                      setIsCreateOpen(true);
                    }
                  }}
                  className="mt-3 font-bold cursor-pointer"
                >
                  Tạo Giao Lưu Ngay
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map((match) => {
                const minMeta = BADMINTON_SKILL_LABELS[match.minSkillLevel] || {
                  label: match.minSkillLevel,
                  color: 'bg-slate-100 text-slate-800 border-slate-200',
                };
                const maxMeta = BADMINTON_SKILL_LABELS[match.maxSkillLevel] || {
                  label: match.maxSkillLevel,
                  color: 'bg-slate-100 text-slate-800 border-slate-200',
                };
                const availableSlots = match.totalSlots - match.joinedCount;
                const isFull = match.status === MatchStatus.FULL || availableSlots <= 0;

                const uid = user ? (user.id || (user as any)._id) : null;
                const isUserInThisMatch = Boolean(
                  uid && match.players?.some((p) => p.userId === uid)
                );

                return (
                  <Card
                    key={match.id || match._id}
                    hoverable
                    className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${isUserInThisMatch
                        ? 'border-emerald-500/80 ring-2 ring-emerald-500/15 shadow-sm bg-gradient-to-b from-white to-emerald-50/20'
                        : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-primary/50'
                      }`}
                    styles={{ body: { padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' } }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Tag
                            color={match.sport === SportType.BADMINTON ? 'blue' : 'orange'}
                            className="font-bold text-xs rounded-lg px-2.5 py-0.5 border-none uppercase tracking-wider"
                          >
                            {match.sport === SportType.BADMINTON ? ' Cầu lông' : ' Pickleball'}
                          </Tag>
                          {isUserInThisMatch && (
                            <Tag color="green" className="font-bold text-[11px] rounded-md px-2 py-0.5 border-none">
                              Đã tham gia
                            </Tag>
                          )}
                        </div>

                        <Badge
                          status={isFull ? 'default' : 'success'}
                          text={
                            <span className={`text-xs font-bold ${isFull ? 'text-slate-500' : 'text-emerald-700'}`}>
                              {isFull ? 'Đã đủ người' : `Còn trống ${availableSlots} chỗ`}
                            </span>
                          }
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isFull ? 'bg-slate-100' : 'bg-emerald-50 border border-emerald-200'
                            }`}
                        />
                      </div>

                      {/* Title */}
                      <h3 className="font-black text-slate-900 text-base mb-2 line-clamp-2 hover:text-primary transition-colors leading-snug">
                        <Link href={`/matches/${match.id || match._id}`}>
                          {match.title}
                        </Link>
                      </h3>

                      {/* Venue & Time with Icons */}
                      <div className="space-y-1.5 text-xs text-slate-600 mb-3.5">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <EnvironmentOutlined className="text-primary shrink-0" />
                          <span>
                            {match.venueName} {match.courtNumber ? `· ${match.courtNumber}` : ''}
                          </span>
                        </div>
                        <div className="truncate text-slate-500 pl-4">
                          {match.venueAddress} · Q. {match.district}
                        </div>
                        <div className="font-mono text-slate-800 flex items-center gap-1.5 pt-0.5">
                          <ClockCircleOutlined className="text-amber-500 shrink-0" />
                          <span>{formatDateTime(match.startTime)}</span>
                        </div>
                      </div>

                      {/* Skill requirements */}
                      <div className="pt-3 border-t border-slate-100 text-xs flex items-center gap-1">
                        <span className="text-slate-500 font-medium">Trình độ:</span>
                        <Tag color="cyan" className="font-bold rounded-md text-[11px] m-0">
                          {minMeta.label}
                        </Tag>
                        <span className="text-muted">→</span>
                        <Tag color="blue" className="font-bold rounded-md text-[11px] m-0">
                          {maxMeta.label}
                        </Tag>
                      </div>

                      {/* Cost Note */}
                      <div className="mt-2.5 text-xs bg-slate-50 rounded-xl p-2.5 text-slate-700 font-medium border border-slate-100 flex items-start gap-1.5">
                        <DollarCircleOutlined className="text-emerald-600 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{match.estimatedCostText}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <TeamOutlined className="text-muted" />
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
                            <Button
                              type="primary"
                              size="small"
                              icon={<CalendarOutlined />}
                              className="font-bold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 border-none shadow-xs"
                            >
                              Lưu Calendar
                            </Button>
                          </a>
                        )}

                        <Link href={`/matches/${match.id || match._id}`}>
                          <Button
                            type={isUserInThisMatch ? 'default' : 'primary'}
                            size="small"
                            className="font-bold text-xs rounded-lg shadow-xs  transition-all"
                          >
                            Xem trận
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </SmartAsyncContainer>

        {/* MODAL: TẠO BUỔI GIAO LƯU */}
        <Modal
          title={
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Tạo Buổi Giao Lưu Mới
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-0.5">
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
              <label className="block text-sm font-bold text-slate-700   mb-1.5">
                Bộ môn thi đấu *
              </label>
              <Segmented
                options={[
                  { label: ' Cầu lông', value: SportType.BADMINTON },
                  { label: ' Pickleball', value: SportType.PICKLEBALL },
                ]}
                value={formData.sport}
                onChange={(val) => setFormData({ ...formData, sport: val as SportType })}
                className="w-full bg-slate-100 font-bold p-1 rounded-xl"
                block
              />
            </div>

            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-bold text-slate-700   mb-1.5">
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
                <label className="block text-sm font-bold text-slate-700   mb-1.5">
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
                <label className="block text-sm font-bold text-slate-700   mb-1.5">
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
              <label className="block text-sm font-bold text-slate-700   mb-1.5">
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
                <label className="block text-sm font-bold text-slate-700   mb-1.5">
                  Thời gian bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="cm-control w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700   mb-1.5">
                  Thời gian kết thúc *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="cm-control w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Slot & Trình độ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700   mb-1.5">
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
                <label className="block text-sm font-bold text-slate-700   mb-1.5">
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
                <label className="block text-sm font-bold text-slate-700   mb-1.5">
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
              <label className="block text-sm font-bold text-slate-700   mb-1.5">
                Hình thức chi phí
              </label>
              <Input
                placeholder="Ví dụ: Chia đều tiền sân tại chỗ (~40k/người)"
                value={formData.estimatedCostText}
                onChange={(e) => setFormData({ ...formData, estimatedCostText: e.target.value })}
                size="large"
                className="rounded-xl"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                * CourtMate không thu cọc trung gian. Người chơi chia đều chi phí trực tiếp tại sân.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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

