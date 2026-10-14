'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GuestActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectUrl?: string;
}

export const GuestActionModal: React.FC<GuestActionModalProps> = ({
  isOpen,
  onClose,
  title = 'Yêu cầu đăng nhập tài khoản',
  description = 'Tài khoản Khách chỉ có quyền xem danh sách và tìm kiếm. Để xem chi tiết hồ sơ, đặt lịch hoặc thực hiện các thao tác chuyên sâu, vui lòng đăng nhập vào CourtMate.',
  redirectUrl = '/login',
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose();
    router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const handleRegisterClick = () => {
    onClose();
    router.push(`/register?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 animate-fadeIn">
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 uppercase tracking-wide inline-block mb-3">
          Giới hạn quyền Khách (Guest)
        </span>

        <h3 className="text-lg sm:text-xl font-black text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>

        {/* Feature comparison / notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-slate-800">Quyền hạn của Khách:</div>
          <div>• Được phép: Xem giao diện tổng quan, tìm kiếm & lọc theo môn/khu vực.</div>
          <div className="text-rose-600 font-semibold">• Bị giới hạn: Không thể xem chi tiết hồ sơ HLV, không thể đặt lịch, không thể đăng ký hoặc gửi đánh giá.</div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleLoginClick}
            className="flex-1 py-2.5 px-4 bg-[#1E5AA8] text-white rounded-xl text-xs sm:text-sm font-bold text-center hover:bg-[#154687] transition-all shadow-sm cursor-pointer"
          >
            Đăng nhập ngay
          </button>
          <button
            type="button"
            onClick={handleRegisterClick}
            className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-800 rounded-xl text-xs sm:text-sm font-bold text-center hover:bg-slate-200 transition-all cursor-pointer"
          >
            Tạo tài khoản mới
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Tiếp tục xem trang công khai
          </button>
        </div>
      </div>
    </div>
  );
};
