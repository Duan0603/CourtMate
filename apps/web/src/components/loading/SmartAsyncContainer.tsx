'use client';

import React from 'react';
import { ContentSkeleton } from './ContentSkeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface SmartAsyncContainerProps {
  /** If the asynchronous operation is in progress */
  loading: boolean;
  /** Whether loading duration has exceeded the smart threshold */
  isThresholdElapsed?: boolean;
  /** Custom fallback skeleton component to display during noticeable delay */
  skeleton?: React.ReactNode;
  /** If operation encountered an error */
  error?: Error | string | null;
  /** Callback to retry operation upon failure */
  onRetry?: () => void;
  /** Message explaining the error */
  errorMessage?: string;
  /** Content to display when loaded */
  children: React.ReactNode;
  /** Optional container CSS class */
  className?: string;
}

/**
 * SmartAsyncContainer:
 * Implements section 4 (Asynchronous Content Loading) of the loading threshold spec.
 * - Displays immediate content without layout flash if loading resolves quickly.
 * - Shows an elegant localized skeleton only when waiting time exceeds threshold.
 * - Provides graceful error and retry mechanisms to avoid infinite spinners.
 */
export function SmartAsyncContainer({
  loading,
  isThresholdElapsed = true,
  skeleton,
  error,
  onRetry,
  errorMessage,
  children,
  className = '',
}: SmartAsyncContainerProps) {
  if (error) {
    const errorText = typeof error === 'string' ? error : error?.message || errorMessage || 'Không thể tải dữ liệu.';
    return (
      <div className={`p-8 my-4 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col items-center justify-center text-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">Đã xảy ra sự cố</h4>
        <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
          {errorText}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E5AA8] text-white text-xs font-bold hover:bg-[#154687] shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại ngay</span>
          </button>
        )}
      </div>
    );
  }

  if (loading && isThresholdElapsed) {
    return (
      <div className={className} aria-busy="true">
        {skeleton || <ContentSkeleton />}
      </div>
    );
  }

  if (loading) return <div className={`min-h-64 ${className}`} aria-busy="true" aria-label="Đang tải nội dung" />;

  // Fast resolution or ready state
  return <div className={className}>{children}</div>;
}
