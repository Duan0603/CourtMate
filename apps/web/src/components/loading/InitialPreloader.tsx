'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { LoadingDots } from '../shared/LoadingDots';

export function InitialPreloader() {
  const {
    isInitialLoading,
    initialPreloaderFailed,
    initialPreloaderError,
    retryInitialPreloader,
    isNavigating,
    isNavLoaderVisible,
  } = useLoading();

  const containerRef = useRef<HTMLDivElement>(null);
  const paddleRef = useRef<SVGGElement>(null);
  const racketRef = useRef<SVGGElement>(null);
  const ballRef = useRef<SVGGElement>(null);
  const shuttlecockRef = useRef<SVGGElement>(null);
  const trajectoryPathRef = useRef<SVGPathElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Keep DOM visible during exit animation
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (initialPreloaderFailed) {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
      return;
    }

    const ctx = gsap.context(() => {
      // ──────────────────────────────────────────────────────────────────────
      // CINEMATIC DUAL-SPORT ANIMATION
      // Pickleball paddle strike -> arc trajectory -> Badminton racket strike
      // ──────────────────────────────────────────────────────────────────────
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.25,
        defaults: { ease: 'power2.out' },
      });
      timelineRef.current = tl;

      // Initial positions
      gsap.set(paddleRef.current, {
        x: -45,
        y: 10,
        rotation: -25,
        transformOrigin: '35% 85%',
        opacity: 0,
      });
      gsap.set(ballRef.current, {
        x: 0,
        y: 0,
        scale: 0.6,
        opacity: 0,
        transformOrigin: '50% 50%',
      });
      gsap.set(racketRef.current, {
        x: 60,
        y: -10,
        rotation: 35,
        transformOrigin: '70% 90%',
        opacity: 0,
      });
      gsap.set(shuttlecockRef.current, {
        x: 30,
        y: 10,
        opacity: 0,
        rotation: -30,
        transformOrigin: '50% 50%',
      });
      gsap.set(trajectoryPathRef.current, {
        strokeDasharray: 300,
        strokeDashoffset: 300,
        opacity: 0.4,
      });

      // Step 1: Pickleball paddle enters and strikes the pickleball
      tl.to(paddleRef.current, {
        opacity: 1,
        x: -15,
        y: 0,
        rotation: -5,
        duration: 0.45,
        ease: 'back.out(1.4)',
      })
      .to(ballRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.25,
      }, '-=0.2')
      // Strike impact!
      .to(paddleRef.current, {
        rotation: 20,
        x: 10,
        duration: 0.18,
        ease: 'power3.inOut',
      })
      // Pickleball launched across continuous arc
      .to(ballRef.current, {
        x: 80,
        y: -35,
        rotation: 360,
        duration: 0.45,
        ease: 'power1.out',
      }, '-=0.1')
      .to(trajectoryPathRef.current, {
        strokeDashoffset: 0,
        duration: 0.5,
        ease: 'power1.inOut',
      }, '-=0.4')
      // Transition: Ball reaches peak and transforms momentum towards badminton court
      .to(ballRef.current, {
        x: 135,
        y: -10,
        opacity: 0,
        scale: 0.5,
        duration: 0.25,
      })
      // Badminton racket swings in to meet the shuttlecock
      .to(racketRef.current, {
        opacity: 1,
        x: 10,
        y: -10,
        rotation: 15,
        duration: 0.35,
        ease: 'power2.out',
      }, '-=0.2')
      .to(shuttlecockRef.current, {
        opacity: 1,
        x: 40,
        y: -5,
        rotation: 10,
        duration: 0.25,
      }, '-=0.25')
      // Smash/Drive impact with badminton racket head
      .to(racketRef.current, {
        rotation: -35,
        x: -25,
        y: 5,
        duration: 0.2,
        ease: 'power3.inOut',
      })
      .to(shuttlecockRef.current, {
        x: -40,
        y: -75,
        rotation: -75,
        scale: 1.15,
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.15')
      // Soft fade / reset transition
      .to([paddleRef.current, racketRef.current, ballRef.current, shuttlecockRef.current], {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
      })
      .to(trajectoryPathRef.current, {
        strokeDashoffset: -300,
        duration: 0.3,
      }, '-=0.25');

      // Subtle pulse on brand text
      gsap.to(brandTextRef.current, {
        y: -3,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [initialPreloaderFailed]);

  // InitialPreloader only handles initial application load. Route navigation is handled non-intrusively by RouteTransitionLoader.
  const isBusy = isInitialLoading;

  // Sync render state and animations
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShouldRender(isBusy || initialPreloaderFailed);
      return;
    }
    if (isBusy) {
      setShouldRender(true);
      if (containerRef.current) {
        containerRef.current.style.pointerEvents = 'auto';
        gsap.to(containerRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    } else if (!initialPreloaderFailed) {
      if (containerRef.current) {
        // Release pointer events immediately so user can interact with the rendered page right away
        containerRef.current.style.pointerEvents = 'none';
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.98,
          duration: 0.25,
          ease: 'power2.inOut',
          onComplete: () => {
            setShouldRender(false);
          },
        });
      } else {
        setShouldRender(false);
      }
    }
  }, [isBusy, initialPreloaderFailed]);

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-canvas selection:bg-none"
      aria-label="CourtMate Loading Screen"
      role="status"
    >
      {/* Background Sport Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary/10 via-primary/5 to-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Preloader Content Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Cinematic SVG Stage */}
        <div className="relative w-72 h-44 flex items-center justify-center mb-6">
          <svg
            viewBox="0 0 300 160"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Trajectory Guide Arc */}
            <path
              ref={trajectoryPathRef}
              d="M 60 90 Q 150 15 230 85"
              stroke="#0077FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
              opacity="0.3"
            />

            {/* Pickleball Paddle */}
            <g ref={paddleRef} id="pickleball-paddle">
              {/* Handle */}
              <rect x="35" y="90" width="10" height="28" rx="4" fill="#00102F" />
              <rect x="37" y="94" width="6" height="20" rx="2" fill="#475467" />
              {/* Paddle Face */}
              <rect x="23" y="42" width="34" height="50" rx="14" fill="#1E5AA8" stroke="#00102F" strokeWidth="2.5" />
              {/* Inner Honeycomb Core Accent */}
              <circle cx="34" cy="58" r="3" fill="#E8F1FA" opacity="0.8" />
              <circle cx="46" cy="58" r="3" fill="#E8F1FA" opacity="0.8" />
              <circle cx="40" cy="70" r="3.5" fill="#FFC400" />
            </g>

            {/* Pickleball (Perforated Neon Ball) */}
            <g ref={ballRef} id="pickleball">
              <circle cx="70" cy="80" r="10" fill="#FFC400" stroke="#B48900" strokeWidth="1.5" />
              {/* Perforations */}
              <circle cx="67" cy="77" r="1.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="73" cy="77" r="1.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="70" cy="83" r="1.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="66" cy="82" r="1.2" fill="#FFFFFF" opacity="0.9" />
              <circle cx="74" cy="82" r="1.2" fill="#FFFFFF" opacity="0.9" />
            </g>

            {/* Badminton Racket */}
            <g ref={racketRef} id="badminton-racket">
              {/* Shaft & Handle */}
              <line x1="240" y1="90" x2="260" y2="130" stroke="#00102F" strokeWidth="3" strokeLinecap="round" />
              <rect x="254" y="118" width="9" height="22" rx="3" transform="rotate(-26 254 118)" fill="#1E5AA8" />
              {/* Isometric Oval Head */}
              <ellipse cx="228" cy="65" rx="22" ry="28" fill="rgba(0, 119, 255, 0.08)" stroke="#1E5AA8" strokeWidth="3" />
              {/* String Grid */}
              <line x1="220" y1="42" x2="220" y2="88" stroke="#1E5AA8" strokeWidth="0.8" opacity="0.5" />
              <line x1="228" y1="38" x2="228" y2="92" stroke="#1E5AA8" strokeWidth="0.8" opacity="0.5" />
              <line x1="236" y1="42" x2="236" y2="88" stroke="#1E5AA8" strokeWidth="0.8" opacity="0.5" />
              <line x1="210" y1="58" x2="246" y2="58" stroke="#1E5AA8" strokeWidth="0.8" opacity="0.5" />
              <line x1="210" y1="72" x2="246" y2="72" stroke="#1E5AA8" strokeWidth="0.8" opacity="0.5" />
            </g>

            {/* Shuttlecock */}
            <g ref={shuttlecockRef} id="shuttlecock">
              {/* Feathers / Cone */}
              <polygon points="175,60 162,45 188,45" fill="#FFFFFF" stroke="#0077FF" strokeWidth="1.2" opacity="0.9" />
              <line x1="168" y1="50" x2="182" y2="50" stroke="#0077FF" strokeWidth="0.8" />
              {/* Cork Base */}
              <ellipse cx="175" cy="62" rx="5" ry="4" fill="#00102F" />
            </g>
          </svg>
        </div>

        {/* Brand Name & Typography */}
        <div ref={brandTextRef} className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-[0.25em] text-primary uppercase">
              CourtMate Sports
            </span>
          </div>

          <h2 className="text-2xl font-black text-ink tracking-tight">
            Kết nối sân & Giải đấu
          </h2>
        </div>

        {/* Dynamic Status / Error Handling */}
        {!initialPreloaderFailed ? (
          <div className="mt-4 flex flex-col items-center gap-2.5">
            <LoadingDots size="md" colorScheme="brand" />
            <p ref={statusRef} className="text-xs font-semibold text-muted animate-pulse">
              Đang chuẩn bị dữ liệu sân đấu...
            </p>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col items-center text-center animate-fadeIn">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center mb-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold mb-3">
              {initialPreloaderError || 'Quá trình khởi động mất nhiều thời gian hơn dự kiến.'}
            </p>
            <button
              onClick={retryInitialPreloader}
              className="cm-button inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-dark shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
