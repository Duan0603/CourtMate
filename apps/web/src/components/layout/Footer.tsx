import React from 'react';
import Link from 'next/link';
import { PageContainer } from './PageContainer';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer border-t border-ink bg-white py-8 mt-auto">
      <PageContainer className="flex flex-col md:flex-row justify-between items-start gap-6 text-sm text-muted">
        <div className="flex items-center gap-2">
          <img src="/courtMate_logo.png" alt="CourtMate" className="h-7 w-auto" />
          <span className="font-black text-ink text-base tracking-tight">
            Court<span className="text-primary">Mate</span>
          </span>
          <span className="text-muted text-xs ml-2 hidden sm:inline">
            © 2026 CourtMate
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold">
          <Link href="/tournaments" className="hover:text-primary transition-colors">
            Giải đấu
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            Về chúng tôi
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Điều khoản sử dụng
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Chính sách bảo mật
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
};
