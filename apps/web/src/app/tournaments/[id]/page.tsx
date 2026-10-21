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
import { Tournament, TournamentStatus, SportType, UserRole } from '@courtmate/shared';
import { getTournamentStatus, tournamentStatusLabel } from '../../../lib/tournament-status';
import { tournamentsApi } from '../../../lib/tournaments.api';
import { registrationsApi } from '../../../lib/registrations.api';
import { useSmartAsync } from '../../../context/useSmartAsync';
import { useAuth } from '../../../context/AuthContext';
import { message } from 'antd';

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { isAuthenticated, user } = useAuth();

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

  const handleShareZalo = async () => {
    const rawUrl = window.location.href;
    const shareTitle = `[CourtMate] Tham gia giải đấu: ${tournament?.title || ''}`;
    const shareBody = `${shareTitle} tại ${tournament?.location || ''} (${tournament?.city || ''}). Tham gia ngay: ${rawUrl}`;

    try {
      await navigator.clipboard.writeText(shareBody);
      message.success('Đã sao chép liên kết & lời mời Zalo vào bộ nhớ tạm!');
    } catch {
      // ignore
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareBody,
          url: rawUrl,
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share API notice:', err);
        }
      }
    }

    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocalhost) {
      window.open('https://chat.zalo.me', '_blank');
    } else {
      window.open(`https://sp.zalo.me/plugins/share?layout=1&color=blue&customize=false&width=0&height=0&isDesktop=true&url=${encodeURIComponent(rawUrl)}`, '_blank');
    }
  };

  if (loading && isThresholdElapsed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted text-sm font-semibold">Đang tải thông tin giải đấu...</p>
      </div>
    );
  }

  if (error || (!loading && !tournament)) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-accent-tan text-primary flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink mb-1">
          {error ? 'Không thể kết nối đến giải đấu' : 'Không tìm thấy giải đấu'}
        </h2>
        <p className="text-sm text-muted mb-6">
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
            className="cm-link inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-muted font-semibold text-sm hover:bg-white transition-colors"
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
            className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả giải đấu</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="cm-button inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-ink text-xs font-semibold text-muted hover:bg-white transition-colors shadow-sm"
              title="Chia sẻ liên kết"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-primary" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
            <button
              onClick={handleShareZalo}
              className="cm-button inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary transition-colors shadow-sm"
            >
              Zalo
            </button>
          </div>
        </div>
      </div>

      {/* ─── HERO COVER BANNER (Modern Compact Size) ─── */}
      <div className="page-container">
        <div className="relative h-60 sm:h-72 lg:h-[290px] w-full rounded-3xl overflow-hidden shadow-lg group border border-ink bg-primary">
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
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-black/45 hidden sm:block" />

          {/* Floating Content on Hero */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                 {tournament.sport}
              </span>

              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                  getTournamentStatus(tournament) === TournamentStatus.OPEN
                    ? 'bg-primary text-white'
                    : getTournamentStatus(tournament) === TournamentStatus.COMPLETED || (tournament.status as string) === 'CANCELLED'
                      ? 'bg-white text-white'
                      : 'bg-primary text-white'
                }`}
              >
                {tournamentStatusLabel[getTournamentStatus(tournament)]}
              </span>

              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-white">
                 {tournament.city}
              </span>

              {tournament.organizer?.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-tan text-ink shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  BTC Xác Thực
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-3xl font-black tracking-tight leading-tight text-white mb-2">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs sm:text-sm text-white">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{tournament.location} • {tournament.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
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
            <div className="bg-surface shadow-card rounded-2xl border border-ink p-1.5 flex gap-1  overflow-x-auto hide-scrollbar">
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
                      : 'text-muted hover:text-ink hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Box */}
            <div className="bg-surface shadow-card rounded-3xl border border-ink p-6 sm:p-8 ">

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Organizer Badge Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-ink">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={tournament.organizer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={tournament.organizer?.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Đơn vị tổ chức</div>
                        <div className="text-ink font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                          <span>{tournament.organizer?.name || 'Ban tổ chức CourtMate'}</span>
                          {tournament.organizer?.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/chat?userId=${tournament.organizer?.id}&userName=${encodeURIComponent(tournament.organizer?.name || 'Ban tổ chức')}&avatar=${encodeURIComponent(tournament.organizer?.avatar || '')}&role=ORGANIZER`)}
                      className="cm-button inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ink text-primary hover:bg-accent-baby text-xs sm:text-sm font-bold transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Nhắn tin ban tổ chức</span>
                    </button>
                  </div>

                  {/* Description Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-ink mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Giới thiệu
                    </h3>

                    <div className="text-muted text-sm sm:text-[15px] leading-relaxed space-y-3 whitespace-pre-line bg-white p-5 rounded-2xl border border-ink">
                      {tournament.description || 'Chưa có thông tin mô tả chi tiết từ ban tổ chức.'}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Time Card */}
                    <div className="p-5 rounded-2xl bg-surface shadow-card border border-ink  flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-accent-tan text-primary flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Thời gian thi đấu</div>
                        <div className="text-ink font-bold text-sm sm:text-base">
                          {startDateFormatted}
                        </div>
                        <div className="text-muted text-xs mt-0.5">
                          Đến hết ngày {endDateFormatted}
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="p-5 rounded-2xl bg-surface shadow-card border border-ink  flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-accent-tan text-primary flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Địa điểm sân đấu</div>
                        <div className="text-ink font-bold text-sm sm:text-base leading-snug">
                          {tournament.location}
                        </div>
                        <div className="text-muted text-xs mt-0.5">
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
                  <h3 className="text-base sm:text-lg font-black text-ink mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Hạng mục thi đấu
                  </h3>

                  <div className="space-y-3">
                    {tournament.categories && tournament.categories.length > 0 ? (
                      tournament.categories.map((cat, idx) => (
                        <div
                          key={cat.id || idx}
                          className="p-5 rounded-2xl border border-ink bg-surface shadow-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-accent-baby text-primary flex items-center justify-center shrink-0 font-black text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-extrabold text-ink text-base">{cat.name}</div>
                              <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                                <Users className="w-3.5 h-3.5 text-muted" />
                                <span>Giới hạn: {cat.maxParticipants || 32} cặp/VĐV</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            <span className="text-base sm:text-lg font-black text-primary">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cat.fee)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-accent-baby px-2 py-0.5 rounded-md mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Mở đăng ký
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-muted text-sm">
                        Chưa có danh mục cụ thể cho giải đấu này.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Rules */}
              {activeTab === 'rules' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-base sm:text-lg font-black text-ink mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Điều lệ thi đấu chính thức
                  </h3>

                  <div className="p-6 rounded-2xl bg-white border border-ink text-muted text-sm leading-relaxed whitespace-pre-line font-medium">
                    {tournament.rulesText || tournament.rules || 'Đang cập nhật điều lệ chính thức từ ban tổ chức...'}
                  </div>
                </div>
              )}

              {/* Tab 4: Participants */}
              {activeTab === 'participants' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Người đã đăng ký
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent-baby text-primary">
                      {confirmedParticipants.length} VĐV
                    </span>
                  </div>

                  {confirmedParticipants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {confirmedParticipants.map((reg, idx) => (
                        <div
                          key={reg.id || idx}
                          className="p-4 rounded-xl border border-ink bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-accent-baby text-primary font-bold text-xs flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-ink text-sm">{reg.playerName}</div>
                              {reg.partnerName && (
                                <div className="text-[11px] text-muted font-medium">
                                  Cùng: {reg.partnerName}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-baby text-primary border border-ink">
                            {reg.status === 'PAID' ? 'ĐÃ ĐÓNG PHÍ' : 'ĐÃ DUYỆT'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted text-sm bg-white rounded-2xl border border-dashed border-ink">
                      Chưa có vận động viên nào hoàn tất thủ tục đăng ký.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column (1/3): Sticky Registration Card */}
          <div className="lg:col-span-1">
            <div className="bg-surface shadow-card rounded-3xl border border-ink p-6 sm:p-7  sticky top-24 space-y-6">

              <div className="text-center pb-5 border-b border-ink">
                <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
                  Lệ phí thi đấu từ
                </span>
                <div className="text-3xl font-black text-primary tracking-tight">
                  {formattedFee}
                </div>

              </div>

              {/* Progress limit */}
              <div className="bg-white rounded-2xl p-4 border border-ink">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-ink mb-2.5">
                  <span>Đã đăng ký:</span>
                  <span className="text-primary font-bold">
                    {tournament.slotsLimit ? (
                      <>
                        {enrolledCount} / {tournament.slotsLimit} chỗ
                        <span className="text-xs text-muted font-normal ml-1.5">
                          (Còn {Math.max(0, tournament.slotsLimit - enrolledCount)})
                        </span>
                      </>
                    ) : (
                      'Không giới hạn'
                    )}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (enrolledCount / (tournament.slotsLimit || 50)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Primary CTA - Restricted for Admin and Organizer */}
              {user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.REGIONAL_ADMIN || user.role === UserRole.ORGANIZER) ? (
                <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-center space-y-2.5">
                  <span className="inline-block bg-slate-100 text-black border border-black text-xs font-black px-2.5 py-0.5 rounded-full">
                    {user.role === UserRole.ORGANIZER ? 'TÀI KHOẢN BAN TỔ CHỨC' : 'TÀI KHOẢN QUẢN TRỊ VIÊN'}
                  </span>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Tài khoản của bạn phục vụ công tác quản lý & giám sát giải đấu, không thể đăng ký thi đấu như vận động viên.
                  </p>
                  <Link href={user.role === UserRole.ORGANIZER ? '/organizer' : '/admin'} className="block">
                    <button className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-primary transition-all">
                      {user.role === UserRole.ORGANIZER ? 'Đến bảng điều khiển BTC' : 'Đến bảng điều khiển Admin'}
                    </button>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleRegisterClick}
                  disabled={!registrationOpen}
                  className="cm-button w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold text-base text-center flex items-center justify-center gap-2 shadow-lg shadow-black transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{registrationOpen ? 'Đăng ký tham gia ngay' : 'Đã đóng đăng ký'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Compact Badges */}


            </div>
          </div>

        </div>
      </div>

      <GuestActionModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} redirectUrl={`/tournaments/${tournamentId}/register`} />
    </div>
  );
}
