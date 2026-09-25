'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ChevronRight, Bookmark } from 'lucide-react';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { LoginPromptModal } from '../auth/LoginPromptModal';

interface TournamentCardProps {
  tournament: Tournament;
  onBookmarkToggle?: (id: string) => void;
  isBookmarked?: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onBookmarkToggle,
  isBookmarked = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const getSportBadge = (sport: SportType) => {
    switch (sport) {
      case SportType.BADMINTON:
        return { label: 'Cầu lông', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case SportType.PICKLEBALL:
        return { label: 'Pickleball', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case SportType.TENNIS:
        return { label: 'Quần vợt', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case SportType.FOOTBALL:
        return { label: 'Bóng đá', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: 'Thể thao', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getStatusBadge = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.OPEN:
        return { label: 'Đang mở đăng ký', color: 'bg-emerald-500 text-white' };
      case TournamentStatus.UPCOMING:
        return { label: 'Sắp diễn ra', color: 'bg-blue-500 text-white' };
      case TournamentStatus.FULL:
        return { label: 'Đã đủ số lượng', color: 'bg-rose-500 text-white' };
      case TournamentStatus.IN_PROGRESS:
        return { label: 'Đang thi đấu', color: 'bg-amber-500 text-white' };
      case TournamentStatus.COMPLETED:
        return { label: 'Đã kết thúc', color: 'bg-slate-500 text-white' };
      default:
        return { label: 'Giải đấu', color: 'bg-slate-500 text-white' };
    }
  };

  const sportInfo = getSportBadge(tournament.sport);
  const statusInfo = getStatusBadge(tournament.status);
  const formattedFee = tournament.registrationFee
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        tournament.registrationFee
      )
    : 'Miễn phí';

  const startDateFormatted = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Đang cập nhật';

  // Guard: if Guest clicks detail link → show LoginPromptModal instead
  const handleDetailClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  return (
    <>
      {/* Login Prompt Modal for Guests */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Đăng nhập để xem chi tiết"
        description={`Bạn cần đăng nhập để xem chi tiết giải đấu "${tournament.title}" và đăng ký tham gia.`}
      />

      <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#1E5AA8]/40 transition-all duration-300 flex flex-col justify-between">
        {/* Cover Image & Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={
              tournament.coverImage ||
              'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
            }
            alt={tournament.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/80 via-transparent to-transparent opacity-80" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Bookmark Action */}
          {onBookmarkToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!isAuthenticated) {
                  setShowLoginPrompt(true);
                  return;
                }
                onBookmarkToggle(tournament.id);
                if (!isBookmarked) {
                  // Dispatch local notification event to Bell
                  const notificationEvent = new CustomEvent('local-notification:new', {
                    detail: {
                      id: `local_noti_${Date.now()}`,
                      type: 'system',
                      title: 'Lưu giải đấu thành công',
                      body: `Bạn đã thêm giải đấu "${tournament.title}" vào danh sách yêu thích.`,
                      link: `/tournaments/${tournament.id}`,
                      createdAt: new Date().toISOString(),
                    }
                  });
                  window.dispatchEvent(notificationEvent);
                }
              }}
              className={`absolute top-3 right-3 p-1.5 transition-colors duration-200 drop-shadow-md hover:scale-110 active:scale-95`}
            >
              <Bookmark 
                color={isBookmarked ? '#facc15' : '#ffffff'}
                fill={isBookmarked ? '#facc15' : 'transparent'}
                className={`w-6 h-6 transition-all ${
                  isBookmarked 
                    ? 'opacity-100' 
                    : 'opacity-80 hover:opacity-100'
                }`} 
              />
            </button>
          )}

          {/* Sport Type Badge + City */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${sportInfo.color} bg-white/95 backdrop-blur-sm shadow-xs`}
            >
              {sportInfo.label}
            </span>
            <span className="text-xs text-white/90 font-medium">{tournament.city}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Title — clicking triggers guard */}
            <a
              href={`/tournaments/${tournament.id}`}
              onClick={handleDetailClick}
              className="cursor-pointer"
            >
              <h3 className="font-bold text-lg text-[#101828] line-clamp-2 hover:text-[#1E5AA8] transition group-hover:text-[#1E5AA8]">
                {tournament.title}
              </h3>
            </a>

            <p className="text-xs text-[#475467] mt-1.5 line-clamp-2 leading-relaxed">
              {tournament.description}
            </p>

            {/* Key Details */}
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#1E5AA8] shrink-0" />
                <span>
                  Khởi tranh:{' '}
                  <strong className="text-[#101828]">{startDateFormatted}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{tournament.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Quy mô: <strong>{tournament.slotsLimit || 32}</strong> VĐV / Cặp đấu
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Actions */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Lệ phí tham gia</span>
              <span className="text-base font-black text-[#101828]">{formattedFee}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/tournaments/${tournament.id}`}
                onClick={handleDetailClick}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#1E5AA8]/10 hover:bg-[#1E5AA8] hover:text-white text-[#1E5AA8] text-xs font-bold transition-all"
              >
                <span>Chi tiết</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
