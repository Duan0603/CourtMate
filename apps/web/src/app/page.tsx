'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { FeedbackCarousel } from '../components/feedback/FeedbackCarousel';
import Phone3D from '../components/Phone3D';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);
}

// ─── ICON COMPONENTS ────────────────────────────────────────────────────────
function MouseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="34" viewBox="0 0 24 34" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="30" rx="10" />
      <path d="M12 10v4" className="mouse-wheel" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

const SPORT_ICONS = [
  <svg key="tennis" viewBox="0 0 24 24" fill="#0ea5e9"><circle cx="12" cy="12" r="10"/><path d="M6 5a8 8 0 0 1 0 14M18 5a8 8 0 0 0 0 14" stroke="#FFF" strokeWidth="1.5"/></svg>,
  <svg key="basket" viewBox="0 0 24 24" fill="#f97316"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M4.9 4.9a14 14 0 0 1 0 14.2M19.1 4.9a14 14 0 0 0 0 14.2" stroke="#FFF" strokeWidth="1.5"/></svg>,
  <svg key="soccer" viewBox="0 0 24 24" fill="#1E5AA8"><circle cx="12" cy="12" r="10"/><path d="M12 7l-3.5 2.5 1.5 4h4l1.5-4L12 7z" fill="#FFF"/><path d="M12 2v5M3 8.5l5 1M21 8.5l-5 1M6 18l2.5-3.5M18 18l-2.5-3.5" stroke="#FFF" strokeWidth="1.5"/></svg>,
  <svg key="trophy" viewBox="0 0 24 24" fill="#eab308"><path d="M6 3h12v4a6 6 0 0 1-12 0V3z"/><path d="M10 15v4h4v-4M8 21h8" stroke="#FFF" strokeWidth="2"/><path d="M6 5H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1M18 5h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1" stroke="#FFF" strokeWidth="1.5" fill="none"/></svg>,
  <svg key="shuttle" viewBox="0 0 24 24" fill="#8b5cf6"><path d="M12 22a3 3 0 0 0 3-3c0-3-3-4-3-4s-3 1-3 4a3 3 0 0 0 3 3z"/><path d="M9 15L3 4.5 12 7l9-2.5L15 15" fill="none" stroke="#FFF" strokeWidth="1.5"/><path d="M12 7v8M7.5 10l3.5 1M16.5 10l-3.5 1" stroke="#FFF" strokeWidth="1.5"/></svg>
];

