import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import {
  LayoutDashboard, Users, Building2, Shield, FileText, BarChart3,
  Settings, Headphones, LogOut, Menu, RefreshCw, Calendar,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  ChevronRight, Globe, Ban, Flag, Clock,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { UserRole } from '@courtmate/shared';
import { useLogin } from '../features/auth/hooks/useLogin';
import {
  initialAdminDashboardData,
  getDashboardMetrics,
  type AdminDashboardData,
  type OrganizerRecord,
  type ReportRecord,
  type SupportTicket,
  type TournamentApproval,
  type UserRecord,
} from './mockData';

type AdminTab =
  | 'overview'
  | 'users'
  | 'organizers'
  | 'moderation'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'support';

type ActionItemStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'disabled' | 'review' | 'open' | 'resolved' | 'high' | 'medium' | 'low';

type ActionItem = {
  id: string;
  label: string;
  description?: string;
  status?: ActionItemStatus;
  onPress: () => void;
};

const SIDEBAR_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Tổng quan nền tảng', icon: LayoutDashboard },
  { id: 'users', label: 'Quản lý người dùng', icon: Users },
  { id: 'organizers', label: 'Quản lý nhà tổ chức', icon: Building2 },
  { id: 'moderation', label: 'Kiểm duyệt giải đấu', icon: Shield },
  { id: 'reports', label: 'Báo cáo', icon: FileText },
  { id: 'analytics', label: 'Phân tích', icon: BarChart3 },
  { id: 'settings', label: 'Cài đặt nền tảng', icon: Settings },
  { id: 'support', label: 'Hỗ trợ & kiểm duyệt', icon: Headphones },
];

const TAB_TITLES: Record<AdminTab, string> = {
  overview: 'Tổng quan nền tảng',
  users: 'Quản lý người dùng',
  organizers: 'Quản lý nhà tổ chức',
  moderation: 'Kiểm duyệt giải đấu',
  reports: 'Báo cáo',
  analytics: 'Phân tích',
  settings: 'Cài đặt nền tảng',
  support: 'Hỗ trợ & kiểm duyệt',
};

