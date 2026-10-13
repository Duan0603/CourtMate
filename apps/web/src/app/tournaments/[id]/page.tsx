'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  CircleAlert
} from 'lucide-react';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';
import { tournamentsApi } from '../../../lib/tournaments.api';
import { registrationsApi } from '../../../lib/registrations.api';

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'rules' | 'participants'>('overview');
  const [participants, setParticipants] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const confirmedParticipants = participants.filter(
    (p) => p.status === 'PAID' || p.status === 'APPROVED'
  );

  useEffect(() => {
    async function loadData() {
      if (!tournamentId) return;
      setLoading(true);
      try {
        const data = await tournamentsApi.getTournamentDetails(tournamentId);
        setTournament(data);
        const regs = await registrationsApi.getRegistrationsByTournament(tournamentId);
        setParticipants(regs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tournamentId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareZalo = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`🏆 [CourtMate] Tham gia giải đấu: ${tournament?.title || ''}`);
    window.open(`https://zalo.me/share?url=${url}&text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1E5AA8] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Đang tải thông tin giải đấu...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Không tìm thấy giải đấu</h2>
        <p className="text-sm text-slate-500 mb-6">Giải đấu này không tồn tại hoặc đã bị ẩn khỏi hệ thống.</p>
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E5AA8] text-white font-semibold text-sm shadow hover:bg-[#154687] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

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
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      {/* ─── BREADCRUMB & BACK NAV ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1E5AA8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả giải đấu</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              title="Chia sẻ liên kết"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
            <button
              onClick={handleShareZalo}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0068FF] text-white text-xs font-bold hover:bg-[#0052cc] transition-colors shadow-sm"
            >
              Zalo
            </button>
          </div>
        </div>
      </div>

      {/* ─── HERO COVER BANNER (Premium Gradient Overlay) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-72 sm:h-96 lg:h-[440px] w-full rounded-3xl overflow-hidden shadow-xl group border border-slate-200/60 bg-slate-900">
          <img
            src={tournament.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80'}
            alt={tournament.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
          />
          {/* Subtle multi-layer gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent hidden sm:block" />

          {/* Floating Content on Hero */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#1E5AA8] text-white shadow-sm">
                🏸 {tournament.sport}
              </span>

              <span
                className={`px-3.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                  tournament.status === TournamentStatus.OPEN
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {tournament.status === TournamentStatus.OPEN ? 'Đang mở đăng ký' : 'Sắp diễn ra'}
              </span>

              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-slate-100">
                📍 {tournament.city}
              </span>

              {tournament.organizer?.isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  BTC Xác Thực
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-3">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-300">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2/3): Tabs & Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Navigation Pill Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex gap-1 shadow-sm overflow-x-auto hide-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'categories', label: 'Nội dung & Lệ phí' },
                { id: 'rules', label: 'Điều lệ thi đấu' },
                { id: 'participants', label: `Vận động viên (${confirmedParticipants.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex-1 text-center ${
                    activeTab === tab.id
                      ? 'bg-[#1E5AA8] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              
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
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đơn vị tổ chức</div>
                        <div className="text-slate-900 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                          <span>{tournament.organizer?.name || 'Ban tổ chức CourtMate'}</span>
                          {tournament.organizer?.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-[#1E5AA8]" />
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/chat?userId=${tournament.organizer?.id}&userName=${encodeURIComponent(tournament.organizer?.name || 'Ban tổ chức')}&avatar=${encodeURIComponent(tournament.organizer?.avatar || '')}`)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[#1E5AA8] hover:bg-sky-50 text-xs sm:text-sm font-bold transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Nhắn tin với BTC</span>
                    </button>
                  </div>

                  {/* Description Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#1E5AA8]" />
                      Thông tin giới thiệu giải
                    </h3>

                    <div className="text-slate-600 text-sm sm:text-[15px] leading-relaxed space-y-3 whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      {tournament.description || 'Chưa có thông tin mô tả chi tiết từ ban tổ chức.'}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Time Card */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Thời gian thi đấu</div>
                        <div className="text-slate-900 font-bold text-sm sm:text-base">
                          {startDateFormatted}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          Đến hết ngày {endDateFormatted}
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Địa điểm sân đấu</div>
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
                    <Trophy className="w-5 h-5 text-[#1E5AA8]" />
                    Nội dung & Hạng mục thi đấu
                  </h3>

                  <div className="space-y-3">
                    {tournament.categories && tournament.categories.length > 0 ? (
                      tournament.categories.map((cat, idx) => (
                        <div
                          key={cat.id || idx}
                          className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#1E5AA8]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#1E5AA8] flex items-center justify-center shrink-0 font-black text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-base">{cat.name}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>Giới hạn: {cat.maxParticipants || 32} cặp/VĐV</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            <span className="text-base sm:text-lg font-black text-[#1E5AA8]">
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
                    <FileText className="w-5 h-5 text-[#1E5AA8]" />
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
                      <Users className="w-5 h-5 text-[#1E5AA8]" />
                      Danh sách VĐV đã đăng ký
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8]">
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
                            <div className="w-9 h-9 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] font-bold text-xs flex items-center justify-center shrink-0">
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
                    <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Chưa có vận động viên nào hoàn tất thủ tục đăng ký.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column (1/3): Sticky Registration Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-lg sticky top-24 space-y-6">
              
              <div className="text-center pb-5 border-b border-slate-100">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Lệ phí thi đấu từ
                </span>
                <div className="text-3xl font-black text-[#1E5AA8] tracking-tight">
                  {formattedFee}
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Bao gồm phí sân bãi, nước uống, áo thi đấu & kỷ niệm chương của BTC
                </p>
              </div>

              {/* Progress limit */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 mb-2.5">
                  <span>Đã đăng ký:</span>
                  <span className="text-[#1E5AA8] font-bold">
                    {tournament.slotsLimit ? (
                      <>
                        {confirmedParticipants.length} / {tournament.slotsLimit} slots
                        <span className="text-xs text-slate-500 font-normal ml-1.5">
                          (Còn {Math.max(0, tournament.slotsLimit - confirmedParticipants.length)})
                        </span>
                      </>
                    ) : (
                      'Không giới hạn'
                    )}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#1E5AA8] to-sky-400 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (confirmedParticipants.length / (tournament.slotsLimit || 50)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Primary CTA */}
              <Link
                href={`/tournaments/${tournament.id}/register`}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#1E5AA8] to-[#123E75] hover:from-[#154687] hover:to-[#0A2540] text-white font-bold text-base text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Đăng ký tham gia ngay</span>
                <ChevronRight className="w-5 h-5" />
              </Link>

              {/* Guarantees list */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Nhận Vé điện tử QR check-in ngay sau khi duyệt</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hoàn tiền 100% nếu giải đấu bị hủy lịch</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hỗ trợ kỹ thuật 24/7 từ đội ngũ CourtMate</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
