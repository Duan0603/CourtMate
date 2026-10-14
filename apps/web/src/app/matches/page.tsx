'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  Share2,
  CheckCircle,
  Filter,
  Sparkles,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

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

import { useSmartAsync } from '@/context/useSmartAsync';
import { SmartAsyncContainer } from '@/components/loading/SmartAsyncContainer';

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches();
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đăng kèo tìm người!');
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
      setMessage({ text: 'Đăng kèo giao lưu thành công!', type: 'success' });
      fetchMatches();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo kèo. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-8 sm:pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E5AA8] via-[#154689] to-[#0A2540] text-white p-8 sm:p-12 mb-10 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Ghép Kèo Phong Trào On-Demand
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              Tìm Bạn Chơi & Lắp Kèo Cầu Lông Tại Đà Nẵng
            </h1>
            <p className="text-slate-200 text-base sm:text-lg mb-8 leading-relaxed font-normal">
              Đã thuê sân nhưng thiếu người? Muốn tìm nhóm giao lưu vừa tầm? Tham gia ngay các trận đấu mở hoặc tạo kèo rủ bạn bè chỉ trong 30 giây!
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = '/login';
                  } else {
                    setIsCreateOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-5 h-5" />
                Đăng Kèo Tìm Người Ngay
              </button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 bg-white/5 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Không thu cọc trung gian • Chia đều tiền sân tại chỗ</span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-sm">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative md:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên sân, địa chỉ, kèo..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8]"
              />
            </form>

            {/* Sport Select */}
            <div>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value as SportType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8]"
              >
                <option value={SportType.BADMINTON}>🏸 Cầu Lông (Trọng tâm)</option>
                <option value={SportType.PICKLEBALL}>🏓 Pickleball</option>
              </select>
            </div>

            {/* District Select */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8]"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    📍 {d === 'Tất cả' ? 'Tất cả Quận Đà Nẵng' : `Quận ${d}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Level Select */}
            <div>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8]"
              >
                {SKILL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    🎯 {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MATCHES LIST */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Kèo Đang Tuyển Người</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] font-bold">
              {matches.length}
            </span>
          </h2>
        </div>

        <SmartAsyncContainer
          loading={loading}
          isThresholdElapsed={isThresholdElapsed}
          error={error}
          onRetry={fetchMatches}
          errorMessage="Không thể kết nối đến máy chủ để tải danh sách kèo đấu."
        >
          {matches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#1E5AA8]/10 text-[#1E5AA8] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có kèo nào phù hợp tiêu chí</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Bạn có thể thử chọn quận khác, hoặc là người đầu tiên đăng kèo để rủ các tay vợt quanh khu vực tham gia!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E5AA8] text-white font-semibold text-sm shadow hover:bg-[#154689] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Đăng Kèo Mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const minMeta = BADMINTON_SKILL_LABELS[match.minSkillLevel] || { label: match.minSkillLevel, color: 'bg-slate-100 text-slate-800' };
              const maxMeta = BADMINTON_SKILL_LABELS[match.maxSkillLevel] || { label: match.maxSkillLevel, color: 'bg-slate-100 text-slate-800' };
              const availableSlots = match.totalSlots - match.joinedCount;
              const isFull = match.status === MatchStatus.FULL || availableSlots <= 0;

              return (
                <div
                  key={match.id || match._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5">
                    {/* Header: Sport & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-sky-50 text-[#1E5AA8] border border-sky-100">
                        {match.sport === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball'}
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isFull
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isFull ? 'Đã đủ người' : `Còn trống ${availableSlots} chỗ`}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1 hover:text-[#1E5AA8]">
                      <Link href={`/matches/${match.id || match._id}`}>{match.title}</Link>
                    </h3>

                    {/* Venue & Location */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#1E5AA8] shrink-0" />
                        <span className="truncate">{match.venueName} {match.courtNumber ? `(${match.courtNumber})` : ''}</span>
                      </div>
                      <div className="pl-5 text-slate-500 text-[11px] truncate">
                        {match.venueAddress} • Q. {match.district}
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{formatDateTime(match.startTime)}</span>
                      </div>
                    </div>

                    {/* Skill Level Badge */}
                    <div className="mb-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Trình độ yêu cầu:
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${minMeta.color}`}>
                          {minMeta.label}
                        </span>
                        <span className="text-slate-400 text-xs">đến</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${maxMeta.color}`}>
                          {maxMeta.label}
                        </span>
                      </div>
                    </div>

                    {/* Cost note */}
                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 mb-2">
                      💰 <span className="font-medium">{match.estimatedCostText}</span>
                    </div>
                  </div>

                  {/* Footer: Players & CTA */}
                  <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">
                        {match.joinedCount}/{match.totalSlots} VĐV
                      </span>
                    </div>

                    <Link
                      href={`/matches/${match.id || match._id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#1E5AA8] text-white font-semibold text-xs hover:bg-[#154689] transition-colors"
                    >
                      Chi tiết & Vào kèo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </SmartAsyncContainer>

        {/* MODAL: ĐĂNG KÈO MỚI */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Đăng Kèo Tìm Người Giao Lưu</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tạo kèo ghép slot nhanh chóng, chia sẻ ngay cho bạn bè</p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tiêu đề kèo đấu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vd: Tuyển 2 chân giao lưu đôi nam tối T5"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tên sân thi đấu *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Vd: Sân Cầu Lông Kỳ Đồng"
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Quận *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none font-medium"
                    >
                      {DISTRICTS.filter((d) => d !== 'Tất cả').map((d) => (
                        <option key={d} value={d}>
                          Quận {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vd: 20 Kỳ Đồng, P. Xuân Hà, Thanh Khê, Đà Nẵng"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Giờ bắt đầu *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Giờ kết thúc *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tổng số người
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={formData.totalSlots}
                      onChange={(e) => setFormData({ ...formData, totalSlots: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Trình tối thiểu
                    </label>
                    <select
                      value={formData.minSkillLevel}
                      onChange={(e) => setFormData({ ...formData, minSkillLevel: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                    >
                      {SKILL_OPTIONS.filter((o) => o.value !== 'ALL').map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Trình tối đa
                    </label>
                    <select
                      value={formData.maxSkillLevel}
                      onChange={(e) => setFormData({ ...formData, maxSkillLevel: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                    >
                      {SKILL_OPTIONS.filter((o) => o.value !== 'ALL').map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hình thức chi phí
                  </label>
                  <input
                    type="text"
                    placeholder="Vd: Chia đều tiền sân tại chỗ (~40k/người)"
                    value={formData.estimatedCostText}
                    onChange={(e) => setFormData({ ...formData, estimatedCostText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    * CourtMate không thu tiền cọc, người chơi tự thanh toán trực tiếp tại sân.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1E5AA8] hover:bg-[#154689] text-white shadow-md transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Đang tạo...' : 'Tạo Kèo & Lấy Link Chia Sẻ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
