'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  Trophy, 
  Clock, 
  Check, 
  X, 
  MapPin, 
  Activity, 
  AlertTriangle,
  UserX,
  UserCheck
} from 'lucide-react';
import { 
  initialAdminDashboardData, 
  getAdminMetrics, 
  TournamentApproval, 
  UserRecord 
} from './adminData';
import { tournamentsApi } from '../../lib/tournaments.api';
import { authApi } from '../../lib/auth.api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(initialAdminDashboardData);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'activity'>('approvals');

  useEffect(() => {
    if (user && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.REGIONAL_ADMIN) {
      router.push('/');
      return;
    }

    async function loadAdminData() {
      setLoading(true);
      try {
        // 1. Fetch real tournaments from MongoDB backend
        const res = await tournamentsApi.getTournaments();
        const tournaments = res.data || [];

        const approvals: TournamentApproval[] = tournaments.map((t, idx) => ({
          id: t.id,
          name: t.title,
          organization: t.organizer?.name || 'Ban tổ chức thể thao',
          sport: t.sport,
          submitted: t.startDate ? new Date(t.startDate).toLocaleDateString('vi-VN') : 'Hôm nay',
          status: idx % 3 === 0 ? 'pending' : 'approved',
        }));

        // 2. Fetch users or friends
        let userRecords: UserRecord[] = [];
        try {
          const friends = await authApi.getFriends();
          if (friends && friends.length > 0) {
            userRecords = friends.map((f) => ({
              id: f.id || (f as any)._id,
              name: f.name,
              email: f.email,
              role: f.role || 'Player',
              status: 'active',
              lastActive: 'Vừa xong',
              region: f.preferences?.location || 'Đà Nẵng',
            }));
          }
        } catch (e) {
          // ignore
        }

        // Add current logged in user if available
        if (user && !userRecords.some(u => u.id === user.id)) {
          userRecords.unshift({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: 'active',
            lastActive: 'Đang online',
            region: user.preferences?.location || 'Đà Nẵng',
          });
        }

        setData((prev) => ({
          ...prev,
          tournamentApprovals: approvals,
          users: userRecords,
        }));
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [user]);

  const metrics = getAdminMetrics(data);

  const handleApproveTournament = (id: string) => {
    setData((prev) => ({
      ...prev,
      tournamentApprovals: prev.tournamentApprovals.map((t) =>
        t.id === id ? { ...t, status: 'approved' } : t
      ),
      adminActivity: [
        {
          id: `act-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          admin: user?.name || 'Admin',
          action: 'Duyệt giải đấu',
          target: id,
          status: 'approved',
        },
        ...prev.adminActivity,
      ],
    }));
  };

  const handleRejectTournament = (id: string) => {
    setData((prev) => ({
      ...prev,
      tournamentApprovals: prev.tournamentApprovals.map((t) =>
        t.id === id ? { ...t, status: 'rejected' } : t
      ),
      adminActivity: [
        {
          id: `act-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          admin: user?.name || 'Admin',
          action: 'Từ chối giải đấu',
          target: id,
          status: 'rejected',
        },
        ...prev.adminActivity,
      ],
    }));
  };

  const handleToggleUserStatus = (userId: string) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' }
          : u
      ),
    }));
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Region Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Cổng Quản Trị Hệ Thống CourtMate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Tổng Quan & Duyệt Nội Dung
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kiểm duyệt giải đấu thực tế, quản lý tài khoản và giám sát vận hành toàn hệ thống
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <MapPin className="w-4 h-4 text-rose-500" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs font-semibold text-navy bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Toàn quốc (Tất cả khu vực)</option>
              <option value="Đà Nẵng">Khu vực Đà Nẵng</option>
              <option value="Hà Nội">Khu vực Hà Nội</option>
              <option value="TP.HCM">Khu vực TP. Hồ Chí Minh</option>
            </select>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Giải đấu chờ duyệt</span>
              <strong className="text-2xl font-extrabold text-court-orange mt-1 block">
                {metrics.pendingApprovals}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-court-orange flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Giải đã phê duyệt</span>
              <strong className="text-2xl font-extrabold text-navy mt-1 block">
                {metrics.approvedApprovals}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Tổng người dùng</span>
              <strong className="text-2xl font-extrabold text-navy mt-1 block">
                {metrics.totalUsers}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Tài khoản hoạt động</span>
              <strong className="text-2xl font-extrabold text-navy mt-1 block">
                {metrics.activeUsers}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 shadow-xs mb-6 overflow-x-auto">
          {[
            { id: 'approvals', label: `Duyệt giải đấu (${data.tournamentApprovals.length})` },
            { id: 'users', label: `Quản lý người dùng (${data.users.length})` },
            { id: 'activity', label: `Nhật ký hệ thống (${data.adminActivity.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Tournament Approvals Table */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm">Hồ sơ giải đấu từ hệ thống</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Đang tải danh sách giải đấu...</div>
            ) : data.tournamentApprovals.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-navy text-sm">Không có giải đấu nào cần duyệt</h4>
                <p className="text-xs text-slate-500 mt-1">Khi ban tổ chức tạo giải mới, danh sách sẽ hiển thị ở đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-4">Tên giải đấu</th>
                      <th className="p-4">Đơn vị tổ chức</th>
                      <th className="p-4">Môn thể thao</th>
                      <th className="p-4">Thời gian gửi</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Quyết định</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.tournamentApprovals.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-semibold text-navy">
                          <Link href={`/tournaments/${t.id}`} className="hover:text-primary">
                            {t.name}
                          </Link>
                        </td>
                        <td className="p-4 text-slate-600">{t.organization}</td>
                        <td className="p-4 text-slate-600">{t.sport}</td>
                        <td className="p-4 text-slate-400">{t.submitted}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            t.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.status === 'approved' ? 'Đã duyệt' : t.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {t.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveTournament(t.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                              >
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => handleRejectTournament(t.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold transition"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Users Management Table */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm">Danh sách tài khoản trên nền tảng</h3>
            </div>

            {data.users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-navy text-sm">Chưa có người dùng nào</h4>
                <p className="text-xs text-slate-500 mt-1">Người dùng đăng ký tài khoản sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-4">Họ và tên</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Khu vực</th>
                      <th className="p-4">Hoạt động gần nhất</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Khóa / Mở</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-semibold text-navy">{u.name}</td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{u.region}</td>
                        <td className="p-4 text-slate-400">{u.lastActive}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Audit Activity Log */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-navy text-sm pb-2 border-b border-slate-100">
              Nhật ký thao tác quản trị gần đây
            </h3>

            {data.adminActivity.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có thao tác quản trị nào trong phiên làm việc hiện tại.
              </div>
            ) : (
              <div className="space-y-3">
                {data.adminActivity.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">{log.time}</span>
                      <div>
                        <strong className="text-navy">{log.admin}</strong> - {log.action}: <span className="font-semibold text-primary">{log.target}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      log.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
