'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';
import { FavoriteButton } from '../shared/FavoriteButton';
import { useAuth } from '../../context/AuthContext';
import { getTournamentStatus } from '../../lib/tournament-status';

interface TournamentCardProps {
  tournament: Tournament;
  onBookmarkToggle?: (id: string) => void | Promise<unknown>;
  isBookmarked?: boolean;
  viewMode?: 'grid' | 'list';
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onBookmarkToggle,
  isBookmarked = false,
  viewMode = 'grid',
}) => {
  const { isAuthenticated } = useAuth();
  const favorite = isAuthenticated && isBookmarked;

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
      case 'CANCELLED' as TournamentStatus:
        return { label: 'Đã hủy', color: 'bg-slate-500 text-white' };
      default:
        return { label: 'Giải đấu', color: 'bg-slate-500 text-white' };
    }
  };

  const sportInfo = getSportBadge(tournament.sport);
  const statusInfo = getStatusBadge(getTournamentStatus(tournament));
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

  if (viewMode === 'list') {
    return (
      <Link
        href={`/tournaments/${tournament.id}`}
        className="group bg-surface shadow-card rounded-2xl border border-slate-200/80 overflow-hidden  hover:shadow-interactive hover:border-primary/40 transition-all duration-300 flex cursor-pointer"
      >
        {/* Horizontal Layout Cover Image */}
        <div className="relative w-48 sm:w-56 shrink-0 overflow-hidden bg-slate-900">
          <img
            src={
              tournament.coverImage ||
              (tournament.sport === SportType.PICKLEBALL
                ? '/tournaments/pickleball-1.jpg'
                : '/tournaments/badminton-1.jpg')
            }
            alt={tournament.title}
            className="w-full h-full object-cover group- transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
          <div className="absolute top-2.5 left-2.5">
            <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${statusInfo.color} shadow-md`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
             <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-950/85 text-white border border-white/20 backdrop-blur-md shadow-sm">
              {sportInfo.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-base leading-6 h-12 text-ink line-clamp-2 group-hover:text-primary transition">
              {tournament.title}
            </h3>
            {onBookmarkToggle && (
              <FavoriteButton appearance="icon" selected={favorite} name={tournament.title} onToggle={() => onBookmarkToggle(tournament.id)} />
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary"/> <span className="font-medium text-slate-700">{startDateFormatted}</span></div>
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500"/> <span className="truncate">{tournament.location}</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-500"/> <span>{tournament.slotsLimit || 32} VĐV</span></div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-black text-ink">{formattedFee}</span>
            <span className="text-primary text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid Mode (Compact, for 5 items per row)
  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group bg-surface shadow-card rounded-2xl border border-slate-200/90 overflow-hidden  hover:shadow-interactive hover:border-primary/50 transition-all duration-300 flex flex-col cursor-pointer h-full relative"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={
            tournament.coverImage ||
            (tournament.sport === SportType.PICKLEBALL
              ? '/tournaments/pickleball-1.jpg'
              : '/tournaments/badminton-1.jpg')
          }
          alt={tournament.title}
          className="w-full h-full object-cover group- transition-transform duration-500 opacity-90"
        />
        {/* Dark contrast gradient protection */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/40" />

        {/* Status Badge - Top Left with high contrast */}
        <div className="absolute top-2.5 left-2.5 right-16 z-10">
          <span className={`inline-flex max-w-full items-center px-2.5 py-1 text-xs font-black rounded-lg ${statusInfo.color} shadow-md tracking-tight`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Bookmark Action - Top Right */}
        {onBookmarkToggle && (
          <FavoriteButton selected={favorite} name={tournament.title} onToggle={() => onBookmarkToggle(tournament.id)} appearance="on-image" className="absolute top-2 right-2 z-10" />
        )}

        {/* Sport Type Badge + City - Bottom row */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-950/85 text-white border border-white/20 backdrop-blur-md shadow-sm shrink-0">
            {sportInfo.label}
          </span>
          <span className="text-xs text-white font-bold truncate max-w-[55%] text-right drop-shadow-sm">
            {tournament.city}
          </span>
        </div>
      </div>

      {/* Content - Compact for Grid */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2.5">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2 leading-6 h-12 group-hover:text-primary transition-colors" title={tournament.title}>
            {tournament.title}
          </h3>

          {/* Key Details using Icons with overflow safety */}
          <div className="space-y-1.5 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{startDateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate block flex-1" title={tournament.location}>
                {tournament.location}
              </span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{tournament.slotsLimit || 32} VĐV</span>
            </div>
          </div>
        </div>

        {/* Footer - Fixed price & expandable CTA on hover */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <span className="text-sm font-black text-slate-900 tracking-tight shrink-0 whitespace-nowrap">
            {formattedFee}
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-primary text-slate-700 group-hover:text-white transition-all duration-200 shrink-0">
            <span className="text-xs font-bold">
              Chi tiết
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  );
};
