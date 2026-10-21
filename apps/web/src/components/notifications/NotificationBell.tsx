'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Trophy,
  UserCheck,
  BookOpen,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useNotifications } from './useNotifications';

export function NotificationBell({
  isMobile = false,
  isTransparent = false,
}: {
  isMobile?: boolean;
  isTransparent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    deleteOne,
    deleteAll,
  } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = async (notification: (typeof notifications)[0]) => {
    if (!notification.read) {
      await markRead(notification.id);
    }
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'FAVORITE_COACH':
      case 'COACH_FAVORITE':
        return <UserCheck className="w-4 h-4 text-primary" />;
      case 'FAVORITE_COURSE':
      case 'COURSE_FAVORITE':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'FAVORITE_TOURNAMENT':
      case 'TOURNAMENT_FAVORITE':
      case 'TOURNAMENT_NEW':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      default:
        return <Heart className="w-4 h-4 text-rose-500" />;
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
    <div className="relative flex items-center justify-center" ref={ref}>
      <button
        onClick={() => {
          setOpen(!open);
        }}
        className={`cm-button relative flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
          isTransparent
            ? `hover:bg-white/15 ${open ? 'bg-white/20' : ''}`
            : `hover:bg-[#1E5AA8]/10 ${open ? 'bg-[#1E5AA8]/10' : ''}`
        }`}
        aria-label="Thông báo"
        title="Thông báo"
      >
        <Bell
          className={`w-5 h-5 transition-colors duration-300 ${
            isTransparent ? 'text-white' : 'text-[#1E5AA8]'
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-fadeIn">
          {/* Header with Title and Action Icons */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {/* Action Icons: Đọc tất cả (CheckCheck) & Xóa tất cả (Trash2) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllRead}
                disabled={notifications.length === 0 || unreadCount === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-white transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed group"
                title="Đọc tất cả"
                aria-label="Đọc tất cả"
              >
                <CheckCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>

              <button
                type="button"
                onClick={deleteAll}
                disabled={notifications.length === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed group"
                title="Xóa tất cả"
                aria-label="Xóa tất cả"
              >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">Chưa có thông báo nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Các thông tin yêu thích khóa học, HLV, giải đấu sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50/80 cursor-pointer group relative ${
                    !n.read ? 'bg-primary/[0.04]' : ''
                  }`}
                >
                  {/* Category icon avatar */}
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      !n.read ? 'bg-white shadow-xs border border-slate-100' : 'bg-slate-100/70'
                    }`}
                  >
                    {getItemIcon(n.type)}
                  </div>

                  {/* Body content */}
                  <div className="flex-1 min-w-0 pr-6">
                    {n.title && (
                      <p
                        className={`text-xs font-bold leading-snug truncate ${
                          !n.read ? 'text-[#1E5AA8]' : 'text-slate-700'
                        }`}
                      >
                        {n.title}
                      </p>
                    )}
                    <p
                      className={`text-xs leading-relaxed mt-0.5 ${
                        !n.read ? 'text-slate-800 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {n.body}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.createdAt)}</p>
                  </div>

                  {/* Single Delete Icon (visible on hover) & Unread Dot */}
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOne(n.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 rounded-md transition-all"
                      title="Xóa thông báo"
                      aria-label="Xóa thông báo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
