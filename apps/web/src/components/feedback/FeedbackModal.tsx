'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { feedbacksApi } from '../../lib/feedbacks.api';
import { PlatformFeedback } from '@courtmate/shared';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (feedback: PlatformFeedback) => void;
}

const CATEGORIES = [
  'Ghép trận on-demand',
  'Giải đấu thể thao',
  'Đặt sân & CLB',
  'Trải nghiệm UI',
  'Cộng đồng thể thao',
  'Góp ý khác',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Cần cải thiện nhiều',
  2: 'Tạm được',
  3: 'Hài lòng',
  4: 'Rất tốt',
  5: 'Tuyệt vời, trên cả mong đợi!',
};

export function FeedbackModal({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('Trải nghiệm UI');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-fill user name if logged in
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setErrorMsg('Vui lòng nhập cảm nhận chi tiết hơn (ít nhất 10 ký tự)');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await feedbacksApi.submitFeedback({
        userName: userName.trim(),
        userEmail: user?.email,
        userAvatar: user?.avatarUrl,
        userRole: userRole.trim() || 'Người chơi thể thao Đà Nẵng',
        rating,
        comment: comment.trim(),
        category,
      });

      setIsSubmitted(true);

      if (onSuccess) {
        onSuccess(created);
      }

      setTimeout(() => {
        setIsSubmitted(false);
        setComment('');
        setUserRole('');
        onClose();
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi gửi đánh giá, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top header bar */}
        <div className="shrink-0 bg-gradient-to-r from-[#1E5AA8] to-[#154687] text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-full bg-white/20 text-white inline-flex">
              <Sparkles size={16} />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-white/80">
              CourtMate Voice
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Đánh Giá Trải Nghiệm Của Bạn
          </h3>
          <p className="text-white/85 text-xs sm:text-sm mt-1">
            Góp ý của bạn là động lực giúp CourtMate hoàn thiện nền tảng mỗi ngày.
          </p>
        </div>

        <div className="overflow-y-auto">
          {isSubmitted ? (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-xl font-bold text-[#101828]">
                Gửi Đánh Giá Thành Công!
              </h4>
              <p className="text-[#475467] text-sm max-w-xs">
                Cảm ơn đóng góp của bạn. Đánh giá của bạn đã được cập nhật trực tiếp vào hệ thống.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Rating Stars */}
              <div className="flex flex-col items-center justify-center py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
                  Mức độ hài lòng của bạn
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={`${
                            active
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-300'
                          } transition-colors`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-amber-600 mt-2">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-xs font-bold text-[#344054] uppercase tracking-wider mb-2">
                  Chủ đề góp ý
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        category === cat
                          ? 'bg-[#1E5AA8] text-white shadow-sm'
                          : 'bg-slate-100 text-[#475467] hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344054] uppercase tracking-wider mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/30 focus:border-[#1E5AA8] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] uppercase tracking-wider mb-1">
                    Môn thể thao / Vai trò
                  </label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="Ví dụ: Pickleball Sơn Trà"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/30 focus:border-[#1E5AA8] transition-all"
                  />
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-bold text-[#344054] uppercase tracking-wider mb-1">
                  Nội dung cảm nhận <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Chia sẻ trải nghiệm của bạn khi ghép trận, tìm đối thủ, đặt sân hoặc tham gia giải đấu trên CourtMate..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/30 focus:border-[#1E5AA8] transition-all resize-none"
                  required
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3 pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-[#475467] hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Đang gửi...</span>
                  ) : (
                    <>
                      <span>Gửi Đánh Giá</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
