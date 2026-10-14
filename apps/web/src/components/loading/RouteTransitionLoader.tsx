'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLoading } from '../../context/LoadingContext';

/**
 * Smart Transition Loader:
 * - Remains invisible if client-side navigation completes within the configured threshold (200-300ms).
 * - If navigation takes longer, displays a sleek, non-intrusive CourtMate sports top loader & micro-pill badge.
 * - Smoothly exits as soon as destination is ready without artificial delays.
 */
export function RouteTransitionLoader() {
  const { isNavLoaderVisible, isNavigating } = useLoading();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isNavLoaderVisible && isNavigating) {
      setShouldRender(true);

      const ctx = gsap.context(() => {
        // Fast entrance animation
        if (progressBarRef.current) {
          gsap.fromTo(
            progressBarRef.current,
            { width: '0%', opacity: 1 },
            { width: '85%', duration: 1.8, ease: 'power2.out' }
          );
        }

        if (pillRef.current) {
          gsap.fromTo(
            pillRef.current,
            { y: -20, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.5)' }
          );
        }
      });

      return () => ctx.revert();
    } else if (!isNavigating && shouldRender) {
      // Destination ready: Quick and smooth exit
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            setShouldRender(false);
          },
        });

        if (progressBarRef.current) {
          tl.to(progressBarRef.current, {
            width: '100%',
            duration: 0.15,
            ease: 'power1.in',
          }).to(progressBarRef.current, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out',
          });
        }

        if (pillRef.current) {
          tl.to(
            pillRef.current,
            {
              y: -10,
              opacity: 0,
              scale: 0.95,
              duration: 0.2,
              ease: 'power2.in',
            },
            '-=0.15'
          );
        }
      });

      return () => ctx.revert();
    }
  }, [isNavLoaderVisible, isNavigating, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9990] pointer-events-none flex flex-col items-center"
      aria-live="polite"
      aria-label="Đang chuyển trang"
    >
      {/* Top glowing progress beam */}
      <div className="w-full h-[3px] bg-transparent overflow-hidden">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-[#1E5AA8] via-[#0077FF] to-[#FFC400] shadow-[0_0_12px_rgba(0,119,255,0.8)]"
          style={{ width: '0%' }}
        />
      </div>

      {/* Sporty Floating Pill (Subtle feedback for noticeable delays) */}
      <div
        ref={pillRef}
        className="mt-3 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg flex items-center gap-2 pointer-events-auto"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E5AA8] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E5AA8]" />
        </span>
        <span className="text-[11px] font-bold tracking-wide text-slate-800">
          Đang tải trang...
        </span>
      </div>
    </div>
  );
}