function StatCard({
  title, value, trend, trendUp, icon: Icon, alert,
}: {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: typeof Users;
  alert?: string;
}) {
  return (
    <View className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-2xl p-lg">
      <View className="flex-row justify-between items-start mb-md">
        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
          <Icon color="#2563EB" size={20} />
        </View>
        {trend && (
          <View className="flex-row items-center">
            {trendUp ? (
              <TrendingUp color="#22C55E" size={14} />
            ) : (
              <TrendingDown color="#EF4444" size={14} />
            )}
            <Text className={`text-xs font-semibold ml-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-slate-500 text-sm font-medium">{title}</Text>
      <Text className="text-slate-900 font-extrabold text-2xl mt-1">{value}</Text>
      {alert && (
        <Text className="text-red-500 text-xs font-semibold mt-2">{alert}</Text>
      )}
    </View>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' | 'urgent' | 'resolved' }) {
  const styles = {
    pending: 'bg-slate-100 text-slate-600',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-600',
    urgent: 'bg-red-50 text-red-700',
    resolved: 'bg-blue-50 text-blue-700',
  };
  const labels = {
    pending: 'Đang chờ',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    urgent: 'Khẩn cấp',
    resolved: 'Đã xử lý',
  };
  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${styles[status]}`}>
      <Text className={`text-[11px] font-bold uppercase ${styles[status]}`}>{labels[status]}</Text>
    </View>
  );
}

function StatusPill({ status }: { status?: ActionItemStatus }) {
  if (!status) {
    return null;
  }

  const styles: Record<ActionItemStatus, string> = {
    pending: 'bg-slate-100 text-slate-600',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-600',
    active: 'bg-emerald-50 text-emerald-700',
    disabled: 'bg-red-50 text-red-600',
    review: 'bg-amber-50 text-amber-700',
    open: 'bg-blue-50 text-blue-700',
    resolved: 'bg-slate-100 text-slate-600',
    high: 'bg-red-50 text-red-600',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-emerald-50 text-emerald-700',
  };

  const labels: Record<ActionItemStatus, string> = {
    pending: 'Đang chờ',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    active: 'Hoạt động',
    disabled: 'Vô hiệu hóa',
    review: 'Đang xét duyệt',
    open: 'Đang mở',
    resolved: 'Đã xử lý',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
  };

  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${styles[status]}`}>
      <Text className={`text-[10px] font-bold uppercase ${styles[status]}`}>{labels[status]}</Text>
    </View>
  );
}

function InteractiveListSection({
  title,
  description,
  items,
  searchable = false,
}: {
  title: string;
  description: string;
  items: ActionItem[];
  searchable?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 3;

  const filteredItems = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter((item) => `${item.label} ${item.description ?? ''}`.toLowerCase().includes(query));
  }, [items, searchQuery, searchable]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-xl">
      <Text className="text-slate-900 font-bold text-lg mb-2">{title}</Text>
      <Text className="text-slate-500 text-sm mb-lg">{description}</Text>
      {searchable && (
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm..."
          className="border border-slate-200 rounded-xl px-md py-sm mb-md"
        />
      )}
      {visibleItems.map((item) => (
        <TouchableOpacity key={item.id} onPress={item.onPress} className="flex-row items-start py-md border-b border-slate-100 last:border-b-0">
          <View className="flex-1">
            <Text className="text-slate-700 font-medium text-sm">{item.label}</Text>
            {item.description ? <Text className="text-slate-500 text-xs mt-1">{item.description}</Text> : null}
          </View>
          {item.status ? <StatusPill status={item.status} /> : <ChevronRight color="#2563EB" size={16} />}
        </TouchableOpacity>
      ))}
      {filteredItems.length > pageSize && (
        <View className="flex-row justify-between mt-md">
          <TouchableOpacity onPress={() => setPage((prev) => Math.max(1, prev - 1))}>
            <Text className="text-slate-500 text-sm">← Trước</Text>
          </TouchableOpacity>
          <Text className="text-slate-500 text-sm">Trang {currentPage}/{totalPages}</Text>
          <TouchableOpacity onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
            <Text className="text-slate-500 text-sm">Sau →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function DetailModal({
  visible,
  title,
  body,
  onClose,
}: {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View className="flex-1 justify-center items-center bg-black/40 px-lg">
        <View className="w-full max-w-[420px] bg-white rounded-2xl p-lg">
          <Text className="text-slate-900 font-extrabold text-lg mb-2">{title}</Text>
          <Text className="text-slate-600 text-sm leading-6">{body}</Text>
          <TouchableOpacity onPress={onClose} className="mt-lg bg-blue-vibrant rounded-xl py-md items-center">
            <Text className="text-white font-bold text-sm">Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useLogin();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(initialAdminDashboardData);
  const [detailModal, setDetailModal] = useState<{ title: string; body: string } | null>(null);

  const metrics = useMemo(() => getDashboardMetrics(dashboardData), [dashboardData]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const openDetail = (title: string, body: string) => {
    setDetailModal({ title, body });
  };

  const closeDetail = () => {
    setDetailModal(null);
  };

  const handleApproveApproval = (id: string) => {
    setDashboardData((prev) => {
      const target = prev.tournamentApprovals.find((item) => item.id === id);
      const updatedApprovals = prev.tournamentApprovals.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item));
      const newActivity = {
        id: `activity-${Date.now()}`,
        time: 'Vừa xong',
        admin: user?.name ?? 'Admin',
        action: 'Duyệt giải đấu',
        target: target?.name ?? 'Giải đấu',
        status: 'approved' as const,
      };
      return {
        ...prev,
        tournamentApprovals: updatedApprovals,
        adminActivity: [newActivity, ...prev.adminActivity].slice(0, 6),
      };
    });
    openDetail('Đã duyệt giải đấu', 'Giải đấu đã được phê duyệt và chuyển sang trạng thái hoạt động.');
  };

  const handleRejectApproval = (id: string) => {
    setDashboardData((prev) => {
      const target = prev.tournamentApprovals.find((item) => item.id === id);
      const updatedApprovals = prev.tournamentApprovals.map((item) => (item.id === id ? { ...item, status: 'rejected' as const } : item));
      const newActivity = {
        id: `activity-${Date.now()}`,
        time: 'Vừa xong',
        admin: user?.name ?? 'Admin',
        action: 'Từ chối giải đấu',
        target: target?.name ?? 'Giải đấu',
        status: 'rejected' as const,
      };
      return {
        ...prev,
        tournamentApprovals: updatedApprovals,
        adminActivity: [newActivity, ...prev.adminActivity].slice(0, 6),
      };
    });
    openDetail('Đã từ chối giải đấu', 'Giải đấu này đã được chuyển sang trạng thái từ chối.');
  };

  const handleResolveTicket = (id: string) => {
    setDashboardData((prev) => ({
      ...prev,
      supportTickets: prev.supportTickets.map((ticket) => (ticket.id === id ? { ...ticket, status: 'resolved' as const } : ticket)),
    }));
    openDetail('Đã xử lý ticket', 'Ticket hỗ trợ đã được đánh dấu là đã xử lý.');
  };

  const handleToggleUserStatus = (id: string) => {
    setDashboardData((prev) => ({
      ...prev,
      users: prev.users.map((userItem) => {
        if (userItem.id !== id) {
          return userItem;
        }
        return { ...userItem, status: userItem.status === 'active' ? 'disabled' : 'active' };
      }),
    }));
    openDetail('Cập nhật trạng thái người dùng', 'Trạng thái người dùng đã được thay đổi thành công.');
  };

  const handleToggleOrganizerStatus = (id: string) => {
    setDashboardData((prev) => ({
      ...prev,
      organizers: prev.organizers.map((organizer) => {
        if (organizer.id !== id) {
          return organizer;
        }
        const nextStatus: OrganizerRecord['status'] = organizer.status === 'active' ? 'disabled' : 'active';
        return { ...organizer, status: nextStatus };
      }),
    }));
    openDetail('Cập nhật trạng thái tổ chức', 'Trạng thái nhà tổ chức đã được cập nhật.');
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const pendingApprovals = dashboardData.tournamentApprovals.filter((item) => item.status === 'pending');
  const approvedApprovals = dashboardData.tournamentApprovals.filter((item) => item.status === 'approved').length;
  const rejectedApprovals = dashboardData.tournamentApprovals.filter((item) => item.status === 'rejected').length;
  const recentActivity = dashboardData.adminActivity;

  const quickActions = [
    {
      label: 'Xem nội dung bị gắn cờ',
      icon: Flag,
      onPress: () => {
        setActiveTab('moderation');
        openDetail('Nội dung bị gắn cờ', 'Đang mở hàng đợi kiểm duyệt cho các nội dung cần xem xét.');
      },
    },
    {
      label: 'Vô hiệu hóa tài khoản nhà tổ chức',
      icon: Ban,
      onPress: () => {
        setActiveTab('organizers');
        const activeOrganizer = dashboardData.organizers.find((item) => item.status === 'active');
        if (activeOrganizer) {
          handleToggleOrganizerStatus(activeOrganizer.id);
        }
      },
    },
    {
      label: 'Xuất báo cáo nền tảng',
      icon: FileText,
      onPress: () => {
        setActiveTab('reports');
        openDetail('Xuất báo cáo', 'Một báo cáo tổng hợp đã được chuẩn bị cho nền tảng.');
      },
    },
    {
      label: 'Kiểm tra hệ thống',
      icon: Globe,
      onPress: () => {
        setActiveTab('analytics');
        openDetail('Kiểm tra hệ thống', 'Hệ thống đang ở trạng thái hoạt động ổn định.');
      },
    },
  ];

  const OverviewContent = () => (
    <View>
      <View className="flex-row flex-wrap gap-md mb-xl">
        <StatCard title="Tổng người dùng" value={metrics.totalUsers.toLocaleString('vi-VN')} trend="+12.4% so với tháng trước" trendUp icon={Users} />
        <StatCard title="Nhà tổ chức hoạt động" value={metrics.activeOrganizers.toString()} trend="+5.2% so với tháng trước" trendUp icon={Building2} />
        <StatCard title="Doanh thu toàn cầu" value={metrics.globalRevenue} trend="+18.1% so với tháng trước" trendUp icon={BarChart3} />
        <StatCard title="Ticket hỗ trợ" value={metrics.supportTickets.toString()} alert={`${metrics.urgentTickets} đang cần xử lý`} icon={Headphones} />
      </View>

      <View className="flex-row flex-wrap gap-lg">
        <View className="flex-1 min-w-[320px] bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <View className="flex-row justify-between items-center px-lg py-md border-b border-slate-100">
            <Text className="text-slate-900 font-bold text-base">Đơn duyệt giải đấu chờ xử lý</Text>
            <TouchableOpacity onPress={() => { setActiveTab('moderation'); openDetail('Xem hàng đợi', 'Bạn đang xem danh sách giải đấu chờ duyệt.'); }}>
              <Text className="text-blue-vibrant font-bold text-sm">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {pendingApprovals.slice(0, 3).map((item) => (
            <View key={item.id} className="flex-row items-center justify-between px-lg py-md border-b border-slate-50">
              <View className="flex-1 mr-4">
                <Text className="text-slate-900 font-bold text-sm">{item.name}</Text>
                <Text className="text-slate-500 text-xs mt-0.5">{item.organization} · {item.sport}</Text>
              </View>
              <View className="items-end">
                <StatusBadge status="pending" />
                <View className="flex-row mt-2">
                  <TouchableOpacity onPress={() => handleApproveApproval(item.id)} className="mr-2">
                    <Text className="text-green-600 text-xs font-bold">Duyệt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRejectApproval(item.id)}>
                    <Text className="text-red-500 text-xs font-bold">Từ chối</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="w-full md:w-[340px] bg-slate-900 rounded-2xl p-lg">
          <Text className="text-white font-bold text-base mb-md">Thao tác nhanh</Text>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity key={`${action.label}-${index}`} onPress={action.onPress} className="flex-row items-center py-md border-b border-slate-700 last:border-b-0">
                <Icon color="#94A3B8" size={18} />
                <Text className="text-slate-200 font-medium text-sm ml-3 flex-1">{action.label}</Text>
                <ChevronRight color="#64748B" size={16} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="bg-white border border-slate-200 rounded-2xl mt-lg overflow-hidden">
        <View className="flex-row justify-between items-center px-lg py-md border-b border-slate-100">
          <Text className="text-slate-900 font-bold text-base">Hoạt động quản trị gần đây</Text>
          <TouchableOpacity onPress={() => openDetail('Nhật ký kiểm toán', 'Danh sách hoạt động quản trị đã được cập nhật trực tiếp từ dữ liệu trung tâm.')}>
            <Text className="text-blue-vibrant font-bold text-sm">Xem nhật ký kiểm toán</Text>
          </TouchableOpacity>
        </View>
        {recentActivity.map((log) => (
          <View key={log.id} className="flex-row items-center px-lg py-md border-b border-slate-50">
            <Text className="text-slate-400 text-xs w-12">{log.time}</Text>
            <Text className="text-slate-700 font-semibold text-xs w-20">{log.admin}</Text>
            <Text className="text-slate-600 text-xs flex-1">{log.action}</Text>
            <Text className="text-slate-800 font-medium text-xs w-40 mr-3" numberOfLines={1}>{log.target}</Text>
            <StatusBadge status={log.status === 'approved' ? 'approved' : log.status === 'rejected' ? 'rejected' : 'urgent'} />
          </View>
        ))}
      </View>
    </View>
  );

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'users': {
        const userItems: ActionItem[] = dashboardData.users.map((userItem) => ({
          id: userItem.id,
          label: userItem.name,
          description: `${userItem.email} • ${userItem.role} • ${userItem.region}`,
          status: userItem.status,
          onPress: () => {
            handleToggleUserStatus(userItem.id);
            openDetail('Chi tiết người dùng', `${userItem.name} đang được cập nhật trạng thái trực tiếp từ store trung tâm.`);
          },
        }));
        return (
          <InteractiveListSection
            title="Quản lý người dùng"
            description="Danh sách người dùng có thể tìm kiếm, lọc và cập nhật trạng thái trực tiếp."
            items={userItems}
            searchable
          />
        );
      }
      case 'organizers': {
        const organizerItems: ActionItem[] = dashboardData.organizers.map((organizer) => ({
          id: organizer.id,
          label: organizer.name,
          description: `${organizer.email} • ${organizer.sport} • ${organizer.registrations} đăng ký`,
          status: organizer.status,
          onPress: () => {
            handleToggleOrganizerStatus(organizer.id);
            openDetail('Chi tiết nhà tổ chức', `${organizer.name} đã được cập nhật trạng thái quản trị.`);
          },
        }));
        return (
          <InteractiveListSection
            title="Quản lý nhà tổ chức"
            description="Giám sát tổ chức, xác minh thông tin và cập nhật trạng thái nhà tổ chức."
            items={organizerItems}
            searchable
          />
        );
      }
      case 'moderation':
        return (
          <View>
            <View className="flex-row flex-wrap gap-md mb-lg">
              {[
                { label: 'Đang chờ xem xét', value: pendingApprovals.length.toString(), color: '#F59E0B' },
                { label: 'Bị gắn cờ hôm nay', value: '8', color: '#EF4444' },
                { label: 'Đã duyệt tuần này', value: approvedApprovals.toString(), color: '#22C55E' },
                { label: 'Đã từ chối', value: rejectedApprovals.toString(), color: '#64748B' },
              ].map((s) => (
                <View key={s.label} className="flex-1 min-w-[140px] bg-white border border-slate-200 rounded-xl p-md">
                  <Text className="text-slate-500 text-xs font-medium">{s.label}</Text>
                  <Text className="font-extrabold text-2xl mt-1" style={{ color: s.color }}>{s.value}</Text>
                </View>
              ))}
            </View>
            <View className="bg-white border border-slate-200 rounded-2xl p-xl">
              <Text className="text-slate-900 font-bold text-lg mb-2">Hàng đợi kiểm duyệt giải đấu</Text>
              <Text className="text-slate-500 text-sm mb-lg">Duyệt hoặc từ chối từng giải đấu và quan sát các số liệu được cập nhật ngay lập tức.</Text>
              {dashboardData.tournamentApprovals.map((item) => (
                <View key={item.id} className="flex-row items-center justify-between py-md border-b border-slate-100 last:border-b-0">
                  <View className="flex-1 mr-4">
                    <Text className="text-slate-700 font-medium text-sm">{item.name}</Text>
                    <Text className="text-slate-500 text-xs mt-1">{item.organization} · {item.sport}</Text>
                  </View>
                  <View className="items-end">
                    <StatusBadge status={item.status === 'pending' ? 'pending' : item.status === 'approved' ? 'approved' : 'rejected'} />
                    {item.status === 'pending' ? (
                      <View className="flex-row mt-2">
                        <TouchableOpacity onPress={() => handleApproveApproval(item.id)} className="mr-2">
                          <Text className="text-green-600 text-xs font-bold">Duyệt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRejectApproval(item.id)}>
                          <Text className="text-red-500 text-xs font-bold">Từ chối</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => openDetail('Trạng thái giải đấu', `${item.name} hiện đang ở trạng thái ${item.status === 'approved' ? 'đã duyệt' : 'đã từ chối'}.`)} className="mt-2">
                        <Text className="text-blue-vibrant text-xs font-bold">Xem chi tiết</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      case 'reports': {
        const reportItems: ActionItem[] = dashboardData.reports.map((report) => ({
          id: report.id,
          label: report.title,
          description: `${report.category} • ${report.owner} • ${report.date}`,
          status: report.priority,
          onPress: () => openDetail('Chi tiết báo cáo', `${report.title} đang mở trực tiếp từ dữ liệu trung tâm.`),
        }));
        return (
          <InteractiveListSection
            title="Báo cáo"
            description="Truy cập báo cáo toàn nền tảng và mở chi tiết trực tiếp từ store."
            items={reportItems}
            searchable
          />
        );
      }
      case 'analytics':
        return (
          <View>
            <View className="flex-row flex-wrap gap-md mb-lg">
              {[
                { label: 'Người dùng hoạt động hàng ngày', value: '18.2K' },
                { label: 'Giải đấu đã tạo', value: '342/tháng' },
                { label: 'Tỷ lệ đăng ký trung bình', value: '67%' },
                { label: 'Thời gian hoạt động nền tảng', value: '99.97%' },
              ].map((s) => (
                <View key={s.label} className="flex-1 min-w-[160px] bg-white border border-slate-200 rounded-xl p-md">
                  <Text className="text-slate-500 text-xs font-medium">{s.label}</Text>
                  <Text className="text-slate-900 font-extrabold text-xl mt-1">{s.value}</Text>
                </View>
              ))}
            </View>
            <InteractiveListSection
              title="Bảng phân tích"
              description="Mở các phân tích sâu về hiệu suất nền tảng và xu hướng tăng trưởng."
              items={[
                {
                  id: 'analytics-1',
                  label: 'Phân bố theo địa lý',
                  description: 'Xem khu vực phát triển nhanh nhất.',
                  onPress: () => openDetail('Phân bố địa lý', 'Bản phân tích theo khu vực sẽ được mở ngay sau đây.'),
                },
                {
                  id: 'analytics-2',
                  label: 'Phân tích theo môn thể thao',
                  description: 'So sánh số lượng giải đấu theo từng môn.',
                  onPress: () => openDetail('Phân tích môn thể thao', 'Dữ liệu theo môn thể thao đã được cập nhật.'),
                },
              ]}
            />
          </View>
        );
      case 'settings':
        return (
          <InteractiveListSection
            title="Cài đặt nền tảng"
            description="Cấu hình cờ tính năng và tích hợp trực tiếp từ danh sách điều khiển."
            items={[
              {
                id: 'settings-1',
                label: 'Cờ tính năng và triển khai',
                description: 'Bật hoặc tắt các tính năng mới cho toàn nền tảng.',
                onPress: () => openDetail('Cờ tính năng', 'Thông tin cài đặt tính năng đã sẵn sàng.'),
              },
              {
                id: 'settings-2',
                label: 'Cấu hình cổng thanh toán',
                description: 'Quản lý cấu hình thanh toán và tích hợp.',
                onPress: () => openDetail('Cổng thanh toán', 'Cấu hình cổng thanh toán đã được cập nhật.'),
              },
            ]}
          />
        );
      case 'support': {
        const supportItems: ActionItem[] = dashboardData.supportTickets.map((ticket) => ({
          id: ticket.id,
          label: ticket.subject,
          description: `${ticket.requester} • ${ticket.createdAt}`,
          status: ticket.status,
          onPress: () => handleResolveTicket(ticket.id),
        }));
        return (
          <View>
            <View className="flex-row flex-wrap gap-md mb-lg">
              <StatCard title="Ticket đang mở" value={dashboardData.supportTickets.filter((item) => item.status !== 'resolved').length.toString()} icon={Headphones} />
              <StatCard title="Khẩn cấp" value={dashboardData.supportTickets.filter((item) => item.priority === 'high').length.toString()} alert="Cần xử lý ngay" icon={AlertTriangle} />
              <StatCard title="Đã xử lý hôm nay" value={dashboardData.supportTickets.filter((item) => item.status === 'resolved').length.toString()} trend="+15% so với hôm qua" trendUp icon={CheckCircle2} />
              <StatCard title="Thời gian phản hồi trung bình" value="2.4h" trend="-8% so với tuần trước" trendUp icon={Clock} />
            </View>
            <InteractiveListSection
              title="Hỗ trợ & kiểm duyệt"
              description="Xử lý ticket và đánh dấu hoàn tất từ dữ liệu trung tâm."
              items={supportItems}
              searchable
            />
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 flex-row bg-slate-50 relative">
      <View className={`bg-slate-900 border-r border-slate-800 z-50 md:flex flex-col justify-between absolute md:relative h-full transition-all duration-300 ${isSidebarOpen ? 'left-0 w-64' : '-left-64 w-64 md:left-0'}`}>
        <View className="p-lg">
          <View className="flex-row items-center mb-xl">
            <View className="w-10 h-10 rounded-xl bg-blue-vibrant justify-center items-center">
              <Shield color="#FFFFFF" size={22} />
            </View>
            <View className="ml-sm">
              <Text className="text-white font-extrabold text-lg leading-tight">Quản trị CourtMate</Text>
              <Text className="text-slate-400 text-xs font-semibold">Quản trị hệ thống</Text>
            </View>
          </View>

          <View className="space-y-1">
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => { setActiveTab(id); setIsSidebarOpen(false); }}
                  className={`flex-row items-center p-md rounded-xl ${active ? 'bg-blue-vibrant/20 border-l-2 border-blue-vibrant' : ''}`}
                >
                  <Icon color={active ? '#FFFFFF' : '#94A3B8'} size={20} />
                  <Text className={`font-semibold ml-sm text-sm flex-1 ${active ? 'text-white' : 'text-slate-400'}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="p-lg border-t border-slate-800">
          <TouchableOpacity
            onPress={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className="bg-blue-vibrant py-md rounded-xl items-center mb-lg"
          >
            <Text className="text-white font-bold text-sm">Cài đặt chung</Text>
          </TouchableOpacity>
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-slate-700 justify-center items-center overflow-hidden mr-sm">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">{user?.name || 'Quản trị viên'}</Text>
              <Text className="text-slate-400 text-xs">
                {user?.role === UserRole.SUPER_ADMIN ? 'Quản trị viên cấp cao' : 'Quản trị viên khu vực'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="p-xs">
              <LogOut color="#EF4444" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isSidebarOpen && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/50 z-40 md:hidden"
          onPress={() => setIsSidebarOpen(false)}
        />
      )}

      <View className="flex-1 flex-col">
        <View className="h-16 border-b border-slate-200 bg-white px-lg flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-xs mr-sm">
              <Menu color="#334155" size={24} />
            </TouchableOpacity>
            <View>
              <Text className="text-slate-800 font-extrabold text-xl">{TAB_TITLES[activeTab]}</Text>
              {activeTab === 'overview' && (
                <Text className="text-slate-500 text-sm">{greeting()}, {user?.name || 'Quản trị viên'}. Giám sát và điều hành thời gian thực.</Text>
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-sm">
            <TouchableOpacity
              onPress={() => openDetail('Làm mới dữ liệu', 'Dữ liệu dashboard đã được làm mới từ nguồn mock trung tâm.')}
              className="flex-row items-center bg-white border border-slate-200 px-md py-sm rounded-xl mr-sm"
            >
              <RefreshCw color="#64748B" size={16} />
              <Text className="text-slate-600 font-semibold text-sm ml-2 hidden sm:flex">Làm mới</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('analytics')} className="flex-row items-center bg-white border border-slate-200 px-md py-sm rounded-xl">
              <Calendar color="#64748B" size={16} />
              <Text className="text-slate-600 font-semibold text-sm ml-2">30 ngày qua</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-lg" contentContainerStyle={{ paddingBottom: 40 }}>
          <TabContent />
        </ScrollView>
      </View>

      {detailModal && (
        <DetailModal
          visible={Boolean(detailModal)}
          title={detailModal.title}
          body={detailModal.body}
          onClose={closeDetail}
        />
      )}
    </View>
  );
}
