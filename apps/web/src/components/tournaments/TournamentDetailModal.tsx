'use client';

import React, { useEffect, useRef } from 'react';
import { Tournament } from '@courtmate/shared';
import { Calendar, MapPin, Users, X, Trophy, AlertCircle, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface TournamentDetailModalProps {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmarkToggle?: (id: string) => void;
  isBookmarked?: boolean;
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  isOpen,
  onClose,
  onBookmarkToggle,
  isBookmarked = false,
}) => {
  const { isAuthenticated } = useAuth();
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isOpen && backdropRef.current && modalRef.current) {
      const tl = gsap.timeline();
      
      // Set initial states
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { opacity: 0, y: 30, scale: 0.98 });
      
      // 0ms: background bắt đầu fade in
      tl.to(backdropRef.current, { opacity: 1, duration: 0.4 }, 0);
      
      // 100ms: container bắt đầu xuất hiện
      tl.to(modalRef.current, { opacity: 1, duration: 0.3 }, 0.1);
      
      // 200ms: container trượt lên nhẹ & scale về 1
      tl.to(modalRef.current, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }, 0.2);
    }
  }, [isOpen, tournament]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !tournament) return null;

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
    <>
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="fixed inset-0 bg-[#101828]/60 backdrop-blur-sm z-[110]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div 
          ref={modalRef}
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl pointer-events-auto border border-slate-200/60"
        >
          {/* Header Image */}
          <div className="relative h-48 sm:h-64 w-full shrink-0">
            <img 
              src={tournament.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80'} 
              alt={tournament.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 uppercase tracking-wider mb-3 inline-block">
                {tournament.sport === 'BADMINTON' ? 'Cầu lông' : tournament.sport}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                {tournament.title}
              </h2>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Col - Details */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <Calendar className="w-5 h-5 text-[#1E5AA8]" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Khởi tranh</div>
                      <div className="text-sm font-bold text-navy">{startDateFormatted}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Địa điểm</div>
                      <div className="text-sm font-bold text-navy max-w-[120px] truncate">{tournament.city}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <Users className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Quy mô</div>
                      <div className="text-sm font-bold text-navy">{tournament.slotsLimit || 32} VĐV</div>
                    </div>
                  </div>
                </div>

                {/* About section */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base font-bold text-navy mb-3">
                    <Info className="w-4 h-4 text-[#1E5AA8]" /> Thông tin giải đấu
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {tournament.description || 'Chưa có thông tin chi tiết.'}
                  </p>
                </div>

                {/* Specific Location */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base font-bold text-navy mb-3">
                    <MapPin className="w-4 h-4 text-rose-500" /> Địa chỉ thi đấu
                  </h3>
                  <p className="text-sm text-slate-700 font-medium">{tournament.location}</p>
                </div>

              </div>

              {/* Right Col - Organizer & Actions */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium mb-1">Đơn vị tổ chức</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-200">
                      <Trophy className="w-5 h-5 text-[#1E5AA8]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy">{tournament.organizer.name}</div>
                      {tournament.organizer.isVerified && (
                         <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                           ✓ Đã xác thực
                         </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">Lệ phí đăng ký</div>
                    <div className="text-2xl font-black text-[#101828]">{formattedFee}</div>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2">
                    {isAuthenticated ? (
                      <button className="w-full py-3 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#154687] text-white text-sm font-bold shadow-md shadow-[#1E5AA8]/20 transition-all text-center">
                        Đăng ký ngay
                      </button>
                    ) : (
                      <button className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold shadow-md transition-all text-center">
                        Đăng nhập để đăng ký
                      </button>
                    )}
                    
                    {/* For SEO / direct link routing fallback */}
                    <Link 
                      href={`/tournaments/${tournament.id}`}
                      className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all text-center"
                    >
                      Mở trang chi tiết
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};
