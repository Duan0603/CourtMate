import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 px-6 md:px-12 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#475467]">
        <div className="flex items-center gap-2">
          <img src="/courtMate_logo.png" alt="CourtMate" className="h-7 w-auto" />
          <span className="font-black text-[#101828] text-base tracking-tight">
            Court<span className="text-[#1E5AA8]">Mate</span>
          </span>
          <span className="text-slate-400 text-xs ml-2 hidden sm:inline">
            © 2026. Nền tảng kết nối thể thao hàng đầu.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold">
          <Link href="/tournaments" className="hover:text-[#1E5AA8] transition-colors">
            Giải đấu
          </Link>
          <Link href="/about" className="hover:text-[#1E5AA8] transition-colors">
            Về chúng tôi
          </Link>
          <Link href="#" className="hover:text-[#1E5AA8] transition-colors">
            Điều khoản sử dụng
          </Link>
          <Link href="#" className="hover:text-[#1E5AA8] transition-colors">
            Chính sách bảo mật
          </Link>
        </div>
      </div>
    </footer>
  );
};
