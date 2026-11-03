'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  User,
  Printer,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Trophy,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';
import { tournamentsApi } from '../../../lib/tournaments.api';
import { registrationsApi } from '../../../lib/registrations.api';
import { useAuth } from '../../../context/AuthContext';
import { PageContainer } from '../../../components/layout/PageContainer';
import { message } from 'antd';

export default function TicketPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registration, setRegistration] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resolvedUserId = user?.id || (user as any)?._id;
        let [tourData, myRegs] = await Promise.all([
          tournamentId && tournamentId !== 'tour-1'
            ? tournamentsApi.getTournamentDetails(tournamentId).catch(() => null)
            : Promise.resolve(null),
          resolvedUserId
            ? registrationsApi.getMyRegistrations(resolvedUserId).catch(() => [])
            : Promise.resolve([]),
        ]);

        let matchedReg = null;

        if (Array.isArray(myRegs) && myRegs.length > 0) {
          // 1. Try to find registration by tournamentId or registrationId
          matchedReg = myRegs.find(
            (r: any) =>
              r.tournamentId === tournamentId ||
              r.tournamentId === tourData?.id ||
              r.id === tournamentId ||
              r._id === tournamentId
          );

          // 2. If no direct tournament found (e.g. from /ticket/tour-1 fallback), use user's first registered tournament
          if (!tourData) {
            matchedReg = matchedReg || myRegs[0];
            const targetTourId =
              (matchedReg as any).tournamentId ||
              (matchedReg as any).tournament?._id ||
              (matchedReg as any).tournament?.id;
            if (targetTourId) {
              tourData = await tournamentsApi.getTournamentDetails(targetTourId).catch(() => null);
            }
          }
        }

        // 3. If still no tournament data found, fallback to the FPTU Winter Championship
        if (!tourData) {
          try {
            tourData = await tournamentsApi.getTournamentDetails('6ae9c7e7b81a8733ded73090');
          } catch {
            const listRes = await tournamentsApi.getTournaments({ city: 'Đà Nẵng' });
            const list = Array.isArray(listRes?.data) ? listRes.data : [];
            if (list.length > 0) {
              tourData = list[0];
            }
          }
        }

        setTournament(tourData);
        setRegistration(matchedReg);
      } catch (e) {
        console.error('Error fetching ticket tournament:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tournamentId, user?.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết vé vào bộ nhớ tạm!');
    }
  };

  const resolvedTourId = tournament?.id || tournamentId;
  const qrPayload = `COURTMATE_TICKET:${resolvedTourId}:${user?.id || 'ATHLETE'}:${registration?.id || 'CONFIRMED'}`;
  const qrUrl = resolvedTourId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrPayload)}`
    : '';

  const ticketCode = `CM-TKT-${resolvedTourId?.slice(-6).toUpperCase()}-${(user?.id || '9842').slice(-4).toUpperCase()}`;

  const startDateFormatted = tournament?.startDate
    ? new Date(tournament.startDate).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chủ Nhật, 29/11/2026';

  const athleteName = registration?.playerName || user?.name || 'Nghiêm Hoàng Phúc';
  const athletePhone = registration?.contactPhone || (user as any)?.phone || '0905 123 456';
  const partnerName = registration?.partnerName || null;
  const categoryName =
    registration?.categoryName ||
    tournament?.categories?.[0]?.name ||
    'Nhóm A: Đơn nam (Nội dung chính thức)';

  return (
    <div className="bg-canvas min-h-screen page-section">
      <PageContainer className="relative z-10 w-full">

        {/* ─── BREADCRUMBS & TOP ACTIONS (FULL WIDTH MATCHING CONTAINER) ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 w-full">
          <div className="flex items-center gap-2.5">
            <Link
              href="/profile?tab=my-tournaments"
              className="cm-button inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-ink text-xs font-bold text-ink hover:bg-slate-50 transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              <span>Vé & Giải đấu của tôi</span>
            </Link>
          </div>

          {/* PRINT BUTTON: ONLY RENDERED WHEN TOURNAMENT TICKET ACTUALLY EXISTS */}
          {tournament && !loading && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleShare}
                className="cm-button inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-ink text-xs font-bold text-ink hover:bg-slate-50 transition shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 text-muted" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
              <button
                onClick={handlePrint}
                className="cm-button inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>In / Lưu PDF vé</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── STATE 1: LOADING ─── */}
        {loading && (
          <div className="w-full bg-surface shadow-card rounded-3xl border border-ink p-16 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-ink">Đang tải thông tin vé điện tử...</h3>
            <p className="text-muted text-xs mt-1">Hệ thống đang đồng bộ mã QR và hồ sơ vận động viên.</p>
          </div>
        )}

        {/* ─── STATE 2: NO TICKET FOUND (FULL WIDTH W-FULL MATCHING CONTAINER, NO PRINT BUTTON) ─── */}
        {!loading && !tournament && (
          <div className="w-full bg-surface shadow-card rounded-3xl border border-ink p-12 sm:p-16 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ink">Không tìm thấy thông tin vé</h2>
            <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
              Mã vé hoặc giải đấu này không tồn tại trong hệ thống, hoặc bạn chưa đăng ký tham gia giải đấu này.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tournaments"
                className="cm-action px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Xem danh sách giải đấu</span>
              </Link>
              <Link
                href="/profile?tab=my-tournaments"
                className="cm-button px-5 py-2.5 rounded-xl bg-white border border-ink text-ink text-xs font-bold hover:bg-slate-50 transition shadow-xs inline-flex items-center gap-2"
              >
                <span>Về hồ sơ cá nhân</span>
              </Link>
            </div>
          </div>
        )}

        {/* ─── STATE 3: VALID TICKET DISPLAY (FULL WIDTH 2-COLUMN GRID MATCHING PROFILE LAYOUT) ─── */}
        {!loading && tournament && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

            {/* LEFT COLUMN (7 COLS): TOURNAMENT & ATHLETE PASS DETAILS */}
            <div className="lg:col-span-7 space-y-6 w-full">

              {/* Tournament Summary Card */}
              <div className="bg-surface shadow-card rounded-3xl border border-ink overflow-hidden p-6 sm:p-8 space-y-6 w-full">

                {/* Cover Banner */}
                <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-ink/40 shadow-sm bg-primary">
                  <img
                    src={
                      tournament.coverImage ||
                      (tournament.sport === SportType.PICKLEBALL
                        ? '/tournaments/pickleball-1.jpg'
                        : '/tournaments/badminton-1.jpg')
                    }
                    alt={tournament.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-primary text-white shadow-md">
                      {tournament.sport === SportType.PICKLEBALL ? 'Pickleball' : 'Cầu lông'}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/90 text-ink shadow-md">
                      {tournament.city}
                    </span>
                  </div>
                </div>

                {/* Tournament Title & Organizer */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
                    <Trophy className="w-4 h-4" />
                    <span>GIẢI ĐẤU CHÍNH THỨC</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-ink leading-snug">
                    {tournament.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-1.5 flex items-center gap-1.5">
                    <span>Đơn vị tổ chức:</span>
                    <strong className="text-ink font-bold">{tournament.organizer?.name || 'Ban tổ chức CourtMate'}</strong>
                    {tournament.organizer?.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    )}
                  </p>
                </div>

                {/* Match Schedule & Venue Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 w-full">
                  <div className="p-4 rounded-2xl bg-white border border-ink flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-baby text-primary flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Thời gian thi đấu</span>
                      <strong className="text-ink text-xs sm:text-sm font-extrabold block mt-0.5">
                        {startDateFormatted}
                      </strong>
                      <span className="text-muted text-[11px] block mt-0.5">
                        {(tournament as any).time || '07:00 - 17:00'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-ink flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-tan text-primary flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Địa điểm sân đấu</span>
                      <strong className="text-ink text-xs sm:text-sm font-extrabold block mt-0.5">
                        {tournament.location}
                      </strong>
                      <span className="text-muted text-[11px] block mt-0.5">
                        {tournament.district ? `${tournament.district}, ` : ''}{tournament.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Athlete Roster Pass */}
                <div className="p-5 rounded-2xl bg-white border border-ink space-y-3.5 w-full">
                  <div className="flex items-center justify-between border-b border-ink/15 pb-2.5">
                    <span className="text-xs font-black text-ink flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Thông tin vận động viên
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                      VĐV CHÍNH THỨC
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <span className="text-muted block text-[11px]">Họ và tên VĐV:</span>
                      <strong className="text-ink font-black text-sm">{athleteName}</strong>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Số điện thoại:</span>
                      <strong className="text-ink font-bold">{athletePhone}</strong>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Hạng mục / Bảng đấu:</span>
                      <strong className="text-primary font-bold">{categoryName}</strong>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Người đánh cặp (Partner):</span>
                      <strong className="text-ink font-bold">{partnerName || 'Nội dung đơn'}</strong>
                    </div>
                  </div>
                </div>

                {/* Important Check-in Instructions */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5 leading-relaxed w-full">
                  <div className="font-black flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Lưu ý quan trọng khi vào sân thi đấu:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-amber-900">
                    <li>Vui lòng có mặt tại bàn trọng tài trước giờ thi đấu ít nhất 15–30 phút.</li>
                    <li>Xuất trình mã QR trên vé điện tử này hoặc bản in PDF để ban tổ chức quét điểm danh và phát số đeo lưng.</li>
                    <li>Mang theo thẻ sinh viên hoặc CCCD để đối chiếu khi có yêu cầu kiểm tra đối tượng.</li>
                  </ul>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN (5 COLS): OFFICIAL BOARDING PASS WITH QR CODE */}
            <div className="lg:col-span-5 space-y-6 w-full">

              {/* Neubrutalist Boarding Ticket Card */}
              <div className="bg-surface shadow-[6px_6px_0px_0px_#000] rounded-3xl border-2 border-black overflow-hidden relative w-full">

                {/* Header Ticket Band */}
                <div className="p-6 text-center bg-blue-600 text-white border-b-2 border-black space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white text-blue-700 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>VÉ HỢP LỆ • ĐÃ XÁC NHẬN</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white line-clamp-1">
                    COURTMATE E-PASS
                  </h3>
                  <p className="text-[11px] font-mono tracking-wider text-blue-100">
                    MÃ VÉ: <span className="font-black text-white">{ticketCode}</span>
                  </p>
                </div>

                {/* Ticket Cutout Notches */}
                <div className="relative flex items-center justify-between px-2 py-1 bg-white">
                  <div className="w-6 h-6 rounded-full bg-canvas -ml-5 border-2 border-black" />
                  <div className="w-full border-t-2 border-dashed border-black/40" />
                  <div className="w-6 h-6 rounded-full bg-canvas -mr-5 border-2 border-black" />
                </div>

                {/* QR Code Section */}
                <div className="p-6 text-center bg-white space-y-4">
                  <div className="p-4 rounded-2xl border-2 border-dashed border-black inline-block bg-slate-50 shadow-inner">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt="Mã QR Check-in"
                        className="w-52 h-52 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center text-muted text-xs">
                        Đang tạo mã QR...
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-black text-ink block">
                      MÃ QR CHECK-IN ĐIỂM DANH
                    </span>
                    <p className="text-[11px] text-muted max-w-xs mx-auto leading-tight">
                      Đưa mã QR này cho ban tổ chức tại bàn check-in để nhận vị trí sân và lượt đấu.
                    </p>
                  </div>

                  {/* Ticket Key Data Table */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-ink/20 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted">VĐV thi đấu:</span>
                      <strong className="text-ink font-black">{athleteName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Trạng thái vé:</span>
                      <span className="font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-md text-[10px]">
                        SẴN SÀNG THI ĐẤU
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Hạng mục:</span>
                      <strong className="text-ink font-bold truncate max-w-[170px]">{categoryName}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      onClick={handlePrint}
                      className="cm-button w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>In / Lưu PDF vé</span>
                    </button>

                    <Link
                      href={`/tournaments/${resolvedTourId}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-ink font-bold text-xs flex items-center justify-center gap-1.5 transition border border-ink"
                    >
                      <span>Xem chi tiết giải đấu</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted" />
                    </Link>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </PageContainer>
    </div>
  );
}
