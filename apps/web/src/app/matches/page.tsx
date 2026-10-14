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
import { useSmartAsync } from '@/context/useSmartAsync';
import { SmartAsyncContainer } from '@/components/loading/SmartAsyncContainer';

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
    <div className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP COMMAND BAR (Anti-Slop: Clean, High contrast, No icons, Clear intent) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              On-Demand Matchmaking · Đà Nẵng
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Ghép Kèo Giao Lưu & Tìm Bạn Chơi
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
              Các trận cầu đang mở slot tại các cụm sân Đà Nẵng. Không thu phí trung gian, chia đều tiền sân trực tiếp tại chỗ.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = '/login?redirect=/matches';
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-tight transition-colors shadow-sm"
            >
              + Đăng Kèo Mới
            </button>
          </div>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-sm font-semibold">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs uppercase tracking-wider font-bold"
            >
              Đóng
            </button>
          </div>
        )}

        {/* SEARCH & FILTER CONTROLS BAR (No icons, high legibility) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mt-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit}>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Tìm kiếm sân / kèo
              </label>
              <input
                type="text"
                placeholder="Nhập tên sân, địa chỉ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </form>

            {/* Sport Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Bộ môn
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value as SportType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              >
                <option value={SportType.BADMINTON}>Cầu lông</option>
                <option value={SportType.PICKLEBALL}>Pickleball</option>
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Khu vực (Đà Nẵng)
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d === 'Tất cả' ? 'Tất cả các quận' : `Quận ${d}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Level Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Trình độ yêu cầu
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              >
                {SKILL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LIST STATUS HEADER */}
        <div className="mt-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Danh sách trận đấu
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {matches.length} kèo
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tự do tham gia hoặc mời đồng đội
          </span>
        </div>

        {/* MATCHES LIST */}
        <SmartAsyncContainer
          loading={loading}
          isThresholdElapsed={isThresholdElapsed}
          error={error}
          onRetry={fetchMatches}
          errorMessage="Không thể kết nối đến máy chủ để tải danh sách kèo đấu."
        >
          {matches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Chưa có kèo nào phù hợp tiêu chí lọc
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6">
                Bạn có thể chọn quận khác, hoặc là người đầu tiên tạo kèo để các tay vợt quanh khu vực tham gia.
              </p>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = '/login?redirect=/matches';
                  } else {
                    setIsCreateOpen(true);
                  }
                }}
                className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs tracking-tight hover:bg-slate-800 transition-colors"
              >
                + Đăng Kèo Mới Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                return (
                  <div
                    key={match.id || match._id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-colors shadow-xs flex flex-col justify-between"
                  >
                    <div className="p-4 sm:p-5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {match.sport === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball'}
                        </span>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isFull
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isFull ? 'Đã đủ người' : `Còn trống ${availableSlots} chỗ`}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2 hover:text-[#1E5AA8] transition-colors">
                        <Link href={`/matches/${match.id || match._id}`}>
                          {match.title}
                        </Link>
                      </h3>

                      {/* Venue & Time (No icons, clear structured hierarchy) */}
                      <div className="space-y-1 text-xs text-slate-600 mb-3">
                        <div className="font-semibold text-slate-900 truncate">
                          {match.venueName} {match.courtNumber ? `· ${match.courtNumber}` : ''}
                        </div>
                        <div className="truncate text-slate-600">
                          {match.venueAddress} · Q. {match.district}
                        </div>
                        <div className="font-mono text-slate-800 pt-1">
                          {formatDateTime(match.startTime)}
                        </div>
                      </div>

                      {/* Skill requirements */}
                      <div className="pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 font-medium">Trình độ: </span>
                        <span className="font-bold text-slate-900">
                          {minMeta.label}
                        </span>
                        <span className="text-slate-400 mx-1">đến</span>
                        <span className="font-bold text-slate-900">
                          {maxMeta.label}
                        </span>
                      </div>

                      {/* Cost Note */}
                      <div className="mt-2 text-xs bg-slate-50 rounded p-2 text-slate-700 font-medium border border-slate-100">
                        Chi phí: {match.estimatedCostText}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {match.joinedCount} / {match.totalSlots} VĐV
                      </span>

                      <Link
                        href={`/matches/${match.id || match._id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-tight transition-colors"
                      >
                        Chi tiết kèo →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SmartAsyncContainer>

        {/* MODAL: ĐĂNG KÈO MỚI (No icons, clean form fields) */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Đăng Kèo Tìm Người Giao Lưu
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tạo kèo nhanh chóng để ghép người chơi cùng khung giờ
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Đóng [ESC]
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
                    placeholder="Ví dụ: Tuyển 2 chân giao lưu đôi nam tối Thứ 5"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
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
                      placeholder="Ví dụ: Sân Cầu Lông Kỳ Đồng"
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Quận *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none font-medium"
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
                    placeholder="Ví dụ: 20 Kỳ Đồng, P. Xuân Hà, Thanh Khê, Đà Nẵng"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Trình tối thiểu
                    </label>
                    <select
                      value={formData.minSkillLevel}
                      onChange={(e) => setFormData({ ...formData, minSkillLevel: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
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
                    placeholder="Ví dụ: Chia đều tiền sân tại chỗ (~40k/người)"
                    value={formData.estimatedCostText}
                    onChange={(e) => setFormData({ ...formData, estimatedCostText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * CourtMate không thu cọc trung gian. Người chơi chia đều chi phí trực tiếp tại sân.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Đang tạo...' : 'Xác nhận đăng kèo'}
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
