'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthCard } from '../../components/auth/AuthCard';
import { CursorBackground } from '../../components/layout/CursorBackground';

export default function LoginPage() {
  return (
    <div className="min-h-[100svh] bg-[#FFFBF7] text-[#101828] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Nút Quay lại - Góc trái trên cùng */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/"
          className="group flex items-center justify-center w-12 h-12 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-sm hover:shadow-md border border-slate-200 transition-all overflow-hidden hover:w-[130px] duration-300 ease-out"
        >
          <ArrowLeft className="w-5 h-5 text-[#475467] group-hover:text-[#101828] shrink-0" />
          <span className="max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap text-sm font-bold text-[#101828] ml-0 group-hover:ml-2">
            Quay lại
          </span>
        </Link>
      </div>
      {/* Interactive Cursor Tracking Background */}
      <CursorBackground />

      <div className="w-full relative z-10">
        <AuthCard initialMode="login" />
      </div>
    </div>
  );
}
