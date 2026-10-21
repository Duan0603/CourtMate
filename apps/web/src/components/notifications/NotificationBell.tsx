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
  MessageCircle,
  Info,
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
  const [error, setError] = useState('');
  const runAction = async (action: () => Promise<void>) => {
    setError('');
    try { await action(); return true; }
    catch { setError('Không thể lưu thay đổi. Vui lòng thử lại.'); return false; }
  };
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
      if (!await runAction(() => markRead(notification.id))) return;
    }
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE_RECEIVED': return <MessageCircle className="w-4 h-4 text-primary" />;
      case 'ACCOUNT_ACTIVITY':
      case 'COACH_ACTIVITY': return <Info className="w-4 h-4 text-primary" />;
      case 'FAVORITE_COACH':
      case 'COACH_FAVORITE':
        return <UserCheck className="w-4 h-4 text-primary" />;
      case 'FAVORITE_COURSE':
      case 'COURSE_FAVORITE':
        return <BookOpen className="w-4 h-4 text-primary" />;
      case 'FAVORITE_TOURNAMENT':
      case 'TOURNAMENT_FAVORITE':
      case 'TOURNAMENT_NEW':
        return <Trophy className="w-4 h-4 text-primary" />;
      default:
        return <Heart className="w-4 h-4 text-primary" />;
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
        className={`cm-button relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
          isTransparent
            ? `hover:bg-white/15 ${open ? 'bg-white/20' : ''}`
            : `hover:bg-accent-baby ${open ? 'bg-accent-baby' : ''}`
        }`}
        aria-expanded={open}
        aria-label="Thông báo"
        title="Thông báo"
      >
        <Bell
          className={`w-5 h-5 transition-colors duration-300 ${
            isTransparent ? 'text-white' : 'text-primary'
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(24rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-ink z-50 overflow-hidden animate-fadeIn">
          {/* Header with Title and Action Icons */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-ink">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-ink">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent-baby text-primary">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {/* Action Icons: Đọc tất cả (CheckCheck) & Xóa tất cả (Trash2) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void runAction(markAllRead)}
                disabled={notifications.length === 0 || unreadCount === 0}
                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-white transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed group"
                title="Đọc tất cả"
                aria-label="Đọc tất cả"
              >
                <CheckCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>

              <button
                type="button"
                onClick={() => void runAction(deleteAll)}
                disabled={notifications.length === 0}
                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-accent-tan transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed group"
                title="Xóa tất cả"
                aria-label="Xóa tất cả"
              >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>

          {error && <p role="alert" className="px-4 py-2 text-xs text-primary">{error}</p>}
          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-ink">
            {loading ? (
              <div className="py-10 text-center text-xs text-muted">
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <Sparkles className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-xs font-semibold text-muted">Chưa có thông báo nào</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Cập nhật tài khoản, giải đấu, lịch học và tin nhắn sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white cursor-pointer group relative ${
                    !n.read ? 'bg-accent-baby' : ''
                  }`}
                >
                  {/* Category icon avatar */}
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      !n.read ? 'bg-white shadow-xs border border-ink' : 'bg-white'
                    }`}
                  >
                    {getItemIcon(n.type)}
                  </div>

                  {/* Body content */}
                  <div className="flex-1 min-w-0 pr-6">
                    {n.title && (
                      <p
                        className={`text-xs font-bold leading-snug truncate ${
                          !n.read ? 'text-primary' : 'text-muted'
                        }`}
                      >
                        {n.title}
                      </p>
                    )}
                    <p
                      className={`text-xs leading-relaxed mt-0.5 ${
                        !n.read ? 'text-ink font-medium' : 'text-muted'
                      }`}
                    >
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted mt-1">{formatTime(n.createdAt)}</p>
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
                        void runAction(() => deleteOne(n.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-primary hover:bg-white rounded-md transition-all"
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
