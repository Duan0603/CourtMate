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
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả giải đấu</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Đã sao chép liên kết giải đấu!')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-navy transition"
              title="Chia sẻ"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert('Đã lưu giải đấu vào danh sách quan tâm')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-rose-500 transition"
              title="Lưu giải đấu"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Cover Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-3xl overflow-hidden shadow-md">
          <img
            src={tournament.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80'}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/50 to-transparent" />

          {/* Banner Floating Content */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">
                {tournament.sport}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                {tournament.status === TournamentStatus.OPEN ? 'Đang mở đăng ký' : 'Sắp diễn ra'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                {tournament.city}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {tournament.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-light" />
                {startDateFormatted} - {endDateFormatted}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                {tournament.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Detail Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3): Tabs & Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 shadow-xs overflow-x-auto">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'categories', label: 'Hạng mục & Giải thưởng' },
                { id: 'rules', label: 'Điều lệ thi đấu' },
                { id: 'participants', label: `Vận động viên (${participants.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition flex-1 text-center ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-lg font-bold text-navy mb-3">Giới thiệu giải đấu</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {tournament.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-navy mb-4">Thông tin địa điểm & Thời gian</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-navy font-semibold">Thời gian thi đấu</strong>
                        <span className="text-slate-500 text-xs mt-1 block">
                          Từ {startDateFormatted} đến {endDateFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-navy font-semibold">Địa điểm tổ chức</strong>
                        <span className="text-slate-500 text-xs mt-1 block">
                          {tournament.location}, {tournament.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-navy mb-3">Ban tổ chức</h3>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <img
                      src={tournament.organizer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                      alt={tournament.organizer?.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-navy text-sm">{tournament.organizer?.name || 'Ban tổ chức CourtMate'}</strong>
                        <ShieldCheck className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Ban tổ chức đã được xác minh chính chủ</p>
                    </div>
                    <Link
                      href="/chat"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-navy hover:text-primary transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Nhắn tin</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Categories */}
            {activeTab === 'categories' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-lg font-bold text-navy mb-4">Các nội dung thi đấu</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {tournament.categories?.map((cat) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div>
                        <strong className="text-sm text-navy block font-semibold">{cat.name}</strong>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          Giới hạn: {cat.maxParticipants || 32} VĐV / Đội
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-navy block">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cat.fee)}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold">Còn nhận đăng ký</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Rules */}
            {activeTab === 'rules' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-lg font-bold text-navy mb-3">Điều lệ giải đấu chính thức</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm whitespace-pre-line leading-relaxed font-mono">
                  {tournament.rulesText || 'Đang cập nhật điều lệ chính thức từ ban tổ chức...'}
                </div>
              </div>
            )}

            {/* Tab 4: Participants */}
            {activeTab === 'participants' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-navy">Danh sách Vận động viên đã đăng ký</h3>
                  <span className="text-xs text-slate-500">Đã đăng ký: <strong>{participants.length}</strong></span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {participants.map((reg, idx) => (
                    <div key={reg.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div>
                          <strong className="text-sm text-navy block font-semibold">{reg.playerName}</strong>
                          {reg.partnerName && (
                            <span className="text-xs text-slate-500">Đứng cùng: {reg.partnerName}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {reg.status || 'PAID'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (1/3): Sticky Registration Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
              
              <div>
                <span className="text-xs text-slate-400 font-medium block">Lệ phí tham gia từ</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
                  {formattedFee}
                </div>
                <span className="text-xs text-slate-500 block mt-1">
                  Bao gồm chi phí sân bãi, nước uống, áo thi đấu & kỷ niệm chương
                </span>
              </div>

              {/* Progress limit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Số lượng còn lại:</span>
                  <span className="font-bold text-navy">
                    {tournament.slotsLimit ? `${participants.length} / ${tournament.slotsLimit} slots` : 'Mở không giới hạn'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (participants.length / (tournament.slotsLimit || 50)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Primary CTA Button */}
              <Link
                href={`/tournaments/${tournament.id}/register`}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-primary/20 transition transform hover:scale-[1.01]"
              >
                <span>Đăng ký tham gia ngay</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              {/* Guarantee highlights */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Xác nhận vé điện tử QR tức thì</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hoàn tiền 100% nếu giải bị hủy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
