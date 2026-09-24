import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#101828]/10 py-10 px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#475467] bg-transparent">
      <p>© 2025 CourtMate. Phiên bản Thí điểm.</p>
      <div className="flex gap-8">
        <Link href="/tournaments" className="hover:text-[#101828] font-medium transition-colors">Giải đấu</Link>
        <Link href="#" className="hover:text-[#101828] font-medium transition-colors">Điều khoản</Link>
        <Link href="#" className="hover:text-[#101828] font-medium transition-colors">Liên hệ</Link>
      </div>
    </footer>
  );
};

