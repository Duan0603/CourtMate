'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
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
  // Flaticon-style Racket (Detailed Outline)
  <svg key="rkt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.686 2 6 5.582 6 10c0 2.378 1.454 4.512 3.618 5.768l-2.325 5.58a1.5 1.5 0 0 0 2.774 1.154l1.246-2.992c.225.032.453.05.687.05.234 0 .462-.018.687-.05l1.246 2.992a1.5 1.5 0 0 0 2.774-1.154l-2.325-5.58C16.546 14.512 18 12.378 18 10c0-4.418-2.686-8-6-8z"/><path d="M9 10h6M10.5 6h3M10.5 14h3M12 2v13.5"/></svg>,
  // Flaticon-style Shuttlecock
  <svg key="sht" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a3 3 0 0 0 3-3c0-3-3-4-3-4s-3 1-3 4a3 3 0 0 0 3 3z"/><path d="M9 15L3 4.5 12 7l9-2.5L15 15"/><path d="M12 7v8M7.5 10l3.5 1M16.5 10l-3.5 1"/></svg>,
  // Flaticon-style Basketball
  <svg key="bsk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><path d="M4.93 4.93A14 14 0 0 1 12 10a14 14 0 0 1 7.07-5.07M4.93 19.07A14 14 0 0 0 12 14a14 14 0 0 0 7.07 5.07"/></svg>,
  // Flaticon-style Football (Soccer)
  <svg key="ftb" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 7.5L8.5 10 10 14h4l1.5-4L12 7.5z"/><path d="M12 2v5.5M5.5 5.5L8.5 10M18.5 5.5L15.5 10M2 12h6M22 12h-6M6.5 19.5L10 14M17.5 19.5L14 14"/></svg>,
  // Flaticon-style Trophy
  <svg key="trp" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M7 6H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1M17 6h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1"/></svg>
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

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    ScrollTrigger.refresh();

    // Hero Animations
    gsap.from('.hero-title-line', {
      y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.1
    });
    gsap.to('.mouse-wheel', {
      y: 8, opacity: 0, duration: 1.5, repeat: -1, ease: 'power1.inOut'
    });

    // Scroll Animations for features
    const features = gsap.utils.toArray('.feature-row');
    features.forEach((feature: any) => {
      gsap.from(feature, {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: feature,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Final CTA
    gsap.from('.final-cta-content', {
      opacity: 0,
      scale: 0.95,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.final-cta-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });

  }, { scope: containerRef });

  return (
    <div className="lp-container bg-[#FFFBF7] text-[#101828] min-h-screen font-sans overflow-clip -mt-[72px]" ref={containerRef}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        /* ─── CSS KEYFRAMES FOR FLOATING ICONS ─── */
        @keyframes floatY {
          0% { transform: translateY(10vh); opacity: 0; }
          10% { opacity: 0.06; }
          85% { opacity: 0.06; }
          100% { transform: translateY(-90vh); opacity: 0; }
        }
        @keyframes floatX {
          0%, 100% { transform: translateX(-20px) rotate(-15deg); }
          50% { transform: translateX(20px) rotate(15deg); }
        }
        @keyframes floatXMobile {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        @media (max-width: 768px) {
          .float-inner {
            animation: floatXMobile linear infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .float-wrapper { display: none !important; animation: none !important; }
        }

        /* ─── VERTICAL FEATURES ─── */
        .feature-row {
          padding: 6rem 2rem;
          position: relative;
        }
        .visual-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.08);
        }

        /* Final CTA */
        .cta-box {
          background: #1E5AA8; color: #FFF;
          padding: 6rem 3rem; border-radius: 40px;
          text-align: center; max-width: 900px; width: 100%;
          box-shadow: 0 32px 80px rgba(30,90,168,0.3);
          position: relative; overflow: hidden;
        }
      `}} />

      {/* ─── HERO ─── */}
      <section id="hero" className="hero-section min-h-[100svh] flex flex-col relative px-4 pt-32 pb-8">
        
        {/* Background Animation */}
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
                  className="float-inner"
                  style={{ 
                    width: item.size, 
                    height: item.size, 
                    animationDuration: `${item.duration * 0.6}s`,
                    animationDelay: `${item.delay}s`
                  }}
                >
                  {SPORT_ICONS[item.icon]}
                </div>
             </div>
           ))}
           {/* Gradients */}
           <div className="absolute w-[40vw] h-[40vw] bg-[#1E5AA8] rounded-full blur-[120px] opacity-[0.06] top-1/4 left-1/4" />
           <div className="absolute w-[30vw] h-[30vw] bg-[#101828] rounded-full blur-[120px] opacity-[0.06] bottom-1/4 right-1/4" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto z-10 relative mt-4 text-center">
          {/* Soft background glow to guarantee text readability */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-[#FFFBF7]/80 blur-[80px] rounded-full z-[-1]" />
          
          <div className="hero-title-line inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#1E5AA8] text-xs font-bold uppercase tracking-widest mb-8 border border-[#1E5AA8]/15 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1E5AA8] animate-pulse" />
            Nền tảng toàn diện tại Đà Nẵng
          </div>
          
          <h1 className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-black leading-[1.15] tracking-tight mb-8 text-[#101828] flex flex-wrap justify-center gap-x-3 md:gap-x-5">
            <span className="hero-title-line">Tìm Kiếm.</span>
            <span className="hero-title-line text-[#1E5AA8]">Kết Nối.</span>
            <span className="hero-title-line">Thi Đấu.</span>
          </h1>
          
          <p className="hero-title-line text-lg md:text-xl text-[#475467] max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
            Mạng lưới kết nối thể thao hàng đầu. Khám phá các giải đấu phù hợp, theo dõi lịch trình và nâng tầm kỹ năng của bạn.
          </p>
        </div>

        <div className="hero-scroll-indicator flex flex-col items-center gap-3 text-[#475467] z-10 mt-auto pt-8">
          <span className="text-xs font-bold uppercase tracking-widest">Cuộn để khám phá</span>
          <MouseIcon className="text-[#1E5AA8]" />
          <ArrowDownIcon className="text-[#1E5AA8] animate-bounce w-5 h-5 opacity-50 -mt-1" />
        </div>
      </section>

      {/* ─── RESTORED VERTICAL SCROLL FEATURES ─── */}
      <div id="features" className="max-w-[1200px] mx-auto overflow-hidden">
        
        {/* Feature 1 */}
        <section className="feature-row grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/5] w-full max-w-[460px] mx-auto lg:mx-0">
             <div className="visual-card-inner bg-[#F2F4F7]">
                <Image src="/feat-hub.png" fill className="object-cover" alt="Tournament Hub" priority />
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-[#1E5AA8] font-bold text-sm tracking-[0.15em] uppercase px-4 py-1.5 bg-[#1E5AA8]/10 rounded-full inline-block">
              Giải Đấu Tập Trung
            </span>
            <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] text-[#101828]">
              Mọi Giải Đấu,<br />Một Nền Tảng
            </h2>
            <p className="text-[#475467] text-lg leading-relaxed max-w-md">
              Truy cập thông tin chi tiết về mọi giải đấu đang diễn ra. Từ quy định, cơ cấu giải thưởng đến số lượng đăng ký — tất cả đều được cập nhật theo thời gian thực.
            </p>
          </div>
        </section>

        {/* Feature 2 */}
        <section className="feature-row grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-6 lg:pl-12">
            <span className="text-[#1E5AA8] font-bold text-sm tracking-[0.15em] uppercase px-4 py-1.5 bg-[#1E5AA8]/10 rounded-full inline-block">
              Tìm Kiếm Thông Minh
            </span>
            <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] text-[#101828]">
              Tìm Kiếm Nhanh Chóng,<br />Chính Xác
            </h2>
            <p className="text-[#475467] text-lg leading-relaxed max-w-md">
              Bộ lọc nâng cao cho phép bạn tìm kiếm theo khu vực, thời gian và trình độ. Tiết kiệm thời gian, tập trung hoàn toàn vào việc thi đấu.
            </p>
          </div>
          <div className="relative aspect-[4/5] w-full max-w-[460px] mx-auto lg:mx-0">
             <div className="visual-card-inner bg-[#F2F4F7]">
                <Image src="/feat-search.png" fill className="object-cover" alt="Smart Search" />
             </div>
          </div>
        </section>

        {/* Feature 3 */}
        <section className="feature-row grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/5] w-full max-w-[460px] mx-auto lg:mx-0">
             <div className="visual-card-inner bg-[#F2F4F7]">
                <Image src="/feat-notif.png" fill className="object-cover" alt="Push Notifications" />
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-[#1E5AA8] font-bold text-sm tracking-[0.15em] uppercase px-4 py-1.5 bg-[#1E5AA8]/10 rounded-full inline-block">
              Thông Báo Tức Thời
            </span>
            <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] text-[#101828]">
              Không Bỏ Lỡ<br />Bất Kỳ Cơ Hội Nào
            </h2>
            <p className="text-[#475467] text-lg leading-relaxed max-w-md">
              Nhận thông báo ngay lập tức khi có giải đấu mới phù hợp với hồ sơ của bạn. Cập nhật lịch thi đấu và kết quả tự động liên tục.
            </p>
          </div>
        </section>

      </div>

      {/* ─── FINAL CTA ─── */}
      <section className="final-cta-section py-24 px-6 flex justify-center items-center">
        <div className="final-cta-content cta-box">
          <div className="absolute inset-0 bg-[url('/hero-bright.png')] opacity-20 bg-cover bg-center mix-blend-overlay" />
          
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black leading-tight mb-6 relative z-10">
            Sẵn Sàng Để Bắt Đầu?
          </h2>
          <p className="text-lg md:text-xl font-medium text-white/90 mb-10 relative z-10">
            Tham gia mạng lưới thể thao phát triển nhanh nhất Đà Nẵng ngay hôm nay.
          </p>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-[#1E5AA8] px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
              Tạo Tài Khoản Miễn Phí
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
