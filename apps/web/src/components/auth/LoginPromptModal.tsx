'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from 'antd';
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
    <Modal open={isOpen} onCancel={onClose} footer={null} closable={false} centered width={400}
      aria-label={title} styles={{ content: { padding: 0, borderRadius: 'var(--cm-radius-feature)' } }}>
        {/* Modal Card */}
        <div
          className="relative bg-white rounded-feature p-8 w-full animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="cm-button absolute top-5 right-5 p-1.5 rounded-full text-muted hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg ">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white">
                <Lock className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-7">
            <h2 className="text-xl font-black text-ink mb-2">{title}</h2>
            <p className="text-sm text-muted font-medium leading-relaxed">{description}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="cm-action w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm text-center transition-all shadow-interactive flex items-center justify-center gap-2"
            >
              <span>Đăng Nhập Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register"
              className="w-full py-3.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 font-bold text-sm text-center transition-all"
            >
              Tạo Tài Khoản Miễn Phí
            </Link>

            <button
              onClick={onClose}
              className="cm-button text-xs text-muted font-medium hover:text-ink transition-colors py-1"
            >
              Tiếp tục xem mà không đăng nhập
            </button>
          </div>

          {/* Social proof note */}
          <p className="text-center text-[10px] text-muted font-medium mt-4">
            Hơn <strong className="text-ink">1,200+</strong> vận động viên đã tham gia CourtMate tại Đà Nẵng
          </p>
        </div>
    </Modal>
  );
};
