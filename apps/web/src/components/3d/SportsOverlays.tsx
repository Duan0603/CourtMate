'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SportsOverlays.module.css';
import { useLoading } from '../../context/LoadingContext';

export interface SportsOverlaysProps {
  isAuthenticated: boolean;
  staticLayout?: boolean;
}

interface FeatureCardConfig {
  id: string;
  containerClass: string;
  title: string[];
  description: string;
}

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    id: 'feature-01',
    containerClass: styles.featureRight,
    title: ['Mọi Giải Đấu,', 'Một Nền Tảng'],
    description:
      'Khám phá hàng trăm giải đấu cầu lông & pickleball tại Đà Nẵng. Theo dõi bảng đấu, tỉ số và bảng xếp hạng tức thì theo thời gian thực.',
  },
  {
    id: 'feature-02',
    containerClass: styles.featureLeft,
    title: ['Tìm Kiếm Nhanh Chóng,', 'Chính Xác'],
    description:
      'Bộ lọc nâng cao cho phép bạn tìm kiếm theo khu vực, thời gian và trình độ. Tiết kiệm thời gian, tập trung thi đấu hết mình.',
  },
  {
    id: 'feature-03',
    containerClass: styles.featureCenter,
    title: ['Không Bỏ Lỡ', 'Bất Kỳ Cơ Hội Nào'],
    description:
      'Nhận thông báo ngay lập tức khi có giải đấu mới phù hợp với hồ sơ của bạn. Cập nhật lịch thi đấu tự động và ghép cặp on-demand.',
  },
];

export function SportsOverlays({ isAuthenticated, staticLayout = false }: SportsOverlaysProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { startNavigation } = useLoading();

  // CTA Click: Use smart navigation loader
  const handleCtaClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const targetUrl = isAuthenticated ? '/tournaments' : '/register';
    startNavigation(targetUrl);
    router.push(targetUrl);
  };

  if (staticLayout) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        {FEATURE_CARDS.map(card => (
          <article key={card.id} className="py-6">
            <h2 className="text-2xl font-bold text-primary mb-3">{card.title.join(' ')}</h2>
            <p className="text-muted leading-relaxed">{card.description}</p>
          </article>
        ))}
        <div className="rounded-feature bg-primary p-8 text-white shadow-card">
          <h2 className="text-2xl font-bold mb-4">Sẵn sàng ra sân?</h2>
          <button onClick={handleCtaClick} disabled={isTransitioning} className="cm-button bg-white text-primary px-6 py-3 font-bold">
            {isAuthenticated ? 'Xem giải đấu' : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ─── INTRO TEXT ("Sẵn Sàng Trải Nghiệm?") ─── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <h2
          className="intro-text text-5xl md:text-7xl font-black opacity-0 scale-90 text-center -translate-y-28 transition-transform"
          style={{
            color: '#111111',
            textShadow: 'none',
          }}
        >
          Sẵn Sàng
          <br />
          <span className="text-primary">Trải Nghiệm?</span>
        </h2>
      </div>

      {/* ─── FEATURE CARDS 01, 02, 03 ─── */}
      {FEATURE_CARDS.map((card) => (
        <div
          key={card.id}
          className={`${styles.featureAnchor} ${card.containerClass}`}
        >
          <div id={card.id} className="relative bg-surface p-6 md:p-8 rounded-feature shadow-card opacity-0">

            <h2 className="feature-heading text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-[1.2] text-primary relative z-10 mb-4">
              {card.title.join(' ')}
            </h2>
            <p className="feature-para text-base md:text-lg text-[#3f3f3f] font-medium relative z-10 leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>
      ))}

      {/* Position belongs to the anchor; GSAP animates only the card inside. */}
      <div className={styles.ctaAnchor} data-story-cta-anchor>
        <div className={`story-cta ${styles.ctaCard}`}>
          <h2>Sẵn sàng ra sân?</h2>
          <button onClick={handleCtaClick} disabled={isTransitioning} className={styles.ctaButton}>
            {isAuthenticated ? 'Xem giải đấu' : 'Tạo tài khoản'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* ─── SCROLL INDICATOR ─── */}
      <div className="story-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center z-40 opacity-0 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center animate-bounce border border-ink">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1848FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>

    </>
  );
}

export default SportsOverlays;
