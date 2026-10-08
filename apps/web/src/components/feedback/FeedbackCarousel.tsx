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
    getFallbackFeedbacks().slice(0, 50)
  );
  const [stats, setStats] = useState<FeedbackStats>({
    total: 50,
    averageRating: 4.24,
    fiveStarPercent: 40,
    recommendRate: 96,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Smooth hover deceleration refs & Web Animations API controllers
  const row1Ref = React.useRef<HTMLDivElement>(null);
  const row2Ref = React.useRef<HTMLDivElement>(null);
  const currentSpeedRef = React.useRef(1.0);
  const targetSpeedRef = React.useRef(1.0);
  const rafRef = React.useRef<number | null>(null);

  const updateSpeed = React.useCallback(() => {
    const current = currentSpeedRef.current;
    const target = targetSpeedRef.current;
    const diff = target - current;

    if (Math.abs(diff) < 0.005) {
      currentSpeedRef.current = target;
    } else {
      // Smooth lerp: ~0.08 per frame creates a buttery ~300ms deceleration/acceleration
      currentSpeedRef.current += diff * 0.08;
    }

    const anims: Animation[] = [];
    if (row1Ref.current) anims.push(...row1Ref.current.getAnimations());
    if (row2Ref.current) anims.push(...row2Ref.current.getAnimations());

    for (const anim of anims) {
      anim.playbackRate = currentSpeedRef.current;
    }

    if (currentSpeedRef.current !== target) {
      rafRef.current = requestAnimationFrame(updateSpeed);
    } else {
      rafRef.current = null;
    }
  }, []);

  const handleMouseEnter = () => {
    targetSpeedRef.current = 0.2; // Slow down to 20% speed smoothly without resetting position
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(updateSpeed);
    }
  };

  const handleMouseLeave = () => {
    targetSpeedRef.current = 1.0; // Return to 100% normal speed smoothly
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(updateSpeed);
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Fetch from backend API on mount
  useEffect(() => {
    let isMounted = true;
    feedbacksApi.getLatestFeedbacks(50).then((res) => {
      if (isMounted && res.feedbacks && res.feedbacks.length > 0) {
        setFeedbacks(res.feedbacks);
        if (res.stats) setStats(res.stats);
      }
    });

    // Listen for real-time feedback submissions
    const handleNewFeedback = (event: Event) => {
      const customEvent = event as CustomEvent<PlatformFeedback>;
      if (customEvent.detail) {
        setFeedbacks((prev) => [customEvent.detail, ...prev].slice(0, 50));
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

  // Split feedbacks into 2 balanced rows of 25 items each for the dual-track infinite marquee
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

        /* Specific card hover highlights and lifts up */
        .feedback-card:hover {
          transform: translateY(-6px) scale(1.02);
          z-index: 30;
        }

        @media (max-width: 768px) {
          .marquee-track-left { animation-duration: 130s; }
          .marquee-track-right { animation-duration: 140s; }
        }
      `}} />

      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#1E5AA8]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center mb-12 md:mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F1FA] text-[#1E5AA8] text-xs font-bold uppercase tracking-widest mb-4 border border-[#1E5AA8]/15">
          <Sparkles size={14} className="text-[#1E5AA8]" />
          50 Đánh Giá Mới Nhất Từ Hệ Thống
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101828] tracking-tight leading-[1.15] mb-5">
          Cộng Đồng Người Chơi Nói Gì Về <span className="text-[#1E5AA8]">CourtMate</span>?
        </h2>

        <p className="text-[#475467] text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-8">
          Tổng hợp 50 trải nghiệm thực tế từ các vận động viên, người chơi phong trào và ban tổ chức giải đấu trên khắp Đà Nẵng.
        </p>

        {/* Stats Pill Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm text-sm">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-[#101828]">{(stats.averageRating || 4.24).toFixed(2)}/5.0</span>
            <span className="text-[#667085] text-xs">Đánh giá trung bình</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm text-sm">
            <Trophy className="w-4 h-4 text-[#1E5AA8]" />
            <span className="font-extrabold text-[#101828]">{stats.recommendRate || 96}%</span>
            <span className="text-[#667085] text-xs">Hài lòng đánh giá</span>
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
      <div
        className="marquee-container relative w-full overflow-hidden space-y-6 select-none group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {/* Left & Right gradient fade masks for seamless infinite look */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#FFFBF7] to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#FFFBF7] to-transparent z-20" />

        {/* ROW 1: Scrolls to the Left */}
        <div ref={row1Ref} className="marquee-track-left py-2 px-4">
          {infiniteRow1.map((item, idx) => (
            <FeedbackCard key={`r1-${item._id || item.id || idx}-${idx}`} feedback={item} />
          ))}
        </div>

        {/* ROW 2: Scrolls to the Right */}
        <div ref={row2Ref} className="marquee-track-right py-2 px-4">
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
          setFeedbacks((prev) => [newFeedback, ...prev].slice(0, 50));
          setStats((prev) => ({ ...prev, total: prev.total + 1 }));
        }}
      />
    </section>
  );
}
