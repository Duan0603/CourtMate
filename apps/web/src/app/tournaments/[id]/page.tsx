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
  ChevronRight
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Đang tải thông tin giải đấu...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-navy">Không tìm thấy giải đấu</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Giải đấu không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link href="/tournaments" className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm">
          Quay lại danh sách
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

  return (
    <div className="bg-slate-50 min-h-screen pb-24 selection:bg-primary/20">
      {/* Main Cover Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-72 sm:h-96 lg:h-[420px] w-full rounded-[2rem] overflow-hidden shadow-elevated group">
          <div className="absolute inset-0 bg-slate-200 animate-pulse" /> {/* Placeholder */}
          <img
            src={tournament.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80'}
            alt={tournament.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onLoad={(e) => (e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent" />

          {/* Banner Floating Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-white shadow-soft">
                {tournament.sport}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-soft">
                {tournament.status === TournamentStatus.OPEN ? 'Đang mở đăng ký' : 'Sắp diễn ra'}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md border border-white/20">
                {tournament.city}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4 text-shadow-sm">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-200 font-medium">
              <span className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-primary-light" />
                </div>
                {startDateFormatted} - {endDateFormatted}
              </span>
              <span className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                  <MapPin className="w-4 h-4 text-rose-400" />
                </div>
                {tournament.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Detail Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column (2/3): Tabs & Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tab Navigation */}
            <div className="bg-white/60 backdrop-blur-xl rounded-full border border-slate-200/60 p-1.5 flex gap-1 shadow-sm overflow-x-auto hide-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'categories', label: 'Hạng mục & Giải thưởng' },
                { id: 'rules', label: 'Điều lệ thi đấu' },
                { id: 'participants', label: `Vận động viên (${participants.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-1 text-center ${
                    activeTab === tab.id
                      ? 'bg-navy text-white shadow-md scale-100'
                      : 'text-slate-500 hover:text-navy hover:bg-slate-100/80 scale-95 hover:scale-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Sections Wrapper */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-10 shadow-soft">
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section>
                    <h3 className="text-xl font-extrabold text-navy mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Giới thiệu giải đấu
                    </h3>
                    <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line mb-8">
                      {tournament.description}
                    </p>

                    <div className="inline-flex items-center gap-4 p-2 pr-6 rounded-full bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all">
                      <img
                        src={tournament.organizer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={tournament.organizer?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Ban tổ chức</span>
                        <strong className="text-navy text-sm font-bold block">{tournament.organizer?.name || 'Ban tổ chức CourtMate'}</strong>
                      </div>
                    </div>
                  </section>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-8" />

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Card */}
                    <div className="relative overflow-hidden rounded-[24px] bg-white border border-slate-100 shadow-sm p-6 group hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Calendar className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thời gian thi đấu</h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                              <span className="text-navy font-bold text-base">{startDateFormatted}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                              <div className="w-0.5 h-4 bg-slate-200 ml-1 rounded-full" />
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                              <span className="text-navy font-bold text-base">{endDateFormatted}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="relative overflow-hidden rounded-[24px] bg-white border border-slate-100 shadow-sm p-6 group hover:shadow-md hover:border-rose-500/30 transition-all duration-300">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <MapPin className="w-7 h-7 text-rose-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Địa điểm tổ chức</h4>
                          <strong className="block text-navy font-bold text-lg leading-snug mb-1.5">
                            {tournament.location}
                          </strong>
                          <span className="text-slate-500 text-sm font-medium block">
                            {tournament.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Tab 2: Categories */}
              {activeTab === 'categories' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-extrabold text-navy flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Các nội dung thi đấu
                  </h3>
                  <div className="space-y-3">
                    {tournament.categories?.map((cat) => (
                      <div key={cat.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/30 hover:shadow-soft transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <strong className="text-base text-navy block font-bold mb-1">{cat.name}</strong>
                            <span className="text-sm text-slate-500 flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              Giới hạn: {cat.maxParticipants || 32} VĐV
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-primary block mb-1">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cat.fee)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Còn nhận đăng ký
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Rules */}
              {activeTab === 'rules' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-extrabold text-navy flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Điều lệ giải đấu chính thức
                  </h3>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-[15px] whitespace-pre-line leading-relaxed font-mono shadow-inner">
                    {tournament.rulesText || 'Đang cập nhật điều lệ chính thức từ ban tổ chức...'}
                  </div>
                </div>
              )}

              {/* Tab 4: Participants */}
              {activeTab === 'participants' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <h3 className="text-xl font-extrabold text-navy flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Danh sách Vận động viên chính thức
                    </h3>
                    <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold">
                      Đã ghi danh: {confirmedParticipants.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {confirmedParticipants.map((reg, idx) => (
                      <div key={reg.id || idx} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold text-sm flex items-center justify-center shadow-inner">
                            #{idx + 1}
                          </div>
                          <div>
                            <strong className="text-sm text-navy block font-bold">{reg.playerName}</strong>
                            {reg.partnerName && (
                              <span className="text-xs text-slate-500 font-medium mt-0.5 block">Cùng: {reg.partnerName}</span>
                            )}
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {reg.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'ĐÃ DUYỆT'}
                        </span>
                      </div>
                    ))}
                    {confirmedParticipants.length === 0 && (
                      <div className="col-span-full py-10 text-center text-slate-500 text-sm">
                        Chưa có vận động viên nào hoàn tất thủ tục đăng ký.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1/3): Sticky Registration Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] border border-slate-100/80 p-8 shadow-elevated sticky top-28 space-y-8 relative overflow-hidden">
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-emerald-400" />
              
              <div className="text-center">
                <span className="text-sm text-slate-400 font-medium block uppercase tracking-wider mb-2">Lệ phí tham gia từ</span>
                <div className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
                  {formattedFee}
                </div>
                <span className="text-xs text-slate-500 block mt-3 px-4 leading-relaxed">
                  Bao gồm chi phí sân bãi, nước uống, áo thi đấu & kỷ niệm chương
                </span>
              </div>

              {/* Progress limit */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between text-sm font-semibold text-navy mb-3">
                  <span>Số lượng còn lại:</span>
                  <span className="text-primary">
                    {tournament.slotsLimit ? `${participants.length} / ${tournament.slotsLimit} slots` : 'Không giới hạn'}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (participants.length / (tournament.slotsLimit || 50)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Primary CTA Button */}
              <Link
                href={`/tournaments/${tournament.id}/register`}
                className="group relative w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg text-center flex items-center justify-center gap-2 shadow-glow hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span>Đăng ký tham gia ngay</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Guarantee highlights */}
              <div className="space-y-3.5 pt-6 border-t border-slate-100 text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>Xác nhận vé điện tử QR tức thì</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>Hoàn tiền 100% nếu giải bị hủy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>Hỗ trợ kỹ thuật 24/7 từ CourtMate</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
