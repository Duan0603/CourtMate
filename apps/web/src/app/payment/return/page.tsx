'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Ticket, Home, AlertCircle } from 'lucide-react';

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const tournamentId = searchParams.get('tournamentId');
  const status = searchParams.get('status') || 'PAID';
  const amount = searchParams.get('amount');

  if (!orderId && !tournamentId) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-navy">Không tìm thấy thông tin thanh toán</h1>
          <p className="text-xs text-slate-500">
            Trang này chỉ hiển thị kết quả sau khi bạn hoàn tất thanh toán từ cổng VietQR / PayOS.
          </p>
          <Link
            href="/tournaments"
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ giải đấu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
        
        {/* Animated Check Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            Thanh Toán Thành Công!
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Hồ sơ đăng ký giải đấu của bạn đã được ghi nhận vào hệ thống giải đấu.
          </p>
        </div>

        {/* Transaction Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-left">
          {orderId && (
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-navy">{orderId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Số tiền:</span>
              <strong className="text-navy">{amount}</strong>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Trạng thái:</span>
            <span className="text-emerald-600 font-semibold">
              {status === 'PAID' ? 'ĐÃ THANH TOÁN (PAID)' : status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {tournamentId && (
            <Link
              href={`/ticket/${tournamentId}`}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <Ticket className="w-4 h-4" />
              <span>Xem vé điện tử QR</span>
            </Link>
          )}

          <Link
            href="/tournaments"
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ giải đấu</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Đang tải trạng thái thanh toán...</div>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
