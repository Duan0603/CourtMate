'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Ticket, Home, AlertCircle, XCircle, RotateCcw } from 'lucide-react';
import { paymentsApi } from '../../../lib/payments.api';

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('orderCode');
  const tournamentId = searchParams.get('tournamentId');
  const amount = searchParams.get('amount');
  
  // MoMo query parameters
  const resultCode = searchParams.get('resultCode');
  const momoMessage = searchParams.get('message');
  
  // PayOS query parameters
  const code = searchParams.get('code');
  const cancel = searchParams.get('cancel');
  
  // General status
  const statusParam = searchParams.get('status');

  const [dbStatus, setDbStatus] = useState<string | null>(null);

  // Determine initial status based on query params
  let isCancelled = cancel === 'true' || resultCode === '1006' || statusParam === 'CANCELLED';
  let isSuccess = false;
  let statusDisplay = 'ĐANG XỬ LÝ (PENDING)';
  let messageDisplay = '';

  if (resultCode !== null) {
    // MoMo callback response
    if (resultCode === '0') {
      isSuccess = true;
      statusDisplay = 'ĐÃ THANH TOÁN (PAID)';
    } else if (resultCode === '1006') {
      isCancelled = true;
      statusDisplay = 'ĐÃ HỦY (CANCELLED)';
      messageDisplay = momoMessage || 'Giao dịch đã bị từ chối/hủy bởi người dùng.';
    } else {
      statusDisplay = 'THẤT BẠI (FAILED)';
      messageDisplay = momoMessage || 'Thanh toán MoMo không thành công.';
    }
  } else if (code !== null || cancel !== null) {
    // PayOS callback response
    if (cancel === 'true' || statusParam === 'CANCELLED') {
      isCancelled = true;
      statusDisplay = 'ĐÃ HỦY (CANCELLED)';
      messageDisplay = 'Bạn đã hủy yêu cầu thanh toán VietQR / PayOS.';
    } else if (code === '00' || statusParam === 'PAID') {
      isSuccess = true;
      statusDisplay = 'ĐÃ THANH TOÁN (PAID)';
    } else {
      statusDisplay = 'THẤT BẠI (FAILED)';
      messageDisplay = 'Giao dịch thanh toán PayOS không thành công.';
    }
  } else if (statusParam) {
    if (statusParam === 'PAID') {
      isSuccess = true;
      statusDisplay = 'ĐÃ THANH TOÁN (PAID)';
    } else if (statusParam === 'CANCELLED') {
      isCancelled = true;
      statusDisplay = 'ĐÃ HỦY (CANCELLED)';
      messageDisplay = 'Bạn đã hủy thanh toán.';
    } else {
      statusDisplay = statusParam;
      messageDisplay = 'Giao dịch không thành công.';
    }
  }

  // Double check with backend DB and sync cancel if needed
  useEffect(() => {
    async function syncPaymentStatus() {
      if (!orderId) return;
      try {
        if (isCancelled) {
          const res = await paymentsApi.cancel(orderId);
          if (res?.status) {
            setDbStatus(res.status);
          }
        } else {
          const res = await paymentsApi.status(orderId);
          if (res?.status) {
            setDbStatus(res.status);
          }
        }
      } catch {
        // If not logged in or cannot fetch, rely on query params
      }
    }
    syncPaymentStatus();
  }, [orderId, isCancelled]);

  if (dbStatus) {
    if (dbStatus === 'PAID') {
      isSuccess = true;
      isCancelled = false;
      statusDisplay = 'ĐÃ THANH TOÁN (PAID)';
    } else if (dbStatus === 'FAILED' || dbStatus === 'CANCELLED') {
      if (isCancelled || dbStatus === 'CANCELLED') {
        isCancelled = true;
        isSuccess = false;
        statusDisplay = 'ĐÃ HỦY (CANCELLED)';
      } else {
        isSuccess = false;
        statusDisplay = 'THẤT BẠI (FAILED)';
      }
    }
  }

  if (!orderId && !tournamentId && !statusParam && !resultCode && !code) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-navy">Không tìm thấy thông tin thanh toán</h1>
          <p className="text-xs text-slate-500">
            Trang này chỉ hiển thị kết quả sau khi bạn thực hiện giao dịch từ cổng thanh toán.
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
        
        {/* Status Icon */}
        {isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        ) : isCancelled ? (
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <XCircle className="w-10 h-10" />
          </div>
        )}

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            {isSuccess
              ? 'Thanh Toán Thành Công!'
              : isCancelled
              ? 'Thanh Toán Đã Bị Hủy'
              : 'Thanh Toán Thất Bại'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isSuccess
              ? 'Hồ sơ đăng ký giải đấu của bạn đã được ghi nhận vào hệ thống giải đấu.'
              : messageDisplay || (isCancelled
                ? 'Bạn đã hủy giao dịch thanh toán. Bạn có thể thực hiện lại bất kỳ lúc nào.'
                : 'Đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng thử lại.')}
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
              <strong className="text-navy">{Number(amount).toLocaleString('vi-VN')} đ</strong>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Trạng thái:</span>
            <span className={`font-semibold ${
              isSuccess 
                ? 'text-emerald-600' 
                : isCancelled 
                ? 'text-amber-600' 
                : 'text-rose-600'
            }`}>
              {statusDisplay}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isSuccess && tournamentId && (
            <Link
              href={`/ticket/${tournamentId}`}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <Ticket className="w-4 h-4" />
              <span>Xem vé điện tử QR</span>
            </Link>
          )}

          {!isSuccess && (
            <Link
              href={tournamentId ? `/tournaments/${tournamentId}/register` : '/tournaments'}
              className="w-full py-3.5 rounded-xl bg-court-orange hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử thanh toán lại</span>
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
