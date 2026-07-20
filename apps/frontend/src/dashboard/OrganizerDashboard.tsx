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
  LayoutDashboard, Trophy, ClipboardList, Users, FileText,
  Building2, Plus, LogOut, Menu, Download, UserPlus, List,
  Check, Clock, DollarSign,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useLogin } from '../features/auth/hooks/useLogin';
import {
  getOrganizerMetrics,
  initialOrganizerDashboardData,
  type OrganizerDashboardData,
  type OrganizerProfile,
  type RegistrationItem,
} from './organizerMockData';

type OrganizerTab =
  | 'dashboard'
  | 'tournaments'
  | 'registrations'
  | 'participants'
  | 'reports'
  | 'profile';

type OrganizerStatus = 'pending' | 'approved' | 'rejected';

type ActionItem = {
  id: string;
  label: string;
  description?: string;
  status?: OrganizerStatus | 'active' | 'completed' | 'draft' | 'available' | 'occupied' | 'maintenance';
  onPress: () => void;
};

const SIDEBAR_ITEMS: { id: OrganizerTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'tournaments', label: 'Giải đấu của tôi', icon: Trophy },
  { id: 'registrations', label: 'Đơn đăng ký', icon: ClipboardList },
  { id: 'participants', label: 'Người tham gia', icon: Users },
  { id: 'reports', label: 'Báo cáo', icon: FileText },
  { id: 'profile', label: 'Hồ sơ tổ chức', icon: Building2 },
];

const TAB_TITLES: Record<OrganizerTab, string> = {
  dashboard: 'Tổng quan',
  tournaments: 'Giải đấu của tôi',
  registrations: 'Đơn đăng ký',
  participants: 'Người tham gia',
  reports: 'Báo cáo',
  profile: 'Hồ sơ tổ chức',
};

function StatCard({ title, value, badge, icon: Icon }: {
  title: string;
  value: string;
  badge?: string;
  icon: typeof Trophy;
}) {
  return (
    <View className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-2xl p-lg">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-slate-500 text-sm font-medium">{title}</Text>
          <Text className="text-slate-900 font-extrabold text-3xl mt-1">{value}</Text>
          {badge && (
            <View className="bg-green-50 px-2 py-0.5 rounded-full self-start mt-2">
              <Text className="text-green-600 text-xs font-bold">{badge}</Text>
            </View>
          )}
        </View>
        <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center">
          <Icon color="#64748B" size={20} />
        </View>
      </View>
    </View>
  );
}

