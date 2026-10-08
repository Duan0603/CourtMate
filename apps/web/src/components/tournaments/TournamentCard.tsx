'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ChevronRight, Bookmark } from 'lucide-react';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';

interface TournamentCardProps {
  tournament: Tournament;
  onBookmarkToggle?: (id: string) => void;
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

  if (viewMode === 'list') {
    return (
      <Link 
        href={`/tournaments/${tournament.id}`}
        className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:border-[#1E5AA8]/40 transition-all duration-300 flex cursor-pointer"
      >
        {/* Horizontal Layout Cover Image */}
        <div className="relative w-48 sm:w-56 shrink-0 overflow-hidden bg-slate-100">
          <img
            src={tournament.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'}
            alt={tournament.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md shadow-sm ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
             <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${sportInfo.color} bg-white/95 backdrop-blur-sm shadow-xs`}>
              {sportInfo.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-base text-[#101828] line-clamp-2 group-hover:text-[#1E5AA8] transition">
              {tournament.title}
            </h3>
            {onBookmarkToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(tournament.id);
                }}
                className="p-1 shrink-0 text-slate-300 hover:text-yellow-400 transition"
              >
                <Bookmark 
                  fill={isBookmarked ? '#facc15' : 'transparent'} 
                  color={isBookmarked ? '#facc15' : 'currentColor'}
                  className="w-5 h-5" 
                />
              </button>
            )}
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#1E5AA8]"/> <span className="font-medium text-slate-700">{startDateFormatted}</span></div>
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500"/> <span className="truncate">{tournament.location}</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-500"/> <span>{tournament.slotsLimit || 32} VĐV</span></div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-black text-[#101828]">{formattedFee}</span>
            <span className="text-[#1E5AA8] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#1E5AA8]/40 transition-all duration-300 flex flex-col cursor-pointer h-full relative"
    >
        {/* Cover Image & Badges */}
        <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={
              tournament.coverImage ||
              'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
            }
            alt={tournament.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/80 via-transparent to-transparent opacity-75" />

          {/* Status Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md shadow-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Bookmark Action */}
          {onBookmarkToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmarkToggle(tournament.id);
              }}
              className={`absolute top-2.5 right-2.5 p-1.5 bg-black/30 backdrop-blur-md rounded-full transition-colors duration-200 hover:bg-black/50 hover:scale-110 active:scale-95`}
            >
              <Bookmark 
                color={isBookmarked ? '#facc15' : '#ffffff'}
                fill={isBookmarked ? '#facc15' : 'transparent'}
                className={`w-3.5 h-3.5 transition-all ${
                  isBookmarked 
                    ? 'opacity-100' 
                    : 'opacity-90 hover:opacity-100'
                }`} 
              />
            </button>
          )}

          {/* Sport Type Badge + City */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded border ${sportInfo.color} bg-white/95 backdrop-blur-sm shadow-2xs shrink-0`}
            >
              {sportInfo.label}
            </span>
            <span className="text-[11px] text-white/95 font-semibold truncate shadow-xs">
              {tournament.city}
            </span>
          </div>
        </div>

        {/* Content - Compact for Grid */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#101828] line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-[#1E5AA8] transition-colors">
              {tournament.title}
            </h3>

            {/* Key Details using Icons */}
            <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1E5AA8] shrink-0" />
                <span className="truncate">{startDateFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate" title={tournament.location}>{tournament.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{tournament.slotsLimit || 32} VĐV</span>
              </div>
            </div>
          </div>

          {/* Footer - Fixed price & expandable CTA on hover */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-sm font-black text-[#1E5AA8] tracking-tight shrink-0 whitespace-nowrap">
              {formattedFee}
            </span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 group-hover:bg-[#1E5AA8] text-slate-500 group-hover:text-white transition-all duration-300 shrink-0 shadow-2xs">
              <span className="text-[11px] font-bold hidden group-hover:inline-block animate-in fade-in slide-in-from-right-1 duration-200 whitespace-nowrap">
                Xem thêm
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </div>
        </div>
      </Link>
  );
};
