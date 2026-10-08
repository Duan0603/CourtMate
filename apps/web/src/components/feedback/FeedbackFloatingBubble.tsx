'use client';

import React, { useState } from 'react';
import { MessageSquareHeart, Star } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { PlatformFeedback } from '@courtmate/shared';

interface FeedbackFloatingBubbleProps {
  onFeedbackAdded?: (feedback: PlatformFeedback) => void;
}

export function FeedbackFloatingBubble({ onFeedbackAdded }: FeedbackFloatingBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Action Bubble */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
        {/* Floating Tooltip / Chip on Hover */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 pointer-events-none ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Góp ý & Đánh giá</span>
        </div>

        {/* Bubble Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Mở bảng đánh giá và phản hồi hệ thống"
          className="relative flex items-center justify-center h-14 px-4 md:px-5 rounded-full bg-gradient-to-r from-[#1E5AA8] to-[#154687] text-white shadow-[0_10px_25px_rgba(30,90,168,0.4)] hover:shadow-[0_16px_35px_rgba(30,90,168,0.6)] border-2 border-white/30 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#1E5AA8]/30"
        >
          {/* Subtle radar / ping wave effect */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white" />
          </span>

          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline-block font-bold text-sm tracking-wide">
              Đánh giá
            </span>
          </div>
        </button>
      </div>

      {/* Feedback Submission Modal */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(newFeedback) => {
          if (onFeedbackAdded) {
            onFeedbackAdded(newFeedback);
          }
          // Dispatch window event so any carousel on page immediately updates!
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('courtmate:feedback-added', { detail: newFeedback })
            );
          }
        }}
      />
    </>
  );
}
