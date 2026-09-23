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
  AlertCircle
} from 'lucide-react';
import { Tournament } from '@courtmate/shared';
import { tournamentsApi } from '../../../lib/tournaments.api';
import { useAuth } from '../../../context/AuthContext';

export default function TicketPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!tournamentId) {
        setLoading(false);
        return;
      }
      try {
        const data = await tournamentsApi.getTournamentDetails(tournamentId);
        setTournament(data);
      } catch (e) {
        console.error('Error fetching ticket tournament:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tournamentId]);

  const handlePrint = () => {
    window.print();
  };

  const qrUrl = tournamentId 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CM-${encodeURIComponent(tournamentId)}-${encodeURIComponent(user?.id || 'TICKET')}`
    : '';

  return (
    <div className="bg-[#F1F5F9] min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-navy transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang giải đấu</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In / Lưu PDF</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs">Đang khởi tạo vé điện tử QR...</p>
          </div>
        ) : !tournament ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-200">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-navy">Không tìm thấy thông tin vé</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">Mã vé hoặc giải đấu không tồn tại trong hệ thống.</p>
            <Link
              href="/tournaments"
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
            >
              Xem danh sách giải đấu
            </Link>
          </div>
        ) : (
          /* E-Ticket Card with Cutout Dividers */
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
            
            {/* Top Ticket Header */}
            <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-xs">
                <TicketIcon className="w-8 h-8" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ĐÃ XÁC NHẬN CHECK-IN
              </span>

              <h1 className="text-xl font-extrabold text-navy leading-snug">
                {tournament.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Mã vé: <span className="font-mono font-bold text-navy">CM-{tournament.id.slice(-6).toUpperCase()}-{(user?.id || '9842').slice(-4).toUpperCase()}</span>
              </p>

              {/* Dynamic QR Code Container */}
              <div className="mt-6 p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 inline-block shadow-xs">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Check-in QR Code"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                    Mã QR không khả dụng
                  </div>
                )}
                <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                  Đưa mã này cho BTC tại bàn lễ tân khi điểm danh
                </span>
              </div>
            </div>

            {/* Ticket Perforated Divider */}
            <div className="relative flex items-center justify-between px-4 py-1">
              <div className="w-6 h-6 rounded-full bg-[#F1F5F9] -ml-7 border-r border-slate-200/80" />
              <div className="w-full border-t-2 border-dashed border-slate-200" />
              <div className="w-6 h-6 rounded-full bg-[#F1F5F9] -mr-7 border-l border-slate-200/80" />
            </div>

            {/* Bottom Details Section */}
            <div className="p-8 space-y-4 text-xs text-slate-600 bg-white">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Thời gian thi đấu</span>
                  <strong className="text-navy text-sm font-semibold">
                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'} - 08:00 AM
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Địa điểm thi đấu</span>
                  <strong className="text-navy text-sm font-semibold">
                    {tournament.location}, {tournament.city}
                  </strong>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Vận động viên</span>
                  <strong className="text-navy text-sm font-semibold">
                    {user?.name || 'Vận động viên thi đấu'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Hạng mục</span>
                  <strong className="text-navy text-sm font-semibold">
                    {tournament.categories?.[0]?.name || 'Nội dung tiêu chuẩn'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Ticket Footer Assurance */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Xác thực điện tử bảo mật bởi hệ thống CourtMate</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
