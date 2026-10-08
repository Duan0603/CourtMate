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
    <section id="feedback-section" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-[white] via-white to-[white]">
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

      {/* Section Header (Redesigned like Image 5) */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-16 md:mb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E5AA8] text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
              <MessageSquarePlus size={14} />
              100+ Đánh Giá Từ Người Dùng
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#101828] uppercase tracking-tighter leading-[0.95]">
              Cộng Đồng Người Chơi Nói Gì Về <br className="hidden lg:block"/> CourtMate?
            </h2>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <p className="text-[#475467] text-lg lg:text-xl font-medium leading-relaxed">
              Tổng hợp 100 trải nghiệm thực tế từ các vận động viên, người chơi phong trào và ban tổ chức giải đấu trên khắp Đà Nẵng.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 border-t border-gray-200">
              {/* Rating */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-[#101828]">{(stats.averageRating || 5.0).toFixed(1)}/5</span>
                  <span className="text-[#667085] text-sm font-medium whitespace-nowrap">Hơn +100 khách hàng</span>
                </div>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-12 bg-gray-200 mx-4"></div>

              {/* Avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3 bg-gray-100 p-1.5 rounded-full border border-gray-200">
                  <img className="w-10 h-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
                  <img className="w-10 h-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=2" alt="Avatar" />
                  <img className="w-10 h-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=3" alt="Avatar" />
                  <div className="w-10 h-10 shrink-0 rounded-full border-2 border-white bg-[#1E5AA8] text-white flex items-center justify-center text-xs font-bold shadow-sm z-10 relative">
                    +99
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[white] to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[white] to-transparent z-20" />

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