const FLOATING_ITEMS = [
  { id: 1, icon: 0, left: '5%', size: 40, delay: 0, duration: 18, type: 'desktop' },
  { id: 2, icon: 1, left: '15%', size: 28, delay: 4, duration: 22, type: 'all' },
  { id: 3, icon: 2, left: '25%', size: 48, delay: 1, duration: 16, type: 'desktop' },
  { id: 4, icon: 3, left: '35%', size: 32, delay: 7, duration: 24, type: 'all' },
  { id: 5, icon: 0, left: '45%', size: 56, delay: 2, duration: 19, type: 'desktop' },
  { id: 6, icon: 1, left: '55%', size: 36, delay: 5, duration: 21, type: 'all' },
  { id: 7, icon: 2, left: '65%', size: 30, delay: 8, duration: 20, type: 'desktop' },
  { id: 8, icon: 3, left: '75%', size: 50, delay: 3, duration: 17, type: 'all' },
  { id: 9, icon: 0, left: '85%', size: 24, delay: 9, duration: 25, type: 'desktop' },
  { id: 10, icon: 1, left: '92%', size: 42, delay: 6, duration: 15, type: 'all' },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Force scroll to top on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    let smoother: ScrollSmoother | null = null;
    try {
      smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.1,
      });
    } catch (e) {
      console.warn('ScrollSmoother notice:', e);
    }

    ScrollTrigger.refresh();

    // 1. Line-Reveal on Hero Title & Headings
    gsap.from('.line-reveal-item', {
      yPercent: 105,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
    });

    // 2. Mouse Wheel Animation
    gsap.to('.mouse-wheel', {
      y: 8, opacity: 0, duration: 1.5, repeat: -1, ease: 'power1.inOut'
    });

    // 3. Highlight-Reveal Animations for Section Labels & Badges (Removed as per request)

    // 4. Feature Rows Reveal (Simplified for new text effects)
    const features = gsap.utils.toArray('.feature-row');
    features.forEach((feature: any) => {
      gsap.from(feature, {
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: feature,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // 5. Final CTA Reveal
    gsap.from('.final-cta-content', {
      opacity: 0,
      scale: 0.96,
      y: 30,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.final-cta-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });

    return () => {
      if (smoother) smoother.kill();
    };

  }, { scope: containerRef });

  return (
    <div id="smooth-wrapper" className="lp-container bg-white text-[#101828] min-h-screen font-sans overflow-x-hidden -mt-[72px]" ref={containerRef}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatY {
          0% { transform: translateY(110vh) scale(0.8); opacity: 0; }
          15% { opacity: 0.3; transform: translateY(80vh) scale(1); }
          85% { opacity: 0.3; transform: translateY(-80vh) scale(1); }
          100% { transform: translateY(-110vh) scale(0.8); opacity: 0; }
        }
        @keyframes floatX {
          0%, 100% { transform: translateX(-20px) rotate(-15deg); }
          50% { transform: translateX(20px) rotate(15deg); }
        }

        .float-wrapper {
          position: absolute;
          bottom: 0;
          opacity: 0;
          animation: floatY linear infinite backwards;
        }
        .float-inner {
          animation: floatX ease-in-out infinite backwards;
          color: #1E5AA8;
        }

        /* Line Reveal */
        .line-reveal-mask {
          overflow: hidden;
          display: inline-block;
          vertical-align: bottom;
          padding-top: 0.05em;
          padding-bottom: 0.05em;
        }
        .line-reveal-item {
          display: inline-block;
          will-change: transform, opacity;
        }

        /* Feature Row Visual Cards */
        .feature-row {
          padding: 5rem 2rem;
          position: relative;
        }
        .visual-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.08);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .visual-card-inner:hover {
          transform: translateY(-4px);
          box-shadow: 0 36px 90px rgba(30,90,168,0.15);
        }

        .visual-card-inner:hover {
          transform: translateY(-4px);
          box-shadow: 0 36px 90px rgba(30,90,168,0.15);
        }
      `}} />

      {/* GSAP ScrollSmoother Content Container */}
      <div id="smooth-content">

        {/* ─── HERO ─── */}
        <section id="hero" className="hero-section min-h-[100svh] flex flex-col relative px-4 pt-32 pb-8">
          
          {/* Floating Background Icons & Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             {FLOATING_ITEMS.map((item) => (
               <div 
                  key={item.id} 
                  className={`float-wrapper ${item.type === 'desktop' ? 'hidden md:block' : ''}`}
                  style={{ 
                    left: item.left, 
                    animationDuration: `${item.duration}s`, 
                    animationDelay: `${item.delay}s` 
                  }}
               >
                  <div 
                    className="float-inner flex justify-center items-center"
                    style={{ 
                      fontSize: `${item.size}px`, 
                      lineHeight: 1,
                      animationDuration: `${item.duration * 0.6}s`,
                      animationDelay: `${item.delay}s`
                    }}
                  >
                    {SPORT_ICONS[item.icon]}
                  </div>
               </div>
             ))}
             <div className="absolute w-[40vw] h-[40vw] bg-[#1E5AA8] rounded-full blur-[120px] opacity-[0.06] top-1/4 left-1/4" data-speed="0.8" />
             <div className="absolute w-[30vw] h-[30vw] bg-[#101828] rounded-full blur-[120px] opacity-[0.06] bottom-1/4 right-1/4" data-speed="1.2" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto z-10 relative mt-4 text-center">
            
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-white/80 blur-[80px] rounded-full z-[-1]" />
            
            {/* Badge */}
            <div className="line-reveal-mask mb-8">
              <div className="line-reveal-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#1E5AA8] text-xs font-bold uppercase tracking-widest border border-[#1E5AA8]/15 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#1E5AA8] animate-pulse" />
                Nền tảng toàn diện tại Đà Nẵng
              </div>
            </div>
            
            {/* Main Headline (Line Reveal) */}
            <h1 className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-black leading-[1.15] tracking-tight mb-8 text-[#101828] flex flex-wrap justify-center gap-x-3 md:gap-x-5">
              <span className="line-reveal-mask">
                <span className="line-reveal-item">Tìm Kiếm.</span>
              </span>
              <span className="line-reveal-mask">
                <span className="line-reveal-item text-[#1E5AA8]">Kết Nối.</span>
              </span>
              <span className="line-reveal-mask">
                <span className="line-reveal-item">Thi Đấu.</span>
              </span>
            </h1>
            
            {/* Subtitle */}
            <div className="line-reveal-mask">
              <p className="line-reveal-item text-lg md:text-xl text-[#475467] max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
                Mạng lưới kết nối thể thao hàng đầu. Khám phá các giải đấu phù hợp, theo dõi lịch trình và nâng tầm kỹ năng của bạn.
              </p>
            </div>

          </div>

          {/* Scroll Indicator */}
          <div className="hero-scroll-indicator flex flex-col items-center justify-center gap-2 z-10 mt-auto pt-8 pb-12 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="relative animate-bounce">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1E5AA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
              </svg>
            </div>
          </div>
        </section>

        <Phone3D />

        {/* ─── PLATFORM FEEDBACK INFINITE CAROUSEL ─── */}
        <FeedbackCarousel />

      </div>
    </div>
  );
}
