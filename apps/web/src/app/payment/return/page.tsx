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
      statusDisplay = 'Đã thanh toán';
    } else if (resultCode === '1006') {
      isCancelled = true;
      statusDisplay = 'Đã hủy';
      messageDisplay = momoMessage || 'Giao dịch đã bị từ chối/hủy bởi người dùng.';
    } else {
      statusDisplay = 'Thất bại';
      messageDisplay = momoMessage || 'Thanh toán MoMo không thành công.';
    }
  } else if (code !== null || cancel !== null) {
    // PayOS callback response
    if (cancel === 'true' || statusParam === 'CANCELLED') {
      isCancelled = true;
      statusDisplay = 'Đã hủy';
      messageDisplay = 'Bạn đã hủy yêu cầu thanh toán VietQR / PayOS.';
    } else if (code === '00' || statusParam === 'PAID') {
      isSuccess = true;
      statusDisplay = 'Đã thanh toán';
    } else {
      statusDisplay = 'Thất bại';
      messageDisplay = 'Giao dịch thanh toán PayOS không thành công.';
    }
  } else if (statusParam) {
    if (statusParam === 'PAID') {
      isSuccess = true;
      statusDisplay = 'Đã thanh toán';
    } else if (statusParam === 'CANCELLED') {
      isCancelled = true;
      statusDisplay = 'Đã hủy';
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
      statusDisplay = 'Đã thanh toán';
    } else if (dbStatus === 'FAILED' || dbStatus === 'CANCELLED') {
      if (isCancelled || dbStatus === 'CANCELLED') {
        isCancelled = true;
        isSuccess = false;
        statusDisplay = 'Đã hủy';
      } else {
        isSuccess = false;
        statusDisplay = 'Thất bại';
      }
    }
  }

  if (!orderId && !tournamentId && !statusParam && !resultCode && !code) {
    return (
      <div className="bg-canvas min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto bg-surface shadow-card rounded-3xl border border-slate-200/80 p-8  text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-muted flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-navy">Không tìm thấy thông tin thanh toán</h1>
          <p className="text-sm text-slate-500">
            Chưa có giao dịch để hiển thị.
          </p>
          <Link
            href="/tournaments"
            className="cm-action w-full py-3 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Xem giải đấu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-20 px-4">
      <div className="max-w-md mx-auto bg-surface shadow-card rounded-3xl border border-slate-200/80 p-8  text-center space-y-6">

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
              ? 'Thanh toán thành công'
              : isCancelled
              ? 'Đã hủy thanh toán'
              : 'Thanh toán chưa thành công'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isSuccess
              ? 'Đăng ký của bạn đã được ghi nhận.'
              : messageDisplay || (isCancelled
                ? 'Bạn đã hủy giao dịch thanh toán. Bạn có thể thực hiện lại bất kỳ lúc nào.'
                : 'Đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng thử lại.')}
          </p>
        </div>

        {/* Transaction Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-left">
          {orderId && (
            <div className="flex justify-between py-1">
              <span className="text-muted">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-navy">{orderId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between py-1">
              <span className="text-muted">Số tiền:</span>
              <strong className="text-navy">{Number(amount).toLocaleString('vi-VN')} đ</strong>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-muted">Trạng thái:</span>
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
              className="cm-action w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <Ticket className="w-4 h-4" />
              <span>Xem vé QR</span>
            </Link>
          )}

          {!isSuccess && (
            <Link
              href={tournamentId ? `/tournaments/${tournamentId}/register` : '/tournaments'}
              className="cm-action w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thanh toán lại</span>
            </Link>
          )}

          <Link
            href="/tournaments"
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Xem giải đấu</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Đang tải trạng thái thanh toán...</div>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
