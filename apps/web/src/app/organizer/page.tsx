'use client';

import { PageContainer } from '../../components/layout/PageContainer';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Check,
  X,
  Plus,
  TrendingUp,
  ShieldCheck,
  Clock,
  MapPin,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import {
  initialOrganizerDashboardData,
  getOrganizerMetrics,
  TournamentItem,
  RegistrationItem,
  CourtItem
} from './organizerData';
import { useAuth } from '../../context/AuthContext';
import { tournamentsApi } from '../../lib/tournaments.api';
import { registrationsApi } from '../../lib/registrations.api';
import { RegistrationStatus, TournamentStatus, UserRole } from '@courtmate/shared';

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(initialOrganizerDashboardData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'registrations' | 'courts' | 'reports'>('tournaments');

  useEffect(() => {
    if (user && user.role !== UserRole.ORGANIZER && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.REGIONAL_ADMIN) {
      router.push('/');
      return;
    }

    async function loadOrganizerData() {
      setLoading(true);
      try {
        // 1. Fetch organized tournaments from backend
        let tours = await tournamentsApi.getMyOrganizedTournaments();
        if (!tours || tours.length === 0) {
          // If none specifically organized, fetch tournaments to view and manage
          const res = await tournamentsApi.getTournaments();
          tours = res.data;
        }

        const mappedTournaments: TournamentItem[] = tours.map((t) => ({
          id: t.id,
          name: t.title,
          sport: t.sport,
          date: t.startDate ? new Date(t.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật',
          registrations: (t as any).joinedSlots || (t as any).registrationsCount || 0,
          status: (t.status === TournamentStatus.COMPLETED ? 'completed' : 'active') as any,
          description: t.description || '',
        }));

        // 2. Fetch registrations for first 3 tournaments
        let allRegs: RegistrationItem[] = [];
        for (const t of tours.slice(0, 3)) {
          try {
            const regs = await registrationsApi.getRegistrationsByTournament(t.id);
            if (regs && regs.length > 0) {
              const mapped = regs.map((r) => ({
                id: r.id,
                playerName: r.playerName,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
                rating: r.skillLevel || 'Tiêu chuẩn',
                tournamentId: r.tournamentId,
                tournamentName: t.title,
                category: r.partnerName ? `Đôi (với ${r.partnerName})` : 'Đơn',
                status: (r.status === RegistrationStatus.APPROVED ? 'approved' : r.status === RegistrationStatus.REJECTED ? 'rejected' : 'pending') as any,
              }));
              allRegs = [...allRegs, ...mapped];
            }
          } catch (e) {
            // Ignore single tournament fetch errors
          }
        }

        setData((prev) => ({
          ...prev,
          tournaments: mappedTournaments,
          registrations: allRegs,
          profile: {
            name: user?.name ? `Ban Tổ Chức - ${user.name}` : 'Ban Tổ Chức Thể Thao',
            logo: user?.avatarUrl || '',
            description: user?.preferences?.bio || 'Đơn vị tổ chức giải đấu thể thao trên nền tảng CourtMate.',
            contactEmail: user?.email || '',
            phone: (user as any)?.phone || '',
            location: user?.preferences?.location || 'Đà Nẵng',
          },
        }));
      } catch (err) {
        console.error('Failed to load organizer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrganizerData();
  }, [user]);

  const metrics = getOrganizerMetrics(data);

  const handleApproveRegistration = async (regId: string) => {
    try {
      await registrationsApi.updateStatus(regId, RegistrationStatus.APPROVED);
      setData((prev) => ({
        ...prev,
        registrations: prev.registrations.map((r) =>
          r.id === regId ? { ...r, status: 'approved' } : r
        ),
      }));
    } catch (e) {
      alert('Không thể cập nhật trạng thái đơn đăng ký');
    }
  };

  const handleRejectRegistration = async (regId: string) => {
    try {
      await registrationsApi.updateStatus(regId, RegistrationStatus.REJECTED);
      setData((prev) => ({
        ...prev,
        registrations: prev.registrations.map((r) =>
          r.id === regId ? { ...r, status: 'rejected' } : r
        ),
      }));
    } catch (e) {
      alert('Không thể từ chối đơn đăng ký');
    }
  };

  return (
    <div className="bg-canvas min-h-screen page-section">
      <PageContainer>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
              {data.profile.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {data.profile.location}
            </p>
          </div>

          <Link
            href="/tournaments/create"
            className="cm-action inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm hover:shadow transition w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo giải đấu</span>
          </Link>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface shadow-card p-5 rounded-2xl border border-slate-200  flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium block">Giải đấu đang mở</span>
              <strong className="text-2xl font-extrabold text-navy mt-1 block">
                {metrics.activeTournaments}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-surface shadow-card p-5 rounded-2xl border border-slate-200  flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium block">Đăng ký chờ duyệt</span>
              <strong className="text-2xl font-extrabold text-amber-700 mt-1 block">
                {metrics.pendingRegistrations}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-surface shadow-card p-5 rounded-2xl border border-slate-200  flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium block">Tổng vận động viên</span>
              <strong className="text-2xl font-extrabold text-navy mt-1 block">
                {metrics.totalParticipants}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>


        </div>

        {/* Tab Controls */}
        <div className="bg-surface shadow-card rounded-2xl border border-slate-200 p-1.5 flex gap-1  mb-6 overflow-x-auto">
          {[
            { id: 'tournaments', label: `Giải đấu (${data.tournaments.length})` },
            { id: 'registrations', label: `Duyệt đăng ký (${data.registrations.length})` },
            { id: 'courts', label: `Sân thi đấu (${data.courts.length})` },
            { id: 'reports', label: 'Báo cáo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`cm-button px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Tournaments List Table */}
        {activeTab === 'tournaments' && (
          <div className="bg-surface shadow-card rounded-2xl border border-slate-200 overflow-hidden ">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm">Giải đấu của bạn</h3>

            </div>

            {loading ? (
              <div className="p-12 text-center text-muted text-sm">Đang tải dữ liệu giải đấu từ hệ thống...</div>
            ) : data.tournaments.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-navy text-sm">Chưa có giải đấu nào</h4>
                <p className="text-sm text-slate-500 mt-1 mb-4">Chọn “Tạo giải đấu” để bắt đầu.</p>

              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-4">Tên giải đấu</th>
                      <th className="p-4">Môn thể thao</th>
                      <th className="p-4">Ngày diễn ra</th>
                      <th className="p-4">Số lượng VĐV</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.tournaments.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-semibold text-navy">
                          <Link href={`/tournaments/${t.id}`} className="hover:text-primary">
                            {t.name}
                          </Link>
                        </td>
                        <td className="p-4 text-slate-600">{t.sport}</td>
                        <td className="p-4 text-slate-600">{t.date}</td>
                        <td className="p-4">
                          <span className="font-bold text-navy">{t.registrations}</span> VĐV
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            t.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.status === 'active' ? 'Đang mở' : t.status === 'draft' ? 'Bản nháp' : 'Đã kết thúc'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/tournaments/${t.id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-primary hover:text-white font-semibold transition"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Registrations Approval */}
        {activeTab === 'registrations' && (
          <div className="bg-surface shadow-card rounded-2xl border border-slate-200 overflow-hidden ">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm">Danh sách đăng ký chờ duyệt</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted text-sm">Đang tải hồ sơ đăng ký...</div>
            ) : data.registrations.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-navy text-sm">Chưa có hồ sơ đăng ký nào</h4>
                <p className="text-sm text-slate-500 mt-1">Khi vận động viên đăng ký thi đấu, danh sách sẽ hiển thị tại đây để bạn phê duyệt.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-4">Vận động viên</th>
                      <th className="p-4">Giải đấu</th>
                      <th className="p-4">Hạng mục</th>
                      <th className="p-4">Trình độ</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={reg.avatar} alt={reg.playerName} className="w-8 h-8 rounded-full object-cover" />
                            <strong className="text-navy">{reg.playerName}</strong>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">{reg.tournamentName}</td>
                        <td className="p-4 text-slate-600 font-medium">{reg.category}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-semibold text-slate-700">
                            {reg.rating}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            reg.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {reg.status === 'approved' ? 'Đã duyệt' : reg.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {reg.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveRegistration(reg.id)}
                                className="cm-button px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleRejectRegistration(reg.id)}
                                className="cm-button px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold transition"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">Đã xử lý</span>
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

        {/* TAB 3: Courts & Slots Management */}
        {activeTab === 'courts' && (
          <div className="bg-surface shadow-card rounded-2xl border border-slate-200 p-8  text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-navy text-sm">Chưa có sân liên kết</h3>

          </div>
        )}

        {/* TAB 4: Financial Reports */}
        {activeTab === 'reports' && (
          <div className="bg-surface shadow-card rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 ">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-base">Báo cáo doanh thu</h3>
                <p className="text-sm text-slate-500 mt-0.5">Lệ phí đăng ký giải đấu</p>
              </div>


            </div>

            <div className="p-8 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <DollarSign className="w-10 h-10 text-primary mx-auto mb-2" />
              <strong className="text-xl font-bold text-navy block">Chưa có báo cáo doanh thu</strong>
              <p className="text-sm text-slate-500 mt-1">
                Báo cáo doanh thu chưa được hỗ trợ.
              </p>
            </div>
          </div>
        )}

      </PageContainer>
    </div>
  );
}
