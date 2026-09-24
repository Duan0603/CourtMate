'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useNotifications } from './useNotifications';

export function NotificationBell({ isMobile = false }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = async (notification: typeof notifications[0]) => {
    if (!notification.read) {
      await markRead(notification.id);
    }
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs} giờ trước`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-full transition-all hover:bg-[#1E5AA8]/10 ${open ? 'bg-[#1E5AA8]/10' : ''}`}
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5 text-[#475467]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-200/80 z-50 overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-black text-[#101828]">Thông báo</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-[#1E5AA8] hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Không có thông báo mới
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                    !n.read ? 'bg-[#1E5AA8]/[0.04]' : ''
                  }`}
                >
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      !n.read ? 'bg-[#1E5AA8]' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.read ? 'text-[#101828] font-semibold' : 'text-slate-500 font-medium'}`}>
                      {n.body}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5">
            <button className="text-xs font-semibold text-[#1E5AA8] hover:underline w-full text-center">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
