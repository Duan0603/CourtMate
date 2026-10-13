'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

export interface SportsOverlaysProps {
  isAuthenticated: boolean;
}

interface FeatureCardConfig {
  id: string;
  num: string;
  containerClass: string;
  numClass: string;
  title: string[];
  description: string;
}

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    id: 'feature-01',
    num: '01',
    containerClass: 'left-[48%] md:left-[52%] top-1/2 -translate-y-1/2 max-w-[460px]',
    numClass: '-top-16 -left-8',
    title: ['Mọi Giải Đấu,', 'Một Nền Tảng'],
    description:
      'Khám phá hàng trăm giải đấu cầu lông & pickleball tại Đà Nẵng. Theo dõi bảng đấu, tỉ số và bảng xếp hạng tức thì theo thời gian thực.',
  },
  {
    id: 'feature-02',
    num: '02',
    containerClass: 'left-[8%] md:left-[15%] top-1/2 -translate-y-1/2 max-w-[460px]',
    numClass: '-top-16 -left-8',
    title: ['Tìm Kiếm Nhanh Chóng,', 'Chính Xác'],
    description:
      'Bộ lọc nâng cao cho phép bạn tìm kiếm theo khu vực, thời gian và trình độ. Tiết kiệm thời gian, tập trung thi đấu hết mình.',
  },
  {
    id: 'feature-03',
    num: '03',
    containerClass:
      'left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 max-w-[480px] text-center',
    numClass: '-top-16 left-1/2 -translate-x-1/2',
    title: ['Không Bỏ Lỡ', 'Bất Kỳ Cơ Hội Nào'],
    description:
      'Nhận thông báo ngay lập tức khi có giải đấu mới phù hợp với hồ sơ của bạn. Cập nhật lịch thi đấu tự động và ghép cặp on-demand.',
  },
];

export function SportsOverlays({ isAuthenticated }: SportsOverlaysProps) {
  const router = useRouter();
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 3D Tilt button effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ctaBtnRef.current) return;
    const rect = ctaBtnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(ctaBtnRef.current, {
      rotationY: x / 6,
      rotationX: -y / 6,
      ease: 'power2.out',
      duration: 0.4,
    });
  };

  const handleMouseLeave = () => {
    if (!ctaBtnRef.current) return;
    gsap.to(ctaBtnRef.current, {
      rotationY: 0,
      rotationX: 0,
      ease: 'power2.out',
      duration: 0.4,
    });
  };

  // CTA Click: Smooth slide transition before navigating
  const handleCtaClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const targetUrl = isAuthenticated ? '/tournaments' : '/register';
    const curtain = document.getElementById('slide-curtain');
    if (curtain) {
      gsap.fromTo(
        curtain,
        { x: '-100%' },
        {
          x: '0%',
          duration: 0.65,
          ease: 'power3.inOut',
          onComplete: () => {
            router.push(targetUrl);
          },
        },
      );
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <>
      {/* ─── INTRO TEXT ("Sẵn Sàng Trải Nghiệm?") ─── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <h2
          className="intro-text text-5xl md:text-7xl font-black opacity-0 scale-90 text-center -translate-y-28 transition-transform"
          style={{
            color: '#101828',
            textShadow:
              '0 0 50px rgba(255,255,255,1), 0 0 25px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.9)',
          }}
        >
          Sẵn Sàng
          <br />
          <span className="text-[#1E5AA8]">Trải Nghiệm?</span>
        </h2>
      </div>

      {/* ─── FEATURE CARDS 01, 02, 03 ─── */}
      {FEATURE_CARDS.map((card) => (
        <div
          key={card.id}
          id={card.id}
          className={`absolute w-[90%] md:w-full opacity-0 pointer-events-auto z-30 ${card.containerClass}`}
        >
          <div className="relative bg-white/75 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/80 shadow-xl shadow-slate-200/50">
            <div
              className={`absolute text-[140px] font-black text-transparent pointer-events-none select-none ${card.numClass}`}
              style={{ WebkitTextStroke: '4px rgba(16, 24, 40, 0.06)' }}
            >
              {card.num}
            </div>

            <h2 className="feature-heading text-3xl md:text-5xl font-black leading-[1.15] text-[#1E5AA8] relative z-10 mb-4">
              {card.title.map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < card.title.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <p className="feature-para text-base md:text-lg text-[#475467] font-medium relative z-10 leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>
      ))}

      {/* ─── CTA SECTION: "Sẵn Sàng Để Bắt Đầu?" ─── */}
      <div className="story-cta absolute left-[5%] md:left-[48%] top-1/2 -translate-y-1/2 w-[90%] md:w-full max-w-[480px] opacity-0 pointer-events-none z-40">
        <div className="w-full rounded-[2.5rem] bg-gradient-to-br from-[#1E5AA8] to-[#12396e] text-white p-8 md:p-10 text-center shadow-2xl relative overflow-hidden group border border-white/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

          <div className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-sm">
            ✨ Cùng CourtMate Tỏa Sáng
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-4 relative z-10 tracking-tight leading-tight">
            Sẵn Sàng Để Bắt Đầu?
          </h2>
          <p className="text-base md:text-lg font-medium mb-8 relative z-10 text-white/90 leading-relaxed">
            Tham gia mạng lưới kết nối thể thao phát triển nhanh nhất Đà Nẵng ngay hôm nay.
          </p>

          <div style={{ perspective: '1000px' }} className="inline-block relative z-10 w-full">
            <button
              ref={ctaBtnRef}
              onClick={handleCtaClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full bg-white text-[#1E5AA8] px-8 py-4 rounded-full font-black text-base shadow-2xl flex items-center justify-center gap-3 transition-transform hover:shadow-cyan-500/20 active:scale-95 cursor-pointer"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
              <span>
                {isAuthenticated ? 'Khám Phá Giải Đấu Ngay' : 'Tạo Tài Khoản Miễn Phí'}
              </span>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ─── SCROLL INDICATOR ─── */}
      <div className="story-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center z-40 opacity-0 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center animate-bounce border border-slate-100">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1E5AA8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>

      {/* ─── SLIDE RIGHT TRANSITION CURTAIN ─── */}
      <div
        id="slide-curtain"
        className="fixed inset-0 bg-gradient-to-r from-[#1E5AA8] via-[#0284c7] to-[#38bdf8] z-50 pointer-events-none transform -translate-x-full shadow-2xl flex items-center justify-center"
      >
        <div className="text-white text-2xl font-black flex items-center gap-3 animate-pulse">
          <span>CourtMate</span>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </>
  );
}

export default SportsOverlays;
