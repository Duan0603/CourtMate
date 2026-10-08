'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import { PlatformFeedback } from '@courtmate/shared';

interface FeedbackCardProps {
  feedback: PlatformFeedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const [imgError, setImgError] = useState(false);

  // Format relative time in Vietnamese
  const timeAgo = React.useMemo(() => {
    if (!feedback.createdAt) return 'Gần đây';
    const date = new Date(feedback.createdAt);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  }, [feedback.createdAt]);

  const initials = (feedback.userName || 'CM')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="feedback-card group w-[340px] md:w-[400px] shrink-0 p-6 rounded-[24px] bg-white border border-[#1E5AA8]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_45px_rgba(30,90,168,0.12)] hover:border-[#1E5AA8]/35 transition-all duration-300 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer">
      {/* Soft gradient accent highlight on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1E5AA8]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Decorative quote icon background */}
      <div className="absolute top-4 right-4 text-[#1E5AA8]/5 group-hover:text-[#1E5AA8]/10 transition-colors pointer-events-none">
        <Quote size={40} />
      </div>

      <div>
        {/* Top bar: Stars & Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => {
              const rating = typeof feedback.rating === 'number' ? feedback.rating : 5;
              const isFilled = i < rating;
              return (
                <Star
                  key={i}
                  className={`w-4 h-4 transition-colors ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.4)]'
                      : 'fill-slate-100 text-slate-300'
                  }`}
                />
              );
            })}
            <span className="ml-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
              {(typeof feedback.rating === 'number' ? feedback.rating : 5).toFixed(1)}
            </span>
          </div>

          {feedback.category && (
            <span className="text-[11px] font-semibold text-[#1E5AA8] bg-[#E8F1FA] px-2.5 py-0.5 rounded-full">
              {feedback.category}
            </span>
          )}
        </div>

        {/* Comment text */}
        <p className="text-[#344054] text-sm md:text-[15px] leading-relaxed font-normal mb-5 line-clamp-4 group-hover:text-[#101828] transition-colors">
          &ldquo;{feedback.comment}&rdquo;
        </p>
      </div>

      {/* User profile footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {feedback.userAvatar && !imgError ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-100">
              <Image
                src={feedback.userAvatar}
                alt={feedback.userName}
                fill
                sizes="40px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1E5AA8] to-[#3B82F6] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-[#101828] truncate">
                {feedback.userName}
              </h4>
              {feedback.isVerified !== false && (
                <span title="Đã xác thực" className="inline-flex items-center">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500 shrink-0"
                  />
                </span>
              )}
            </div>
            {feedback.userRole && (
              <p className="text-xs text-[#667085] truncate font-medium max-w-[200px]">
                {feedback.userRole}
              </p>
            )}
          </div>
        </div>

        <span className="text-[11px] text-[#98A2B3] shrink-0 font-medium">
          {timeAgo}
        </span>
      </div>
    </div>
  );
}
