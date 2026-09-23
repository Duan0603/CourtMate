import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, CheckCircle2, ChevronRight, Bookmark } from 'lucide-react';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';

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
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tournament.registrationFee)
    : 'Miễn phí';

  const startDateFormatted = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Đang cập nhật';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
      {/* Cover Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={tournament.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'}
          alt={tournament.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-80" />

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
              onBookmarkToggle(tournament.id);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition ${
              isBookmarked
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 text-navy hover:bg-white hover:text-rose-500'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        )}

        {/* Sport Type Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${sportInfo.color} bg-white/95 backdrop-blur-sm shadow-xs`}>
            {sportInfo.label}
          </span>
          <span className="text-xs text-white/90 font-medium">
            {tournament.city}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/tournaments/${tournament.id}`}>
            <h3 className="font-bold text-lg text-navy line-clamp-2 hover:text-primary transition group-hover:text-primary">
              {tournament.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {tournament.description}
          </p>

          {/* Key Details Grid */}
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Khởi tranh: <strong className="text-navy">{startDateFormatted}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{tournament.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Quy mô: <strong>{tournament.slotsLimit || 32}</strong> VĐV / Cặp đấu</span>
            </div>
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Lệ phí tham gia</span>
            <span className="text-base font-bold text-navy">{formattedFee}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/tournaments/${tournament.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-navy text-xs font-semibold transition"
            >
              <span>Chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
