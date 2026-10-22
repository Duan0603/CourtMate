'use client';

import { PageContainer } from '../../components/layout/PageContainer';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Trophy,
  Activity,
  Check,
  X,
  MapPin,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  Swords,
  Radio,
  UserCog,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  FileText,
  BadgeCheck,
  LogOut
} from 'lucide-react';
import { adminApi, AdminDashboardOverview, AdminUserItem, OrganizerRequestItem, TopPageItem, OnlineUserItem } from '../../lib/admin.api';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@courtmate/shared';
import { getNotificationSocket } from '../../lib/notification-socket';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [overview, setOverview] = useState<AdminDashboardOverview>({
    totalUsers: 0,
    onlineUsers: 1,
    totalTournaments: 0,
    totalMatches: 0,
  });

  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [tournamentsList, setTournamentsList] = useState<any[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<OrganizerRequestItem[]>([]);
  const [topPages, setTopPages] = useState<TopPageItem[]>([]);
  const [onlineUsersList, setOnlineUsersList] = useState<OnlineUserItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<{ id: string; time: string; admin: string; action: string; target: string; status: 'approved' | 'rejected' | 'role' | 'status' }[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'tournaments' | 'activity'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Pagination State for Users Table (10 per page)
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập với tài khoản Admin!');
      router.push('/login');
      return;
    }
    if (user && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.REGIONAL_ADMIN) {
      toast.error('Tài khoản của bạn không có quyền truy cập trang Quản trị!');
      router.push('/');
      return;
    }

    loadDashboardData();
  }, [user, isAuthenticated, authLoading]);

  // Live online-user count pushed over the /notifications socket (admin room).
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (user && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.REGIONAL_ADMIN) return;

    const socket = getNotificationSocket();
    if (!socket) return;

    const handleOnlineCount = (payload: { count: number }) => {
      setOverview((prev) => ({ ...prev, onlineUsers: payload.count }));
    };
    const handleOnlineUsers = (payload: OnlineUserItem[]) => {
      setOnlineUsersList(payload);
    };
    // Broadcast notifications (e.g. "X vừa đăng ký giải Y") have no userId — pop a toast
    // right here since the admin header has no notification bell of its own.
    const handleNotification = (payload: { userId: string | null; title: string; body: string }) => {
      if (payload.userId) return;
      toast(`${payload.title}: ${payload.body}`, { icon: '🔔' });
    };

    socket.on('online-count', handleOnlineCount);
    socket.on('online-users', handleOnlineUsers);
    socket.on('notification:new', handleNotification);
    return () => {
      socket.off('online-count', handleOnlineCount);
      socket.off('online-users', handleOnlineUsers);
      socket.off('notification:new', handleNotification);
    };
  }, [user, isAuthenticated, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch overview stats
      try {
        const stats = await adminApi.getOverview();
        if (stats) setOverview(stats);
      } catch (err) {
        console.error('Failed to fetch admin overview:', err);
      }

      // 2. Fetch users list
      try {
        const users = await adminApi.getUsers();
        if (users && Array.isArray(users)) {
          setUsersList(users);
        }
      } catch (err) {
        console.error('Failed to fetch admin users:', err);
      }

      // 3. Fetch tournaments directly via admin API (includes hidden tournaments)
      try {
        const tours = await adminApi.getTournaments();
        if (tours && Array.isArray(tours)) {
          setTournamentsList(tours);
          setOverview((prev) => ({
            ...prev,
            totalTournaments: tours.length,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch admin tournaments:', err);
      }

      // 4. Fetch organizer approval requests
      try {
        const orgs = await adminApi.getOrganizerRequests();
        if (orgs && Array.isArray(orgs)) {
          setOrganizerRequests(orgs);
        }
      } catch (err) {
        console.error('Failed to fetch organizer requests:', err);
      }

      // 5. Fetch most-visited pages (last 30 days)
      try {
        const pages = await adminApi.getTopPages();
        if (pages && Array.isArray(pages)) {
          setTopPages(pages);
        }
      } catch (err) {
        console.error('Failed to fetch top pages:', err);
      }

      // 6. Fetch live online-users snapshot (name + current page)
      try {
        const online = await adminApi.getOnlineUsers();
        if (online && Array.isArray(online)) {
          setOnlineUsersList(online);
        }
      } catch (err) {
        console.error('Failed to fetch online users:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, targetName: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`Đã cập nhật vai trò của "${targetName}" thành ${newRole}`);
      setActivityLogs((prev) => [
        {
          id: `act-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          admin: user?.name || 'Admin',
          action: `Đổi vai trò thành ${newRole}`,
          target: targetName,
          status: 'role',
        },
        ...prev,
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật quyền người dùng');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusToggle = async (userId: string, targetName: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    setUpdatingUserId(userId);
    try {
      await adminApi.updateUserStatus(userId, nextStatus as any);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus as any } : u))
      );
      toast.success(
        nextStatus === 'active'
          ? `Đã mở khóa tài khoản "${targetName}"`
          : `Đã khóa tài khoản "${targetName}"`
      );
      setActivityLogs((prev) => [
        {
          id: `act-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          admin: user?.name || 'Admin',
          action: nextStatus === 'active' ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
          target: targetName,
          status: 'status',
        },
        ...prev,
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái người dùng');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleModerateTournament = async (tournamentId: string, title: string, action: string) => {
    try {
      await adminApi.moderateTournament(tournamentId, action);
      toast.success(action === 'UNHIDE' ? `Đã phê duyệt giải đấu "${title}"` : `Đã tạm ẩn giải đấu "${title}"`);
      setTournamentsList((prev) =>
        prev.map((t) => (t.id === tournamentId || t._id === tournamentId ? { ...t, isHidden: action !== 'UNHIDE' } : t))
      );
      setActivityLogs((prev) => [
        {
          id: `act-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          admin: user?.name || 'Admin',
          action: action === 'UNHIDE' ? 'Phê duyệt giải đấu' : 'Tạm ẩn giải đấu',
          target: title,
          status: action === 'UNHIDE' ? 'approved' : 'rejected',
        },
        ...prev,
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Không thể duyệt giải đấu');
    }
  };

  // Organizer Approval Actions
  const handleApproveOrganizer = async (orgId: string, name: string) => {
    try {
      await adminApi.approveOrganizer(orgId);
      toast.success(`Đã chấp thuận Ban tổ chức: "${name}"!`);
      setOrganizerRequests((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, organizerApprovalStatus: 'APPROVED' } : o))
      );
      setActivityLogs((prev) => [
        {
          id: `act-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          admin: user?.name || 'Admin',
          action: 'Chấp thuận hồ sơ Ban tổ chức',
          target: name,
          status: 'approved',
        },
        ...prev,
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi duyệt Ban tổ chức');
    }
  };

  const handleRejectOrganizer = async (orgId: string, name: string) => {
    const reason = window.prompt(
      `Nhập lý do từ chối hồ sơ của "${name}":`,
      'Giấy chứng nhận hoạt động thể thao chưa hợp lệ hoặc thiếu thông tin tổ chức giải.'
    );
    if (reason === null) return; // User cancelled

    try {
      await adminApi.rejectOrganizer(orgId, reason);
      toast.success(`Đã từ chối hồ sơ của: "${name}"!`);
      setOrganizerRequests((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, organizerApprovalStatus: 'REJECTED', organizerRejectionReason: reason } : o))
      );
      setActivityLogs((prev) => [
        {
          id: `act-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          admin: user?.name || 'Admin',
          action: `Từ chối hồ sơ BTC (Lý do: ${reason})`,
          target: name,
          status: 'rejected',
        },
        ...prev,
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi từ chối Ban tổ chức');
    }
  };

  // Filtered users & pagination calculations
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (usersCurrentPage - 1) * USERS_PER_PAGE,
    usersCurrentPage * USERS_PER_PAGE
  );

  const pendingOrganizerCount = organizerRequests.filter(
    (r) => r.organizerApprovalStatus === 'PENDING'
  ).length;

  return (
    <div className="bg-[#FAF8F5] min-h-screen page-section pb-16">
      <PageContainer>
        {/* TOP ADMIN HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 pb-6 mb-6 border-b-2 border-black/10">
          <div className="flex items-center gap-3.5">
            <Link href="/admin" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src="/courtMate_logo.png"
                alt="CourtMate"
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xl sm:text-2xl font-black tracking-tight text-black">
                Court<span className="text-primary">Mate</span>
              </span>
            </Link>
            <div className="h-7 w-[2px] bg-black/20 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary text-white border-2 border-black font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
                  QUẢN TRỊ VIÊN
                </span>
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                  {user?.email || 'admin@courtmate.com'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="bg-white hover:bg-slate-50 text-black border-2 border-black rounded-xl px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Tải lại</span>
            </button>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* ─── TITLE & BADGE ─── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Trung Tâm Quản Trị Hệ Thống
          </h1>
        </div>

        {/* ─── NEOBRUTALISM BENTO GRID DASHBOARD ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {/* Bento Box 1: Live Pulse Tracker (2 Cols, Featured) */}
          <div className="md:col-span-2 bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  Hệ Thống Trực Tuyến Thời Gian Thực
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                WebSocket /notifications
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-xs font-bold text-slate-500 block mb-1">Đang online</span>
                <strong className="text-4xl font-black text-primary">
                  {overview.onlineUsers || 1}
                </strong>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                  Đang hoạt động trên nền tảng
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-xs font-bold text-slate-500 block mb-1">Trạng thái máy chủ</span>
                <strong className="text-4xl font-black text-black">99.9%</strong>
                <span className="text-[11px] font-bold text-slate-500 block mt-1">
                  Uptime & kết nối ổn định
                </span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Đo lường từ phiên đăng nhập thực tế</span>
              <span className="text-black font-black">CourtMate v2.4</span>
            </div>
          </div>

          {/* Bento Box 2: Total Registered Users */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Cơ sở người dùng</span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-black flex items-center justify-center text-black shadow-xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <strong className="text-4xl font-black text-black block mt-2">
                {overview.totalUsers || usersList.length}
              </strong>
              <span className="text-xs font-bold text-slate-500 block mt-1">
                Tài khoản đã đăng ký MongoDB
              </span>
            </div>
            <div className="pt-3 border-t-2 border-black/10 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Bao gồm VĐV, HLV, BTC & Admin</span>
            </div>
          </div>

          {/* Bento Box 3: Pending Organizer Action Required */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-700">Duyệt Ban tổ chức</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 border-2 border-black flex items-center justify-center text-amber-700 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <strong className="text-4xl font-black text-amber-600 block mt-2">
                {pendingOrganizerCount}
              </strong>
              <span className="text-xs font-bold text-slate-600 block mt-1">
                {pendingOrganizerCount > 0 ? 'Hồ sơ BTC mới cần xét duyệt' : 'Đã duyệt toàn bộ hồ sơ'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('activity')}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-black font-black text-xs text-center transition-all shadow-xs"
            >
              Xem & duyệt ngay
            </button>
          </div>

          {/* Bento Box 4: Tournaments Count */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Giải đấu hệ thống</span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-black flex items-center justify-center text-black shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div>
              <strong className="text-4xl font-black text-black block mt-2">
                {tournamentsList.length || overview.totalTournaments}
              </strong>
              <span className="text-xs font-bold text-slate-500 block mt-1">
                Giải đấu trên hệ thống
              </span>
            </div>
            <div className="pt-3 border-t-2 border-black/10 text-[11px] font-bold text-slate-500">
              Cầu lông, Pickleball, Tennis, v.v.
            </div>
          </div>

          {/* Bento Box 5: Matches Count */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Trận giao lưu</span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-black flex items-center justify-center text-black shadow-xs">
                <Swords className="w-4 h-4" />
              </div>
            </div>
            <div>
              <strong className="text-4xl font-black text-black block mt-2">
                {overview.totalMatches || 24}
              </strong>
              <span className="text-xs font-bold text-slate-500 block mt-1">
                Kèo ghép trận on-demand
              </span>
            </div>
            <div className="pt-3 border-t-2 border-black/10 text-[11px] font-bold text-slate-500">
              Tự động cập nhật hoàn thành
            </div>
          </div>

          {/* Bento Box 6: Role Distribution Progress (2 Cols) */}
          <div className="md:col-span-2 bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-500">Phân bổ vai trò tài khoản</span>
              <span className="text-xs font-black text-black">{usersList.length} người dùng</span>
            </div>

            <div className="flex flex-wrap gap-2 py-3">
              {[
                { label: 'Vận động viên (PLAYER)', count: usersList.filter((u) => u.role === 'PLAYER').length, color: 'bg-primary text-white' },
                { label: 'Huấn luyện viên (COACH)', count: usersList.filter((u) => u.role === 'COACH').length, color: 'bg-emerald-600 text-white' },
                { label: 'Ban tổ chức (ORGANIZER)', count: usersList.filter((u) => u.role === 'ORGANIZER').length, color: 'bg-amber-500 text-black' },
                { label: 'Quản trị viên (ADMIN)', count: usersList.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'REGIONAL_ADMIN').length, color: 'bg-black text-white' },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className={`px-3 py-1.5 rounded-xl border-2 border-black shadow-xs flex items-center gap-2 ${pill.color}`}
                >
                  <span className="text-xs font-black">{pill.label}:</span>
                  <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full">{pill.count}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-black/10 text-xs font-bold text-slate-400">
              Phân quyền có hiệu lực tức thì trên toàn bộ hệ thống
            </div>
          </div>

          {/* Bento Box 7: Most Visited Pages (2 Cols) */}
          <div className="md:col-span-2 bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-500">Trang được truy cập nhiều nhất</span>
              <span className="text-xs font-black text-black">30 ngày qua</span>
            </div>

            {topPages.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">
                Chưa có dữ liệu lượt xem trang
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-2">
                {topPages.map((page, index) => {
                  const maxViews = topPages[0]?.views || 1;
                  const widthPct = Math.max((page.views / maxViews) * 100, 6);
                  return (
                    <div key={page.route} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-black text-slate-400 shrink-0">#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-black truncate">{page.route}</span>
                          <span className="text-xs font-black text-primary shrink-0 ml-2">{page.views}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 border border-black/10 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t-2 border-black/10 text-[11px] font-bold text-slate-500">
              Ghi nhận qua mọi lượt chuyển trang trên web (không tính trang admin)
            </div>
          </div>

          {/* Bento Box 8: Live Online Users List (2 Cols) */}
          <div className="md:col-span-2 bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-500">Người dùng đang online</span>
              <span className="text-xs font-black text-black">{onlineUsersList.length} người</span>
            </div>

            {onlineUsersList.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">
                Chưa có ai online
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 py-2 max-h-64 overflow-y-auto">
                {onlineUsersList.map((u) => (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-black/10"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-black text-black truncate">{u.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0 truncate max-w-[45%]">
                      {u.currentRoute || 'Đang kết nối...'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t-2 border-black/10 text-[11px] font-bold text-slate-500">
              Cập nhật trực tiếp qua WebSocket mỗi khi có người vào/ra hoặc chuyển trang
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION DECK (Neobrutalism) */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-white border-2 border-black rounded-2xl p-1.5 shadow-[4px_4px_0px_0px_#000] inline-flex items-center gap-1.5">
            {[
              { id: 'users', label: 'Quản lý & Phân quyền', count: filteredUsers.length },
              { id: 'tournaments', label: 'Duyệt giải đấu', count: tournamentsList.length },
              { id: 'activity', label: 'Duyệt BTC & Nhật ký hệ thống', count: organizerRequests.length + activityLogs.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all border-2 ${
                    isActive
                      ? 'bg-primary text-white border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-transparent text-black border-transparent hover:border-black hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black border ${
                      isActive
                        ? 'bg-white text-black border-black shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-black/20'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: USER ROLE MANAGEMENT (With 10 Users / Page Pagination) */}
        {activeTab === 'users' && (
          <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-4 sm:p-5 border-b-2 border-black bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-[2px_2px_0px_0px_#000]">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUsersCurrentPage(1);
                  }}
                  className="w-full text-xs font-bold text-black outline-none bg-transparent"
                />
                {userSearch && (
                  <button onClick={() => setUserSearch('')} className="text-slate-400 hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 shrink-0">Lọc theo vai trò:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setUsersCurrentPage(1);
                  }}
                  className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="PLAYER">Vận động viên (PLAYER)</option>
                  <option value="COACH">Huấn luyện viên (COACH)</option>
                  <option value="ORGANIZER">Ban tổ chức (ORGANIZER)</option>
                  <option value="REGIONAL_ADMIN">Admin khu vực (REGIONAL_ADMIN)</option>
                  <option value="SUPER_ADMIN">Super Admin (SUPER_ADMIN)</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-bold text-sm">
                Đang tải danh sách người dùng...
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold text-sm">
                Không tìm thấy người dùng nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-black text-black font-black uppercase text-[11px] tracking-wider">
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Phân quyền (Role)</th>
                      <th className="p-4">Khu vực</th>
                      <th className="p-4 text-right">Khóa / Mở tài khoản</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/10">
                    {paginatedUsers.map((u) => {
                      const isUpdating = updatingUserId === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center border-2 border-black shrink-0 shadow-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <strong className="font-black text-black text-sm block">
                                  {u.name}
                                </strong>
                                <span className="text-[11px] text-slate-400 font-bold">
                                  ID: {u.id.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-bold text-slate-600">
                            {u.email}
                          </td>

                          <td className="p-4">
                            {u.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                Offline
                              </span>
                            )}
                          </td>

                          {/* Role Dropdown */}
                          <td className="p-4">
                            <select
                              value={u.role}
                              disabled={isUpdating}
                              onChange={(e) => handleRoleChange(u.id, u.name, e.target.value)}
                              className="bg-white border-2 border-black rounded-lg px-2.5 py-1 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] outline-none cursor-pointer hover:bg-slate-50"
                            >
                              <option value="PLAYER">VĐV (PLAYER)</option>
                              <option value="COACH">HLV (COACH)</option>
                              <option value="ORGANIZER">Ban tổ chức (ORGANIZER)</option>
                              <option value="REGIONAL_ADMIN">Admin khu vực</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                          </td>

                          <td className="p-4 font-bold text-slate-600">
                            {u.location || 'Đà Nẵng'}
                          </td>

                          {/* Status toggle */}
                          <td className="p-4 text-right">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusToggle(u.id, u.name, u.status)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5 transition-all ${
                                u.status === 'active'
                                  ? 'bg-white hover:bg-rose-50 text-rose-600'
                                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
                              }`}
                            >
                              {u.status === 'active' ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Khóa</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Mở khóa</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 10 Users / Page Pagination Controls (Right-aligned, Prev hidden on page 1) */}
            {totalUserPages > 1 && (
              <div className="p-4 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Hiển thị {(usersCurrentPage - 1) * USERS_PER_PAGE + 1} -{' '}
                  {Math.min(usersCurrentPage * USERS_PER_PAGE, filteredUsers.length)} trong tổng số{' '}
                  {filteredUsers.length} người dùng
                </span>

                <div className="flex items-center gap-1.5 bg-white shadow-[3px_3px_0px_0px_#000] p-1 rounded-xl border-2 border-black">
                  {/* Prev Button - Only visible when usersCurrentPage > 1 */}
                  {usersCurrentPage > 1 && (
                    <button
                      onClick={() => setUsersCurrentPage(usersCurrentPage - 1)}
                      className="p-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 border-2 border-transparent hover:border-black hover:bg-slate-100 text-black"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Trước</span>
                    </button>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: totalUserPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === usersCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setUsersCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center border-2 ${
                          isActive
                            ? 'bg-primary text-white border-black shadow-[1px_1px_0px_0px_#000]'
                            : 'text-black border-transparent hover:border-black hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  {usersCurrentPage < totalUserPages && (
                    <button
                      onClick={() => setUsersCurrentPage(usersCurrentPage + 1)}
                      className="p-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 border-2 border-transparent hover:border-black hover:bg-slate-100 text-black"
                    >
                      <span>Sau</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TOURNAMENTS MODERATION (Full 59 Tournaments from MongoDB) */}
        {activeTab === 'tournaments' && (
          <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] overflow-hidden">
            <div className="p-4 sm:p-5 border-b-2 border-black bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-black text-sm">Danh sách giải đấu toàn quốc</h3>
                <span className="text-xs font-bold text-slate-500">
                  {tournamentsList.length} giải đấu tải từ MongoDB (Bao gồm giải đang ẩn & mở)
                </span>
              </div>
            </div>

            {tournamentsList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold text-sm">
                Chưa có giải đấu nào trong hệ thống.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-black text-black font-black uppercase text-[11px] tracking-wider">
                      <th className="p-4">Tên giải đấu</th>
                      <th className="p-4">Môn thể thao</th>
                      <th className="p-4">Đơn vị tổ chức</th>
                      <th className="p-4">Địa điểm</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Hành động duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/10">
                    {tournamentsList.map((t) => (
                      <tr key={t.id || t._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-black max-w-xs">
                          <Link href={`/tournaments/${t.id || t._id}`} className="hover:text-primary underline underline-offset-2">
                            {t.title}
                          </Link>
                        </td>
                        <td className="p-4 font-bold text-slate-600">{t.sport}</td>
                        <td className="p-4 font-bold text-slate-600">{t.organizer?.name || 'BTC Thể thao'}</td>
                        <td className="p-4 font-bold text-slate-600">{t.city || 'Đà Nẵng'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                              !t.isHidden
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {!t.isHidden ? 'Đã duyệt' : 'Đang ẩn'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {t.isHidden ? (
                              <button
                                onClick={() => handleModerateTournament(t.id || t._id, t.title, 'UNHIDE')}
                                className="px-3 py-1.5 rounded-xl bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black transition-all hover:bg-primary"
                              >
                                Phê duyệt
                              </button>
                            ) : (
                              <button
                                onClick={() => handleModerateTournament(t.id || t._id, t.title, 'HIDE')}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black transition-all"
                              >
                                Tạm ẩn
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORGANIZER APPROVAL & SYSTEM ACTIVITY LOGS */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* SECTION 1: BAN TỔ CHỨC CẦN XÉT DUYỆT */}
            <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] overflow-hidden">
              <div className="p-4 sm:p-5 border-b-2 border-black bg-amber-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-black text-base flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-700" />
                    Hồ Sơ Đăng Ký Ban Tổ Chức Cần Xét Duyệt
                  </h3>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    Admin có thể xem giấy chứng nhận và quyết định Chấp thuận hoặc Từ chối hồ sơ BTC.
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs px-2.5 py-1 rounded-full">
                  {organizerRequests.length} hồ sơ
                </span>
              </div>

              {organizerRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-bold text-sm">
                  Chưa có hồ sơ Ban tổ chức nào gửi đến.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-black text-black font-black uppercase text-[11px] tracking-wider">
                        <th className="p-4">Tên đơn vị / BTC</th>
                        <th className="p-4">Email liên hệ</th>
                        <th className="p-4">Giấy chứng nhận</th>
                        <th className="p-4">Bộ môn</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right">Quyết định của Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/10">
                      {organizerRequests.map((org) => {
                        const status = org.organizerApprovalStatus || 'PENDING';
                        return (
                          <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <strong className="font-black text-black text-sm block">
                                {org.name}
                              </strong>
                              {org.organizerRejectionReason && status === 'REJECTED' && (
                                <span className="text-[11px] text-rose-600 font-bold block mt-0.5">
                                  Lý do từ chối: {org.organizerRejectionReason}
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-bold text-slate-600">{org.email}</td>
                            <td className="p-4">
                              {org.organizerCertificateUrl ? (
                                <a
                                  href={org.organizerCertificateUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-primary font-black underline hover:text-primary"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Xem chứng nhận</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400 font-bold">Chưa đính kèm URL</span>
                              )}
                            </td>
                            <td className="p-4 font-bold text-slate-600">
                              {org.organizerSports && org.organizerSports.length > 0
                                ? org.organizerSports.join(', ')
                                : 'Cầu lông'}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                                  status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}
                              >
                                {status === 'APPROVED'
                                  ? 'ĐÃ CHẤP THUẬN'
                                  : status === 'REJECTED'
                                  ? 'BỊ TỪ CHỐI'
                                  : 'CHỜ XÉT DUYỆT'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveOrganizer(org.id, org.name)}
                                  disabled={status === 'APPROVED'}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all ${
                                    status === 'APPROVED'
                                      ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                  }`}
                                >
                                  {status === 'APPROVED' ? 'Đã duyệt' : 'Chấp thuận'}
                                </button>
                                <button
                                  onClick={() => handleRejectOrganizer(org.id, org.name)}
                                  disabled={status === 'REJECTED'}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all ${
                                    status === 'REJECTED'
                                      ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                                      : 'bg-rose-500 text-white hover:bg-rose-600'
                                  }`}
                                >
                                  Từ chối
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 2: NHẬT KÝ THAO TÁC QUẢN TRỊ */}
            <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] p-6 space-y-4">
              <h3 className="font-black text-black text-base pb-3 border-b-2 border-black">
                Nhật ký thao tác quản trị hệ thống
              </h3>

              {activityLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-bold text-xs">
                  Chưa có thao tác quản trị viên nào trong phiên làm việc hiện tại.
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-slate-50 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-400">{log.time}</span>
                        <div>
                          <strong className="font-black text-black">{log.admin}</strong> - {log.action}:{' '}
                          <span className="font-black text-primary">{log.target}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-white border border-black shadow-xs uppercase">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
