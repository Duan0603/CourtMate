'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GuestActionModal } from '../../../components/shared/GuestActionModal';
import { useParams, useRouter } from 'next/navigation';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  ShieldCheck,
  Share2,
  Bookmark,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Phone,
  ChevronRight,
  Sparkles,
  Check,
  Award,
  CircleAlert,
} from 'lucide-react';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';
import { getTournamentStatus, tournamentStatusLabel } from '../../../lib/tournament-status';
import { tournamentsApi } from '../../../lib/tournaments.api';
import { registrationsApi } from '../../../lib/registrations.api';
import { useSmartAsync } from '../../../context/useSmartAsync';
import { useAuth } from '../../../context/AuthContext';

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {
    loading,
    isThresholdElapsed,
    error,
    execute,
  } = useSmartAsync({ initialLoading: true });
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'rules' | 'participants'>('overview');
  const [participants, setParticipants] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const confirmedParticipants = participants.filter(
    (p) => p.status === 'PAID' || p.status === 'APPROVED'
  );
  const enrolledCount = Math.max(
    confirmedParticipants.length,
    (tournament as any)?.joinedSlots || 0
  );

  const registrationOpen = !!tournament && getTournamentStatus(tournament) === TournamentStatus.OPEN && new Date(tournament.startDate).getTime() > Date.now();

  const handleRegisterClick = (e: React.MouseEvent) => {
    if (!registrationOpen) return;
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginModal(true);
    } else {
      router.push(`/tournaments/${tournamentId}/register`);
    }
  };

  const loadData = async () => {
    if (!tournamentId) return;
    try {
      await execute(async () => {
        const data = await tournamentsApi.getTournamentDetails(tournamentId);
        setTournament(data);
        const regs = await registrationsApi.getRegistrationsByTournament(tournamentId);
        setParticipants(regs || []);
      });
    } catch (e) {
      console.error('Lỗi khi tải chi tiết giải đấu:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareZalo = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(` [CourtMate] Tham gia giải đấu: ${tournament?.title || ''}`);
    window.open(`https://zalo.me/share?url=${url}&text=${text}`, '_blank');
  };

  if (loading && isThresholdElapsed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-semibold">Đang tải thông tin giải đấu...</p>
      </div>
    );
  }

  if (error || (!loading && !tournament)) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {error ? 'Không thể kết nối đến giải đấu' : 'Không tìm thấy giải đấu'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {typeof error === 'string'
            ? error
            : (error as any)?.message ||
              'Giải đấu này không tồn tại hoặc đã bị ẩn khỏi hệ thống.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={loadData}
            className="cm-action cm-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow hover:bg-primary-dark transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/tournaments"
            className="cm-link inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const formattedFee = tournament.registrationFee
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tournament.registrationFee)
    : 'Miễn phí';

  const startDateFormatted = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Đang cập nhật';

  const endDateFormatted = tournament.endDate
    ? new Date(tournament.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Đang cập nhật';

  const slotsLimit = tournament.slotsLimit || 50;
  const slotsLeft = Math.max(0, slotsLimit - confirmedParticipants.length);
  const fillPercentage = Math.min(100, (confirmedParticipants.length / slotsLimit) * 100);

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* ─── BREADCRUMB & BACK NAV ─── */}
      <div className="page-container pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả giải đấu</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="cm-button inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              title="Chia sẻ liên kết"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
            <button
              onClick={handleShareZalo}
              className="cm-button inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0068FF] text-white text-xs font-bold hover:bg-[#0052cc] transition-colors shadow-sm"
            >
              Zalo
            </button>
          </div>
        </div>
      </div>

      {/* ─── HERO COVER BANNER (Modern Compact Size) ─── */}
      <div className="page-container">
        <div className="relative h-60 sm:h-72 lg:h-[290px] w-full rounded-3xl overflow-hidden shadow-lg group border border-slate-200/60 bg-slate-900">
          <img
            src={
              tournament.coverImage ||
              (tournament.sport === 'PICKLEBALL'
                ? '/tournaments/pickleball-1.jpg'
                : '/tournaments/badminton-1.jpg')
            }
            alt={tournament.title}
            className="w-full h-full object-cover transition-transform duration-700 group- opacity-90"
          />
          {/* Subtle multi-layer gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent hidden sm:block" />

          {/* Floating Content on Hero */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                 {tournament.sport}
              </span>

              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                  getTournamentStatus(tournament) === TournamentStatus.OPEN
                    ? 'bg-emerald-500 text-white'
                    : getTournamentStatus(tournament) === TournamentStatus.COMPLETED || (tournament.status as string) === 'CANCELLED'
                      ? 'bg-slate-500 text-white'
                      : 'bg-amber-500 text-white'
                }`}
              >
                {tournamentStatusLabel[getTournamentStatus(tournament)]}
              </span>

              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-slate-100">
                 {tournament.city}
              </span>

              {tournament.organizer?.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  BTC Xác Thực
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-3xl font-black tracking-tight leading-tight text-white mb-2">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{tournament.location} • {tournament.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{startDateFormatted} - {endDateFormatted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2-COLUMN MAIN CONTENT ─── */}
      <div className="page-container mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column (2/3): Tabs & Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tab Navigation Pill Bar */}
            <div className="bg-surface shadow-card rounded-2xl border border-slate-200/80 p-1.5 flex gap-1  overflow-x-auto hide-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'categories', label: 'Nội dung & Lệ phí' },
                { id: 'rules', label: 'Điều lệ thi đấu' },
                { id: 'participants', label: `Vận động viên (${confirmedParticipants.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`cm-button px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex-1 text-center ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Box */}
            <div className="bg-surface shadow-card rounded-3xl border border-slate-200/80 p-6 sm:p-8 ">

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Organizer Badge Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={tournament.organizer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={tournament.organizer?.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Đơn vị tổ chức</div>
                        <div className="text-slate-900 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                          <span>{tournament.organizer?.name || 'Ban tổ chức CourtMate'}</span>
                          {tournament.organizer?.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/chat?userId=${tournament.organizer?.id}&userName=${encodeURIComponent(tournament.organizer?.name || 'Ban tổ chức')}&avatar=${encodeURIComponent(tournament.organizer?.avatar || '')}`)}
                      className="cm-button inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-primary hover:bg-sky-50 text-xs sm:text-sm font-bold transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Nhắn tin ban tổ chức</span>
                    </button>
                  </div>

                  {/* Description Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Giới thiệu
                    </h3>

                    <div className="text-slate-600 text-sm sm:text-[15px] leading-relaxed space-y-3 whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      {tournament.description || 'Chưa có thông tin mô tả chi tiết từ ban tổ chức.'}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Time Card */}
                    <div className="p-5 rounded-2xl bg-surface shadow-card border border-slate-200/80  flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Thời gian thi đấu</div>
                        <div className="text-slate-900 font-bold text-sm sm:text-base">
                          {startDateFormatted}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          Đến hết ngày {endDateFormatted}
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="p-5 rounded-2xl bg-surface shadow-card border border-slate-200/80  flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Địa điểm sân đấu</div>
                        <div className="text-slate-900 font-bold text-sm sm:text-base leading-snug">
                          {tournament.location}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {tournament.city}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Categories */}
              {activeTab === 'categories' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Hạng mục thi đấu
                  </h3>

                  <div className="space-y-3">
                    {tournament.categories && tournament.categories.length > 0 ? (
                      tournament.categories.map((cat, idx) => (
                        <div
                          key={cat.id || idx}
                          className="p-5 rounded-2xl border border-slate-200/80 bg-surface shadow-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-sky-50 text-primary flex items-center justify-center shrink-0 font-black text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-base">{cat.name}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Users className="w-3.5 h-3.5 text-muted" />
                                <span>Giới hạn: {cat.maxParticipants || 32} cặp/VĐV</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            <span className="text-base sm:text-lg font-black text-primary">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cat.fee)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Mở đăng ký
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-sm">
                        Chưa có danh mục cụ thể cho giải đấu này.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Rules */}
              {activeTab === 'rules' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Điều lệ thi đấu chính thức
                  </h3>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {tournament.rulesText || tournament.rules || 'Đang cập nhật điều lệ chính thức từ ban tổ chức...'}
                  </div>
                </div>
              )}

              {/* Tab 4: Participants */}
              {activeTab === 'participants' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Người đã đăng ký
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {confirmedParticipants.length} VĐV
                    </span>
                  </div>

                  {confirmedParticipants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {confirmedParticipants.map((reg, idx) => (
                        <div
                          key={reg.id || idx}
                          className="p-4 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{reg.playerName}</div>
                              {reg.partnerName && (
                                <div className="text-[11px] text-slate-500 font-medium">
                                  Cùng: {reg.partnerName}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {reg.status === 'PAID' ? 'ĐÃ ĐÓNG PHÍ' : 'ĐÃ DUYỆT'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Chưa có vận động viên nào hoàn tất thủ tục đăng ký.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column (1/3): Sticky Registration Card */}
          <div className="lg:col-span-1">
            <div className="bg-surface shadow-card rounded-3xl border border-slate-200/90 p-6 sm:p-7  sticky top-24 space-y-6">

              <div className="text-center pb-5 border-b border-slate-100">
                <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
                  Lệ phí thi đấu từ
                </span>
                <div className="text-3xl font-black text-primary tracking-tight">
                  {formattedFee}
                </div>

              </div>

              {/* Progress limit */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 mb-2.5">
                  <span>Đã đăng ký:</span>
                  <span className="text-primary font-bold">
                    {tournament.slotsLimit ? (
                      <>
                        {enrolledCount} / {tournament.slotsLimit} chỗ
                        <span className="text-xs text-slate-500 font-normal ml-1.5">
                          (Còn {Math.max(0, tournament.slotsLimit - enrolledCount)})
                        </span>
                      </>
                    ) : (
                      'Không giới hạn'
                    )}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (enrolledCount / (tournament.slotsLimit || 50)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleRegisterClick}
                disabled={!registrationOpen}
                className="cm-button w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-[#123E75] hover:from-primary-dark hover:to-[#0A2540] text-white font-bold text-base text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{registrationOpen ? 'Đăng ký tham gia ngay' : 'Đã đóng đăng ký'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Compact Badges */}


            </div>
          </div>

        </div>
      </div>

      <GuestActionModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} redirectUrl={`/tournaments/${tournamentId}/register`} />
    </div>
  );
}
