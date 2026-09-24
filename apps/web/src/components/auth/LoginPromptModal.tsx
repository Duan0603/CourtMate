'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Lock, X, ArrowRight } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  title = 'Đăng nhập để tiếp tục',
  description = 'Bạn cần có tài khoản CourtMate để xem chi tiết giải đấu và thực hiện thao tác này.',
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101828]/50 backdrop-blur-sm z-[100] flex items-center justify-center px-4"
        onClick={onClose}
      >
        {/* Modal Card */}
        <div
          className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.20)] animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#1E5AA8] flex items-center justify-center shadow-lg shadow-[#1E5AA8]/30">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white">
                <Lock className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-7">
            <h2 className="text-xl font-black text-[#101828] mb-2">{title}</h2>
            <p className="text-sm text-[#475467] font-medium leading-relaxed">{description}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white font-bold text-sm text-center transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg hover:shadow-[#1E5AA8]/25 flex items-center justify-center gap-2"
            >
              <span>Đăng Nhập Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register"
              className="w-full py-3.5 rounded-full border border-[#1E5AA8]/30 bg-[#1E5AA8]/5 text-[#1E5AA8] hover:bg-[#1E5AA8]/10 font-bold text-sm text-center transition-all"
            >
              Tạo Tài Khoản Miễn Phí
            </Link>

            <button
              onClick={onClose}
              className="text-xs text-[#475467] font-medium hover:text-[#101828] transition-colors py-1"
            >
              Tiếp tục xem mà không đăng nhập
            </button>
          </div>

          {/* Social proof note */}
          <p className="text-center text-[10px] text-slate-400 font-medium mt-4">
            Hơn <strong className="text-[#101828]">1,200+</strong> vận động viên đã tham gia CourtMate tại Đà Nẵng
          </p>
        </div>
      </div>
    </>
  );
};