function RegistrationStatus({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  if (status === 'approved') {
    return (
      <View className="flex-row items-center bg-green-50 px-2.5 py-1 rounded-full self-start">
        <Check color="#16A34A" size={12} />
        <Text className="text-green-700 text-xs font-bold ml-1">Đã duyệt</Text>
      </View>
    );
  }
  if (status === 'rejected') {
    return (
      <View className="flex-row items-center bg-red-50 px-2.5 py-1 rounded-full self-start">
        <Clock color="#EF4444" size={12} />
        <Text className="text-red-600 text-xs font-bold ml-1">Từ chối</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-full self-start">
      <Clock color="#64748B" size={12} />
      <Text className="text-slate-600 text-xs font-bold ml-1">Đang chờ</Text>
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

function OverviewContent({
  orgName,
  metrics,
  registrations,
  onOpenTab,
  onOpenDetail,
}: {
  orgName: string;
  metrics: ReturnType<typeof getOrganizerMetrics>;
  registrations: RegistrationItem[];
  onOpenTab: (tab: OrganizerTab) => void;
  onOpenDetail: (title: string, body: string) => void;
}) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const recentRegistrations = registrations.slice(0, 4);

  return (
    <View>
      <View className="flex-row justify-between items-start mb-lg">
        <View>
          <Text className="text-slate-900 font-extrabold text-2xl">Tổng quan</Text>
          <Text className="text-slate-500 text-sm mt-1">{greeting()}, {orgName}.</Text>
        </View>
        <TouchableOpacity onPress={() => onOpenDetail('Xuất dữ liệu', 'Đã chuẩn bị file export cho tổ chức của bạn.')} className="flex-row items-center bg-white border border-slate-200 px-md py-sm rounded-xl">
          <Download color="#64748B" size={16} />
          <Text className="text-slate-700 font-semibold text-sm ml-2">Xuất</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-md mb-xl">
        <StatCard title="Giải đấu đang hoạt động" value={metrics.activeTournaments.toString()} icon={Trophy} />
        <StatCard title="Đơn chờ duyệt" value={metrics.pendingRegistrations.toString()} badge={`+${metrics.pendingRegistrations} hôm nay`} icon={ClipboardList} />
        <StatCard title="Tổng người tham gia" value={metrics.totalParticipants.toString()} icon={Users} />
        <StatCard title="Doanh thu tháng" value={metrics.monthlyRevenue} icon={DollarSign} />
      </View>

      <View className="flex-row flex-wrap gap-lg">
        <View className="flex-1 min-w-[320px] bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <View className="flex-row justify-between items-center px-lg py-md border-b border-slate-100">
            <Text className="text-slate-900 font-bold text-base">Đơn đăng ký gần đây</Text>
            <TouchableOpacity onPress={() => onOpenTab('registrations')}><Text className="text-blue-vibrant font-bold text-sm">Xem tất cả</Text></TouchableOpacity>
          </View>

          <View className="flex-row bg-slate-50 px-lg py-sm border-b border-slate-100">
            <Text className="text-slate-400 font-bold text-xs uppercase flex-[2]">Người chơi</Text>
            <Text className="text-slate-400 font-bold text-xs uppercase flex-[1.5]">Giải đấu</Text>
            <Text className="text-slate-400 font-bold text-xs uppercase flex-1">Hạng mục</Text>
            <Text className="text-slate-400 font-bold text-xs uppercase w-24">Trạng thái</Text>
          </View>

          {recentRegistrations.map((reg) => (
            <View key={reg.id} className="flex-row items-center px-lg py-md border-b border-slate-50">
              <View className="flex-[2] flex-row items-center">
                <Image source={{ uri: reg.avatar }} className="w-9 h-9 rounded-full mr-3" />
                <View>
                  <Text className="text-slate-900 font-bold text-sm">{reg.playerName}</Text>
                  <Text className="text-slate-400 text-xs">{reg.rating}</Text>
                </View>
              </View>
              <Text className="text-slate-700 text-xs flex-[1.5] font-medium">{reg.tournamentName}</Text>
              <View className="flex-1">
                <View className="bg-blue-50 px-2 py-1 rounded-md self-start">
                  <Text className="text-blue-700 text-[10px] font-semibold">{reg.category}</Text>
                </View>
              </View>
              <View className="w-24">
                <RegistrationStatus status={reg.status} />
              </View>
            </View>
          ))}
        </View>

        <View className="w-full md:w-[300px]">
          <View className="bg-slate-900 rounded-2xl p-lg mb-lg">
            <Text className="text-white font-bold text-base mb-md">Thao tác nhanh</Text>
            {[
              { label: 'Tạo giải đấu mới', icon: Plus, onPress: () => { onOpenTab('tournaments'); onOpenDetail('Tạo giải đấu', 'Bạn đang mở màn hình tạo giải đấu mới.'); } },
              { label: 'Thêm người chơi thủ công', icon: UserPlus, onPress: () => { onOpenTab('participants'); onOpenDetail('Thêm người chơi', 'Bạn đang mở phần quản lý người tham gia.'); } },
              { label: 'Xuất danh sách đăng ký', icon: List, onPress: () => onOpenDetail('Xuất danh sách', 'Danh sách đăng ký đã được chuẩn bị để xuất.') },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity key={`${action.label}-${index}`} onPress={action.onPress} className="flex-row items-center py-md border-b border-slate-700 last:border-b-0">
                  <Icon color="#94A3B8" size={18} />
                  <Text className="text-slate-200 font-medium text-sm ml-3">{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </View>
    </View>
  );
}

function InteractiveSection({ title, description, items }: { title: string; description: string; items: ActionItem[] }) {
  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-xl">
      <Text className="text-slate-900 font-bold text-lg mb-2">{title}</Text>
      <Text className="text-slate-500 text-sm mb-lg">{description}</Text>
      {items.map((item) => (
        <TouchableOpacity key={item.id} onPress={item.onPress} className="flex-row items-start py-md border-b border-slate-100 last:border-b-0">
          <View className="flex-1">
            <Text className="text-slate-700 font-medium text-sm">{item.label}</Text>
            {item.description ? <Text className="text-slate-500 text-xs mt-1">{item.description}</Text> : null}
          </View>
          {item.status ? <View className="ml-2"><Text className="text-blue-vibrant text-xs font-semibold">{item.status}</Text></View> : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function OrganizerDashboard() {
  const { user, logout } = useLogin();
  const [activeTab, setActiveTab] = useState<OrganizerTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<OrganizerDashboardData>(initialOrganizerDashboardData);
  const [detailModal, setDetailModal] = useState<{ title: string; body: string } | null>(null);
  const [profileForm, setProfileForm] = useState<OrganizerProfile>(initialOrganizerDashboardData.profile);

  const orgName = user?.preferences?.clubName || user?.name || dashboardData.profile.name;
  const metrics = useMemo(() => getOrganizerMetrics(dashboardData), [dashboardData]);

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

  const handleApproveRegistration = (id: string) => {
    setDashboardData((prev) => ({
      ...prev,
      registrations: prev.registrations.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item)),
    }));
    openDetail('Duyệt đăng ký', 'Đơn đăng ký đã được chấp thuận thành công.');
  };

  const handleRejectRegistration = (id: string) => {
    setDashboardData((prev) => ({
      ...prev,
      registrations: prev.registrations.map((item) => (item.id === id ? { ...item, status: 'rejected' as const } : item)),
    }));
    openDetail('Từ chối đăng ký', 'Đơn đăng ký đã được chuyển sang trạng thái từ chối.');
  };

  const handleCreateTournament = () => {
    router.push('/create-tournament' as any);
  };

  const handleSaveProfile = () => {
    setDashboardData((prev) => ({ ...prev, profile: profileForm }));
    openDetail('Lưu hồ sơ', 'Thông tin tổ chức đã được cập nhật.');
  };

  const renderTournamentsTab = () => (
    <View className="flex-row flex-wrap gap-lg">
      <View className="flex-1 min-w-[320px] bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <View className="flex-row justify-between items-center px-lg py-md border-b border-slate-100">
          <Text className="text-slate-900 font-bold text-base">Danh sách giải đấu</Text>
          <TouchableOpacity onPress={handleCreateTournament} className="bg-blue-vibrant px-md py-sm rounded-xl">
            <Text className="text-white font-bold text-sm">Tạo giải đấu mới</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row bg-slate-50 px-lg py-sm border-b border-slate-100">
          <Text className="text-slate-400 font-bold text-xs uppercase flex-[2]">Tên giải đấu</Text>
          <Text className="text-slate-400 font-bold text-xs uppercase flex-1">Ngày</Text>
          <Text className="text-slate-400 font-bold text-xs uppercase w-24">Trạng thái</Text>
        </View>
        {dashboardData.tournaments.map((tournament) => (
          <TouchableOpacity key={tournament.id} onPress={() => openDetail(tournament.name, `${tournament.description}\n\nSố người đăng ký: ${tournament.registrations}`)} className="flex-row items-center px-lg py-md border-b border-slate-50">
            <View className="flex-[2]">
              <Text className="text-slate-900 font-bold text-sm">{tournament.name}</Text>
              <Text className="text-slate-500 text-xs mt-0.5">{tournament.sport}</Text>
            </View>
            <Text className="text-slate-600 text-xs flex-1">{tournament.date}</Text>
            <View className="w-24">
              <View className="px-2.5 py-1 rounded-full self-start bg-slate-100">
                <Text className="text-slate-600 text-[10px] font-bold uppercase">{tournament.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View className="w-full md:w-[300px]">
        <View className="bg-slate-900 rounded-2xl p-lg">
          <Text className="text-white font-bold text-base mb-md">Thao tác nhanh</Text>
          {[
            { label: 'Tạo giải đấu mới', onPress: handleCreateTournament },
            { label: 'Xem số lượng đăng ký', onPress: () => { setActiveTab('registrations'); openDetail('Đăng ký', 'Bạn đang xem danh sách đơn đăng ký'); } },
          ].map((action, index) => (
            <TouchableOpacity key={`${action.label}-${index}`} onPress={action.onPress} className="flex-row items-center py-md border-b border-slate-700 last:border-b-0">
              <Text className="text-slate-200 font-medium text-sm">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderRegistrationsTab = () => (
    <View className="flex-row flex-wrap gap-lg">
      <View className="flex-1 min-w-[320px] bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <View className="flex-row justify-between items-center px-lg py-md border-b border-slate-100">
          <Text className="text-slate-900 font-bold text-base">Đơn đăng ký</Text>
          <View className="flex-row gap-sm">
            <TouchableOpacity onPress={() => openDetail('Bộ lọc', 'Đang lọc các đơn đăng ký theo trạng thái chờ duyệt.')} className="bg-slate-100 px-md py-sm rounded-xl">
              <Text className="text-slate-600 text-xs font-bold">Chờ duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openDetail('Bộ lọc', 'Đang lọc các đơn đăng ký theo giải đấu hiện tại.')} className="bg-slate-100 px-md py-sm rounded-xl">
              <Text className="text-slate-600 text-xs font-bold">Theo giải đấu</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row bg-slate-50 px-lg py-sm border-b border-slate-100">
          <Text className="text-slate-400 font-bold text-xs uppercase flex-[2]">Người chơi</Text>
          <Text className="text-slate-400 font-bold text-xs uppercase flex-[1.5]">Giải đấu</Text>
          <Text className="text-slate-400 font-bold text-xs uppercase w-24">Trạng thái</Text>
        </View>
        {dashboardData.registrations.map((registration) => (
          <View key={registration.id} className="flex-row items-center px-lg py-md border-b border-slate-50">
            <View className="flex-[2] flex-row items-center">
              <Image source={{ uri: registration.avatar }} className="w-9 h-9 rounded-full mr-3" />
              <View>
                <Text className="text-slate-900 font-bold text-sm">{registration.playerName}</Text>
                <Text className="text-slate-400 text-xs">{registration.rating}</Text>
              </View>
            </View>
            <Text className="text-slate-700 text-xs flex-[1.5] font-medium">{registration.tournamentName}</Text>
            <View className="w-24">
              <RegistrationStatus status={registration.status} />
              {registration.status === 'pending' ? (
                <View className="flex-row mt-2">
                  <TouchableOpacity onPress={() => handleApproveRegistration(registration.id)} className="mr-2">
                    <Text className="text-green-600 text-xs font-bold">Duyệt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRejectRegistration(registration.id)}>
                    <Text className="text-red-500 text-xs font-bold">Từ chối</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>
      <View className="w-full md:w-[300px]">
        <View className="bg-slate-900 rounded-2xl p-lg">
          <Text className="text-white font-bold text-base mb-md">Tóm tắt</Text>
          <Text className="text-slate-300 text-sm">Đang có {dashboardData.registrations.filter((item) => item.status === 'pending').length} đơn chờ duyệt.</Text>
        </View>
      </View>
    </View>
  );

  const renderParticipantsTab = () => {
    const participantItems: ActionItem[] = dashboardData.participants.map((participant) => ({
      id: participant.id,
      label: participant.name,
      description: `${participant.tournamentName} • ${participant.role}`,
      onPress: () => openDetail('Chi tiết người tham gia', `${participant.name} là thành viên của ${participant.tournamentName}.`),
    }));
    return <InteractiveSection title="Danh sách người tham gia" description="Tìm kiếm và xem các hồ sơ tham gia từ tất cả các giải đấu." items={participantItems} />;
  };

  const renderReportsTab = () => (
    <View className="flex-row flex-wrap gap-lg">
      {dashboardData.reports.map((report) => (
        <View key={report.id} className="flex-1 min-w-[220px] bg-white border border-slate-200 rounded-2xl p-lg">
          <Text className="text-slate-500 text-sm font-medium">{report.title}</Text>
          <Text className="text-slate-900 font-extrabold text-3xl mt-2">{report.value}</Text>
          <Text className="text-slate-500 text-sm mt-2">{report.detail}</Text>
          <TouchableOpacity onPress={() => openDetail(report.title, `${report.detail} \nĐã tạo bản export giả lập.`)} className="mt-md bg-blue-vibrant rounded-xl px-md py-sm self-start">
            <Text className="text-white font-bold text-sm">Xuất</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderProfileTab = () => (
    <View className="flex-row flex-wrap gap-lg">
      <View className="flex-1 min-w-[320px] bg-white border border-slate-200 rounded-2xl p-lg">
        <Text className="text-slate-900 font-bold text-lg mb-4">Thông tin tổ chức</Text>
        <View className="mb-md">
          <Text className="text-slate-500 text-sm mb-1">Tên tổ chức</Text>
          <TextInput value={profileForm.name} onChangeText={(text) => setProfileForm((prev) => ({ ...prev, name: text }))} className="border border-slate-200 rounded-xl px-md py-sm" />
        </View>
        <View className="mb-md">
          <Text className="text-slate-500 text-sm mb-1">Email liên hệ</Text>
          <TextInput value={profileForm.contactEmail} onChangeText={(text) => setProfileForm((prev) => ({ ...prev, contactEmail: text }))} className="border border-slate-200 rounded-xl px-md py-sm" />
        </View>
        <View className="mb-md">
          <Text className="text-slate-500 text-sm mb-1">Số điện thoại</Text>
          <TextInput value={profileForm.phone} onChangeText={(text) => setProfileForm((prev) => ({ ...prev, phone: text }))} className="border border-slate-200 rounded-xl px-md py-sm" />
        </View>
        <View className="mb-md">
          <Text className="text-slate-500 text-sm mb-1">Địa điểm</Text>
          <TextInput value={profileForm.location} onChangeText={(text) => setProfileForm((prev) => ({ ...prev, location: text }))} className="border border-slate-200 rounded-xl px-md py-sm" />
        </View>
        <View className="mb-md">
          <Text className="text-slate-500 text-sm mb-1">Mô tả</Text>
          <TextInput multiline value={profileForm.description} onChangeText={(text) => setProfileForm((prev) => ({ ...prev, description: text }))} className="border border-slate-200 rounded-xl px-md py-sm h-24" />
        </View>
        <TouchableOpacity onPress={handleSaveProfile} className="bg-blue-vibrant rounded-xl px-md py-sm self-start">
          <Text className="text-white font-bold text-sm">Lưu</Text>
        </TouchableOpacity>
      </View>
      <View className="w-full md:w-[300px]">
        <View className="bg-slate-900 rounded-2xl p-lg">
          <Text className="text-white font-bold text-base mb-md">Xem trước</Text>
          <Image source={{ uri: profileForm.logo }} className="w-full h-28 rounded-xl mb-md" />
          <Text className="text-white font-bold text-base">{profileForm.name}</Text>
          <Text className="text-slate-400 text-sm mt-1">{profileForm.description}</Text>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewContent orgName={orgName} metrics={metrics} registrations={dashboardData.registrations} onOpenTab={setActiveTab} onOpenDetail={openDetail} />;
      case 'tournaments':
        return renderTournamentsTab();
      case 'registrations':
        return renderRegistrationsTab();
      case 'participants':
        return renderParticipantsTab();
      case 'reports':
        return renderReportsTab();
      case 'profile':
        return renderProfileTab();
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 flex-row bg-slate-50 relative">
      <View className={`bg-slate-900 border-r border-slate-800 z-50 md:flex flex-col justify-between absolute md:relative h-full transition-all duration-300 ${isSidebarOpen ? 'left-0 w-64' : '-left-64 w-64 md:left-0'}`}>
        <View className="p-lg flex-1">
          <View className="mb-xl">
            <Text className="text-white font-extrabold text-xl">CourtMate</Text>
            <Text className="text-slate-400 text-xs font-semibold mt-0.5">Trung tâm nhà tổ chức</Text>
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
                  <Text className={`font-semibold ml-sm text-sm ${active ? 'text-white' : 'text-slate-400'}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="p-lg border-t border-slate-800">
          <TouchableOpacity onPress={handleCreateTournament} className="bg-blue-vibrant py-md rounded-xl flex-row items-center justify-center mb-lg">
            <Plus color="#FFFFFF" size={18} />
            <Text className="text-white font-bold text-sm ml-2">Tạo giải đấu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center py-sm">
            <LogOut color="#94A3B8" size={16} />
            <Text className="text-slate-400 text-xs font-medium ml-2">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isSidebarOpen && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/50 z-40 md:hidden"
          onPress={() => setIsSidebarOpen(false)}
        />
      )}

      <View className="flex-1 flex-col">
        <View className="h-16 border-b border-slate-200 bg-white px-lg flex-row items-center">
          <TouchableOpacity onPress={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-xs mr-sm">
            <Menu color="#334155" size={24} />
          </TouchableOpacity>
          <Text className="text-slate-800 font-extrabold text-xl">{TAB_TITLES[activeTab]}</Text>
        </View>

        <ScrollView className="flex-1 p-lg" contentContainerStyle={{ paddingBottom: 40 }}>
          {renderTabContent()}
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
