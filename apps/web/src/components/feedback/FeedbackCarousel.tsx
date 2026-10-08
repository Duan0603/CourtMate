'use client';

import React, { useEffect, useState } from 'react';
import { Star, MessageSquarePlus, Sparkles, Trophy, Flame } from 'lucide-react';
import { PlatformFeedback } from '@courtmate/shared';
import { FeedbackCard } from './FeedbackCard';
import { FeedbackModal } from './FeedbackModal';
import { feedbacksApi, FeedbackStats } from '../../lib/feedbacks.api';
import { getFallbackFeedbacks } from '../../lib/mock-feedbacks';

export function FeedbackCarousel() {
  const [feedbacks, setFeedbacks] = useState<PlatformFeedback[]>(() =>
    getFallbackFeedbacks().slice(0, 100)
  );
  const [stats, setStats] = useState<FeedbackStats>({
    total: 100,
    averageRating: 5.0,
    fiveStarPercent: 100,
    recommendRate: 99,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);

  // Fetch from backend API on mount
  useEffect(() => {
    let isMounted = true;
    feedbacksApi.getLatestFeedbacks(100).then((res) => {
      if (isMounted && res.feedbacks && res.feedbacks.length > 0) {
        setFeedbacks(res.feedbacks);
        if (res.stats) setStats(res.stats);
      }
    });

    // Listen for real-time feedback submissions
    const handleNewFeedback = (event: Event) => {
      const customEvent = event as CustomEvent<PlatformFeedback>;
      if (customEvent.detail) {
        setFeedbacks((prev) => [customEvent.detail, ...prev].slice(0, 100));
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));
      }
    };

    window.addEventListener('courtmate:feedback-added', handleNewFeedback);
    return () => {
      isMounted = false;
      window.removeEventListener('courtmate:feedback-added', handleNewFeedback);
    };
  }, []);

  // Split feedbacks into 2 balanced rows of 50 items each for the dual-track infinite marquee
  const row1 = feedbacks.slice(0, Math.ceil(feedbacks.length / 2));
  const row2 = feedbacks.slice(Math.ceil(feedbacks.length / 2));

  // Duplicate items in each row for smooth seamless infinite looping
  const infiniteRow1 = [...row1, ...row1];
  const infiniteRow2 = [...row2, ...row2];

  return (
    <section id="feedback-section" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-[#FFFBF7] via-white to-[#FFFBF7]">
      {/* ─── STYLES FOR MARQUEE ANIMATION & HOVER SLOWDOWN ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        /* Normal marquee glide speed - Adjusted to be much gentler and slower */
        .marquee-track-left {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: scrollLeft 160s linear infinite;
          will-change: transform;
        }

        .marquee-track-right {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: scrollRight 170s linear infinite;
          will-change: transform;
        }

        /* "hover thì slow" - Smoothly slows down when user hovers over carousel */
        .marquee-container:hover .marquee-track-left,
        .marquee-container:hover .marquee-track-right {
          animation-duration: 420s !important;
        }

        /* Specific card hover highlights and lifts up */
        .feedback-card:hover {
          transform: translateY(-6px) scale(1.02);
          z-index: 30;
        }

        @media (max-width: 768px) {
          .marquee-track-left { animation-duration: 130s; }
          .marquee-track-right { animation-duration: 140s; }
          .marquee-container:hover .marquee-track-left,
          .marquee-container:hover .marquee-track-right {
            animation-duration: 350s !important;
          }
        }
      `}} />

      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#1E5AA8]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center mb-12 md:mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F1FA] text-[#1E5AA8] text-xs font-bold uppercase tracking-widest mb-4 border border-[#1E5AA8]/15">
          <Sparkles size={14} className="text-[#1E5AA8]" />
          100 Đánh Giá Mới Nhất Từ Hệ Thống
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101828] tracking-tight leading-[1.15] mb-5">
          Cộng Đồng Người Chơi Nói Gì Về <span className="text-[#1E5AA8]">CourtMate</span>?
        </h2>

        <p className="text-[#475467] text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-8">
          Tổng hợp 100 trải nghiệm thực tế từ các vận động viên, người chơi phong trào và ban tổ chức giải đấu trên khắp Đà Nẵng.
        </p>

        {/* Stats Pill Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm text-sm">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-[#101828]">{stats.averageRating.toFixed(1)}/5.0</span>
            <span className="text-[#667085] text-xs">Đánh giá trung bình</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm text-sm">
            <Trophy className="w-4 h-4 text-[#1E5AA8]" />
            <span className="font-extrabold text-[#101828]">100%</span>
            <span className="text-[#667085] text-xs">Hài lòng tuyệt đối</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-extrabold text-[#101828]">{feedbacks.length} Feedback</span>
            <span className="text-[#667085] text-xs">Cập nhật liên tục</span>
          </div>
        </div>

        {/* Action Button: Gửi đánh giá ngay */}
        <div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white text-sm font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <MessageSquarePlus size={18} />
            <span>Để Lại Đánh Giá Của Bạn</span>
          </button>
        </div>
      </div>

      {/* ─── INFINITE CAROUSEL CONTAINER (HOVER TO SLOW) ─── */}
      <div className="marquee-container relative w-full overflow-hidden space-y-6 select-none group">
        {/* Left & Right gradient fade masks for seamless infinite look */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#FFFBF7] to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#FFFBF7] to-transparent z-20" />

        {/* ROW 1: Scrolls to the Left */}
        <div className="marquee-track-left py-2 px-4">
          {infiniteRow1.map((item, idx) => (
            <FeedbackCard key={`r1-${item._id || item.id || idx}-${idx}`} feedback={item} />
          ))}
        </div>

        {/* ROW 2: Scrolls to the Right */}
        <div className="marquee-track-right py-2 px-4">
          {infiniteRow2.map((item, idx) => (
            <FeedbackCard key={`r2-${item._id || item.id || idx}-${idx}`} feedback={item} />
          ))}
        </div>
      </div>

      {/* Hover hint */}
      <div className="text-center mt-6">
        <span className="text-xs text-[#98A2B3] font-medium tracking-wide">
          💡 Rê chuột vào thẻ để giảm tốc độ đọc đánh giá chi tiết
        </span>
      </div>

      {/* Direct Modal instance */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newFeedback) => {
          setFeedbacks((prev) => [newFeedback, ...prev].slice(0, 100));
          setStats((prev) => ({ ...prev, total: prev.total + 1 }));
        }}
      />
    </section>
  );
}
