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
  AlertCircle,
  LogOut
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
import { adminApi } from '../../lib/admin.api';
import toast from 'react-hot-toast';

function OrganizerHeaderBar({ user, logout }: { user: any; logout: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 pb-6 mb-6 border-b-2 border-black/10">
      <div className="flex items-center gap-3.5">
        <Link href="/organizer" className="flex items-center gap-2.5 shrink-0 group">
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
              BAN TỔ CHỨC
            </span>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              {user?.email || 'organizer@courtmate.com'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

export default function OrganizerDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(initialOrganizerDashboardData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'registrations' | 'courts' | 'reports'>('tournaments');

  // Organizer status: PENDING | APPROVED | REJECTED
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.REGIONAL_ADMIN;
  const organizerStatus = isSuperAdmin
    ? 'APPROVED'
    : (user as any)?.organizerApprovalStatus || ((user as any)?.isVerified ? 'APPROVED' : 'PENDING');

  // Edit / Re-apply Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editCertificateUrl, setEditCertificateUrl] = useState((user as any)?.organizerCertificateUrl || '');
  const [editSports, setEditSports] = useState<string[]>((user as any)?.organizerSports || ['BADMINTON']);
  const [isSubmittingReapply, setIsSubmittingReapply] = useState(false);

  const handleReapply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Vui lòng nhập tên đơn vị ban tổ chức');
      return;
    }
    setIsSubmittingReapply(true);
    try {
      await adminApi.reApplyOrganizer({
        name: editName.trim(),
        certificateUrl: editCertificateUrl.trim(),
        sports: editSports,
      });
      toast.success('Đã gửi lại hồ sơ xét duyệt! Vui lòng chờ phản hồi.');
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi lại hồ sơ.');
    } finally {
      setIsSubmittingReapply(false);
    }
  };

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

  // 1. PENDING APPROVAL SCREEN
  if (organizerStatus === 'PENDING') {
    return (
      <div className="bg-[#FAF8F5] min-h-screen page-section pb-16">
        <PageContainer>
          <OrganizerHeaderBar user={user} logout={logout} />

          <div className="max-w-xl mx-auto bg-white border-2 border-black rounded-3xl p-8 sm:p-10 shadow-[6px_6px_0px_0px_#000] text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black px-3 py-1 rounded-full mb-3">
                ĐANG CHỜ XÉT DUYỆT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                Hồ Sơ BTC Đang Được Xét Duyệt
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-3 leading-relaxed">
                Hồ sơ đăng ký tài khoản Ban tổ chức của <strong>{user?.name || 'bạn'}</strong> đã được gửi tới Ban Quản Trị CourtMate. Chúng tôi đang kiểm tra giấy chứng nhận tổ chức giải thể thao.
              </p>
            </div>

            {/* Application Summary Box */}
            <div className="bg-slate-50 border-2 border-black rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="font-bold text-slate-500">Tên đơn vị:</span>
                <strong className="font-black text-black">{user?.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="font-bold text-slate-500">Email:</span>
                <strong className="font-bold text-black">{user?.email}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="font-bold text-slate-500">Giấy chứng nhận:</span>
                {(user as any)?.organizerCertificateUrl ? (
                  <a
                    href={(user as any)?.organizerCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-black text-primary underline"
                  >
                    Xem văn bản đính kèm
                  </a>
                ) : (
                  <span className="font-bold text-slate-400">Đã tải lên hệ thống</span>
                )}
              </div>
              <div className="flex justify-between py-1">
                <span className="font-bold text-slate-500">Trạng thái:</span>
                <span className="font-black text-amber-600">Đang chờ Admin duyệt</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all"
              >
                Kiểm tra lại trạng thái
              </button>
              <Link href="/" className="w-full sm:w-auto">
                <button className="w-full px-5 py-2.5 bg-primary text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-primary transition-all">
                  Về trang chủ
                </button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // 2. REJECTED APPROVAL SCREEN
  if (organizerStatus === 'REJECTED') {
    return (
      <div className="bg-[#FAF8F5] min-h-screen page-section pb-16">
        <PageContainer>
          <OrganizerHeaderBar user={user} logout={logout} />

          <div className="max-w-xl mx-auto bg-white border-2 border-black rounded-3xl p-8 sm:p-10 shadow-[6px_6px_0px_0px_#000] text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black px-3 py-1 rounded-full mb-3">
                XÉT DUYỆT THẤT BẠI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                Hồ Sơ Cần Cập Nhật Lại
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-3 leading-relaxed">
                Rất tiếc, hồ sơ đăng ký Ban tổ chức của bạn chưa được duyệt vào thời điểm này.
              </p>
            </div>

            {/* Rejection Reason Notice */}
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-left space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 block">
                Lý do từ Ban Quản Trị:
              </span>
              <p className="text-xs font-bold text-rose-900 leading-relaxed">
                {(user as any)?.organizerRejectionReason ||
                  'Giấy chứng nhận hoạt động thể thao chưa hợp lệ hoặc thiếu thông tin tổ chức. Vui lòng cập nhật lại giấy chứng nhận và thông tin đơn vị.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-primary transition-all"
              >
                Chỉnh sửa hồ sơ & Gửi lại
              </button>
              <Link href="/" className="w-full sm:w-auto">
                <button className="w-full px-5 py-3 bg-white text-black font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-slate-50 transition-all">
                  Về trang chủ
                </button>
              </Link>
            </div>
          </div>

          {/* EDIT & REAPPLY MODAL */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[6px_6px_0px_0px_#000] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-5">
                  <h3 className="font-black text-lg text-black">Chỉnh Sửa Hồ Sơ Ban Tổ Chức</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1.5 rounded-lg border-2 border-black hover:bg-slate-100 text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleReapply} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1.5">
                      Tên đơn vị / Ban tổ chức *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ví dụ: CLB Cầu Lông Đà Nẵng"
                      className="w-full p-2.5 rounded-xl border-2 border-black text-xs font-bold text-black outline-none focus:border-primary shadow-[2px_2px_0px_0px_#000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1.5">
                      Đường dẫn Giấy chứng nhận / Quyết định thành lập (URL) *
                    </label>
                    <input
                      type="url"
                      required
                      value={editCertificateUrl}
                      onChange={(e) => setEditCertificateUrl(e.target.value)}
                      placeholder="https://example.com/certificate.pdf"
                      className="w-full p-2.5 rounded-xl border-2 border-black text-xs font-bold text-black outline-none focus:border-primary shadow-[2px_2px_0px_0px_#000]"
                    />
                    <span className="text-[11px] font-bold text-slate-400 mt-1 block">
                      Đính kèm link hình ảnh hoặc file PDF giấy phép tổ chức / quyết định CLB.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1.5">
                      Bộ môn tổ chức
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['BADMINTON', 'PICKLEBALL', 'TENNIS', 'FOOTBALL'].map((sp) => {
                        const checked = editSports.includes(sp);
                        return (
                          <button
                            type="button"
                            key={sp}
                            onClick={() => {
                              if (checked) {
                                if (editSports.length > 1) setEditSports(editSports.filter((s) => s !== sp));
                              } else {
                                setEditSports([...editSports, sp]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all ${
                              checked
                                ? 'bg-primary text-white shadow-[2px_2px_0px_0px_#000]'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {sp === 'BADMINTON' ? 'Cầu lông' : sp === 'PICKLEBALL' ? 'Pickleball' : sp === 'TENNIS' ? 'Tennis' : 'Bóng đá'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black hover:bg-slate-100 text-black"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReapply}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-primary transition-all disabled:opacity-50"
                    >
                      {isSubmittingReapply ? 'Đang gửi...' : 'Gửi lại xét duyệt'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </PageContainer>
      </div>
    );
  }

  // 3. APPROVED SCREEN - Regular organizer dashboard
  return (
    <div className="bg-[#FAF8F5] min-h-screen page-section pb-16">
      <PageContainer>
        <OrganizerHeaderBar user={user} logout={logout} />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
              {data.profile.name}
            </h1>
            <p className="text-sm text-muted mt-1">
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
          <div className="bg-surface shadow-card p-5 rounded-2xl border border-ink  flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium block">Giải đấu đang mở</span>
              <strong className="text-2xl font-extrabold text-navy mt-1 block">
                {metrics.activeTournaments}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-baby text-primary flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-surface shadow-card p-5 rounded-2xl border border-ink  flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium block">Đăng ký chờ duyệt</span>
              <strong className="text-2xl font-extrabold text-primary mt-1 block">
                {metrics.pendingRegistrations}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-baby text-primary flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-surface shadow-card p-5 rounded-2xl border border-ink  flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium block">Tổng vận động viên</span>
              <strong className="text-2xl font-extrabold text-navy mt-1 block">
                {metrics.totalParticipants}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-baby text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>


        </div>

        {/* Tab Controls */}
        <div className="bg-surface shadow-card rounded-2xl border border-ink p-1.5 flex gap-1  mb-6 overflow-x-auto">
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
                  : 'text-muted hover:text-navy hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Tournaments List Table */}
        {activeTab === 'tournaments' && (
          <div className="bg-surface shadow-card rounded-2xl border border-ink overflow-hidden ">
            <div className="p-5 border-b border-ink flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm">Giải đấu của bạn</h3>

            </div>

            {loading ? (
              <div className="p-12 text-center text-muted text-sm">Đang tải dữ liệu giải đấu từ hệ thống...</div>
            ) : data.tournaments.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-muted mx-auto mb-3" />
                <h4 className="font-bold text-navy text-sm">Chưa có giải đấu nào</h4>
                <p className="text-sm text-muted mt-1 mb-4">Chọn “Tạo giải đấu” để bắt đầu.</p>

              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white border-b border-ink text-muted uppercase tracking-wider font-semibold">
                      <th className="p-4">Tên giải đấu</th>
                      <th className="p-4">Môn thể thao</th>
                      <th className="p-4">Ngày diễn ra</th>
                      <th className="p-4">Số lượng VĐV</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink">
                    {data.tournaments.map((t) => (
                      <tr key={t.id} className="hover:bg-white transition">
                        <td className="p-4 font-semibold text-navy">
                          <Link href={`/tournaments/${t.id}`} className="hover:text-primary">
                            {t.name}
                          </Link>
                        </td>
                        <td className="p-4 text-muted">{t.sport}</td>
                        <td className="p-4 text-muted">{t.date}</td>
                        <td className="p-4">
                          <span className="font-bold text-navy">{t.registrations}</span> VĐV
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            t.status === 'active'
                              ? 'bg-accent-baby text-primary'
                              : t.status === 'draft'
                              ? 'bg-accent-tan text-primary'
                              : 'bg-white text-muted'
                          }`}>
                            {t.status === 'active' ? 'Đang mở' : t.status === 'draft' ? 'Bản nháp' : 'Đã kết thúc'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/tournaments/${t.id}`}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-primary hover:text-white font-semibold transition"
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
          <div className="bg-surface shadow-card rounded-2xl border border-ink overflow-hidden ">
            <div className="p-5 border-b border-ink flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm">Danh sách đăng ký chờ duyệt</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted text-sm">Đang tải hồ sơ đăng ký...</div>
            ) : data.registrations.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-muted mx-auto mb-3" />
                <h4 className="font-bold text-navy text-sm">Chưa có hồ sơ đăng ký nào</h4>
                <p className="text-sm text-muted mt-1">Khi vận động viên đăng ký thi đấu, danh sách sẽ hiển thị tại đây để bạn phê duyệt.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white border-b border-ink text-muted uppercase tracking-wider font-semibold">
                      <th className="p-4">Vận động viên</th>
                      <th className="p-4">Giải đấu</th>
                      <th className="p-4">Hạng mục</th>
                      <th className="p-4">Trình độ</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink">
                    {data.registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-white transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={reg.avatar} alt={reg.playerName} className="w-8 h-8 rounded-full object-cover" />
                            <strong className="text-navy">{reg.playerName}</strong>
                          </div>
                        </td>
                        <td className="p-4 text-muted">{reg.tournamentName}</td>
                        <td className="p-4 text-muted font-medium">{reg.category}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-white font-mono font-semibold text-muted">
                            {reg.rating}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            reg.status === 'approved'
                              ? 'bg-accent-baby text-primary'
                              : reg.status === 'rejected'
                              ? 'bg-accent-tan text-primary'
                              : 'bg-accent-tan text-primary'
                          }`}>
                            {reg.status === 'approved' ? 'Đã duyệt' : reg.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {reg.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveRegistration(reg.id)}
                                className="cm-button px-2.5 py-1 rounded-lg bg-primary hover:bg-primary text-white font-semibold transition"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleRejectRegistration(reg.id)}
                                className="cm-button px-2.5 py-1 rounded-lg bg-accent-tan text-primary hover:bg-accent-tan font-semibold transition"
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
          <div className="bg-surface shadow-card rounded-2xl border border-ink p-8  text-center">
            <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-bold text-navy text-sm">Chưa có sân liên kết</h3>

          </div>
        )}

        {/* TAB 4: Financial Reports */}
        {activeTab === 'reports' && (
          <div className="bg-surface shadow-card rounded-2xl border border-ink p-6 sm:p-8 space-y-6 ">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-base">Báo cáo doanh thu</h3>
                <p className="text-sm text-muted mt-0.5">Lệ phí đăng ký giải đấu</p>
              </div>


            </div>

            <div className="p-8 rounded-xl bg-white border border-ink text-center">
              <DollarSign className="w-10 h-10 text-primary mx-auto mb-2" />
              <strong className="text-xl font-bold text-navy block">Chưa có báo cáo doanh thu</strong>
              <p className="text-sm text-muted mt-1">
                Báo cáo doanh thu chưa được hỗ trợ.
              </p>
            </div>
          </div>
        )}

      </PageContainer>
    </div>
  );
}
