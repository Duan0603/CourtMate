'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { FeedbackCarousel } from '../components/feedback/FeedbackCarousel';
import { SportsShowcase3D } from '../components/3d';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
      smoother.scrollTop(0);
    } catch (e) {
      console.warn('ScrollSmoother notice:', e);
    }

    // Scroll back to top after DOM and ScrollSmoother setup
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    });

    // 1. Line-Reveal on Hero Title & Headings
    gsap.from('.line-reveal-item', {
      yPercent: 105,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
    });

    return () => {
      // Kill ScrollSmoother and explicitly reset any DOM mutations it made,
      // otherwise Next.js client-side navigation leaves body in a broken state
      // (position:fixed, overflow:hidden) causing blank pages.
      if (smoother) {
        smoother.kill();
        smoother = null;
      }
      ScrollTrigger.getAll().forEach((t) => t.kill());
      // Reset body/html styles that ScrollSmoother may have set
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    };
  }, { scope: containerRef });

  return (
    <div id="smooth-wrapper" className="lp-container bg-white text-ink min-h-screen font-sans overflow-x-hidden -mt-[72px]" ref={containerRef}>

      <div id="smooth-content">
        <section id="hero" className="min-h-[100svh] flex items-center pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="page-container text-center">
            <h1 className="text-[clamp(3rem,7.5vw,8rem)] font-black leading-[1.1] tracking-tight text-ink">
              <span className="block overflow-hidden"><span className="line-reveal-item inline-block">Tìm bạn chơi.</span></span>
              <span className="block overflow-hidden"><span className="line-reveal-item inline-block text-primary">Tham gia giải đấu.</span></span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed">Tìm bạn chơi, tham gia giải đấu và theo dõi lịch thi đấu.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8 sm:mt-10">
              <Link href="/matches" className="inline-flex items-center justify-center gap-3 min-h-12 px-7 py-3.5 rounded-xl bg-primary text-white text-base font-bold shadow-interactive hover:bg-primary-dark transition-colors">
                Tìm bạn chơi <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link href="/tournaments" className="inline-flex items-center justify-center min-h-12 px-7 py-3.5 rounded-xl bg-primary-soft text-primary text-base font-bold shadow-subtle hover:bg-surface-dim transition-colors">
                Xem giải đấu
              </Link>
            </div>
          </div>
        </section>

        <SportsShowcase3D />

        {/* ─── PLATFORM FEEDBACK INFINITE CAROUSEL ─── */}
        <FeedbackCarousel />

      </div>
    </div>
  );
}
