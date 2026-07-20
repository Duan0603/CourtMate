import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, Modal, TextInput, Alert,
} from 'react-native';
import {
  Trophy, ClipboardList, Users, Building2,
  Plus, LogOut, Check, Clock, X, ChevronRight,
  DollarSign, TrendingUp, BarChart2, CalendarDays,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLogin } from '../features/auth/hooks/useLogin';
import {
  getOrganizerMetrics,
  initialOrganizerDashboardData,
  type OrganizerDashboardData,
  type RegistrationItem,
} from './organizerMockData';

// ────────────── Design tokens ──────────────
const NAVY   = '#00102F';
const BLUE   = '#0077FF';
const YELLOW = '#FFC400';
const MUTED  = '#52627A';
const CANVAS = '#F7FAFF';
const BORDER = 'rgba(0,16,47,0.10)';
const GREEN  = '#16A34A';
const RED    = '#E8483B';

type OrgTab = 'overview' | 'tournaments' | 'registrations' | 'profile';

// ────────────── Sub-components ──────────────
function StatCard({ title, value, sub, icon: Icon, accent }: {
  title: string; value: string; sub?: string;
  icon: typeof Trophy; accent?: string;
}) {
  const color = accent || BLUE;
  return (
    <View style={[styles.statCard]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Icon color={color} size={20} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'draft' }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    approved:  { label: 'Đã duyệt',    bg: '#F0FDF4', color: GREEN },
    rejected:  { label: 'Từ chối',     bg: '#FFF1F1', color: RED },
    pending:   { label: 'Chờ duyệt',   bg: '#FFF9E6', color: '#B45309' },
    active:    { label: 'Đang mở',     bg: '#EFF6FF', color: BLUE },
    completed: { label: 'Kết thúc',    bg: '#F8FAFC', color: MUTED },
    draft:     { label: 'Nháp',        bg: '#F8FAFC', color: MUTED },
  };
  const m = map[status] ?? map.pending;
  return (
    <View style={[styles.badge, { backgroundColor: m.bg }]}>
      <Text style={[styles.badgeText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

// ────────────── Overview Tab ──────────────
function OverviewTab({
  orgName, metrics, registrations, onTab, onCreateTournament,
}: {
  orgName: string;
  metrics: ReturnType<typeof getOrganizerMetrics>;
  registrations: RegistrationItem[];
  onTab: (t: OrgTab) => void;
  onCreateTournament: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {/* Greeting */}
      <View style={styles.overviewHeader}>
        <View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.greetingName}>{orgName}</Text>
        </View>
        <TouchableOpacity onPress={onCreateTournament} style={styles.createBtn}>
          <Plus color="#fff" size={18} />
          <Text style={styles.createBtnText}>Tạo giải đấu</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard title="Giải đang mở" value={String(metrics.activeTournaments)} icon={Trophy} accent={BLUE} />
        <StatCard title="Chờ duyệt" value={String(metrics.pendingRegistrations)} icon={ClipboardList} accent="#B45309" />
        <StatCard title="Người tham gia" value={String(metrics.totalParticipants)} icon={Users} accent={GREEN} />
        <StatCard title="Doanh thu" value={metrics.monthlyRevenue} icon={DollarSign} accent={YELLOW} />
      </View>

      {/* Recent registrations */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Đơn đăng ký gần đây</Text>
          <TouchableOpacity onPress={() => onTab('registrations')}>
            <Text style={styles.cardLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {registrations.slice(0, 4).map(reg => (
          <View key={reg.id} style={styles.regRow}>
            <Image source={{ uri: reg.avatar }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.regName}>{reg.playerName}</Text>
              <Text style={styles.regSub}>{reg.tournamentName} · {reg.category}</Text>
            </View>
            <StatusBadge status={reg.status} />
          </View>
        ))}
      </View>

      {/* Quick actions */}
      <Text style={[styles.cardTitle, { marginTop: 20, marginBottom: 12 }]}>Thao tác nhanh</Text>
      <View style={styles.quickRow}>
        {[
          { label: 'Quản lý giải đấu', icon: Trophy, tab: 'tournaments' as OrgTab },
          { label: 'Duyệt đơn đăng ký', icon: ClipboardList, tab: 'registrations' as OrgTab },
          { label: 'Hồ sơ tổ chức', icon: Building2, tab: 'profile' as OrgTab },
        ].map(({ label, icon: Icon, tab }) => (
          <TouchableOpacity key={tab} onPress={() => onTab(tab)} style={styles.quickBtn}>
            <View style={[styles.quickIcon, { backgroundColor: BLUE + '15' }]}>
              <Icon color={BLUE} size={20} />
            </View>
            <Text style={styles.quickLabel}>{label}</Text>
            <ChevronRight color={MUTED} size={16} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ────────────── Tournaments Tab ──────────────
function TournamentsTab({
  data, onCreateTournament,
}: {
  data: OrganizerDashboardData;
  onCreateTournament: () => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <TouchableOpacity onPress={onCreateTournament} style={[styles.createBtn, { alignSelf: 'flex-start', marginBottom: 16 }]}>
        <Plus color="#fff" size={18} />
        <Text style={styles.createBtnText}>Tạo giải đấu mới</Text>
      </TouchableOpacity>
      {data.tournaments.map(t => (
        <View key={t.id} style={[styles.card, { marginBottom: 12 }]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t.name}</Text>
              <Text style={styles.regSub}>{t.sport} · {t.date}</Text>
            </View>
            <StatusBadge status={t.status} />
          </View>
          <Text style={[styles.regSub, { marginTop: 8 }]}>{t.description}</Text>
          <View style={[styles.divider, { marginVertical: 12 }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Users color={MUTED} size={14} />
            <Text style={[styles.regSub, { marginLeft: 6 }]}>{t.registrations} đăng ký</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ────────────── Registrations Tab ──────────────
function RegistrationsTab({ data }: { data: OrganizerDashboardData }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {data.registrations.map(reg => (
        <View key={reg.id} style={[styles.card, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: reg.avatar }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.regName}>{reg.playerName}</Text>
              <Text style={styles.regSub}>{reg.rating}</Text>
            </View>
            <StatusBadge status={reg.status} />
          </View>
          <View style={[styles.divider, { marginVertical: 12 }]} />
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.regSub}>Giải đấu</Text>
              <Text style={styles.regName}>{reg.tournamentName}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.regSub}>Hạng mục</Text>
              <Text style={styles.regName}>{reg.category}</Text>
            </View>
          </View>
          {reg.status === 'pending' && (
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: GREEN + '15', flex: 1 }]}
                onPress={() => Alert.alert('Đã duyệt', `Đã duyệt đăng ký của ${reg.playerName}`)}
              >
                <Check color={GREEN} size={16} />
                <Text style={[styles.actionBtnText, { color: GREEN }]}>Duyệt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: RED + '12', flex: 1 }]}
                onPress={() => Alert.alert('Đã từ chối', `Đã từ chối đăng ký của ${reg.playerName}`)}
              >
                <X color={RED} size={16} />
                <Text style={[styles.actionBtnText, { color: RED }]}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ────────────── Profile Tab ──────────────
function ProfileTab({ data }: { data: OrganizerDashboardData }) {
  const p = data.profile;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {/* Banner */}
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
        <Image source={{ uri: p.logo }} style={styles.profileLogo} />
        <Text style={[styles.cardTitle, { marginTop: 16, fontSize: 20 }]}>{p.name}</Text>
        <Text style={[styles.regSub, { textAlign: 'center', marginTop: 8 }]}>{p.description}</Text>
      </View>

      {/* Info */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Thông tin liên hệ</Text>
        {[
          { label: 'Email', value: p.contactEmail },
          { label: 'Điện thoại', value: p.phone },
          { label: 'Địa điểm', value: p.location },
        ].map(({ label, value }) => (
          <View key={label} style={{ marginBottom: 16 }}>
            <Text style={styles.regSub}>{label}</Text>
            <Text style={styles.regName}>{value}</Text>
            <View style={styles.divider} />
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Thống kê</Text>
        {[
          { label: 'Tổng giải đấu đã tổ chức', value: String(data.tournaments.length), icon: Trophy },
          { label: 'Tổng người tham gia', value: String(data.participants.length), icon: Users },
          { label: 'Tỷ lệ duyệt đơn', value: `${Math.round((data.registrations.filter(r => r.status === 'approved').length / data.registrations.length) * 100)}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={[styles.statIcon, { backgroundColor: BLUE + '15', marginRight: 12 }]}>
              <Icon color={BLUE} size={16} />
            </View>
            <Text style={[styles.regSub, { flex: 1 }]}>{label}</Text>
            <Text style={styles.regName}>{value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ────────────── Main Component ──────────────
export function OrganizerDashboard() {
  const { user, logout } = useLogin();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<OrgTab>('overview');
  const [dashboardData] = useState<OrganizerDashboardData>(initialOrganizerDashboardData);
  const metrics = useMemo(() => getOrganizerMetrics(dashboardData), [dashboardData]);
  const orgName = dashboardData.profile.name;

  const handleCreateTournament = () => {
    router.push('/create-tournament' as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn muốn đăng xuất khỏi tài khoản nhà tổ chức?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
      ],
    );
  };

  const TABS: { id: OrgTab; label: string; icon: typeof Trophy }[] = [
    { id: 'overview',       label: 'Tổng quan',  icon: BarChart2 },
    { id: 'tournaments',    label: 'Giải đấu',   icon: Trophy },
    { id: 'registrations',  label: 'Đăng ký',    icon: ClipboardList },
    { id: 'profile',        label: 'Hồ sơ',      icon: Building2 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: CANVAS }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.headerTitle}>CourtMate</Text>
            <Text style={styles.headerSub}>Nhà tổ chức</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'overview' && (
          <OverviewTab
            orgName={orgName}
            metrics={metrics}
            registrations={dashboardData.registrations}
            onTab={setActiveTab}
            onCreateTournament={handleCreateTournament}
          />
        )}
        {activeTab === 'tournaments' && (
          <TournamentsTab data={dashboardData} onCreateTournament={handleCreateTournament} />
        )}
        {activeTab === 'registrations' && (
          <RegistrationsTab data={dashboardData} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab data={dashboardData} />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const focused = activeTab === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveTab(id)}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
            >
              {focused && <View style={styles.tabIndicator} />}
              <Icon color={focused ? BLUE : '#B8C7E0'} size={22} strokeWidth={2} />
              <Text style={[styles.tabLabel, { color: focused ? '#FFFFFF' : '#B8C7E0' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ────────────── Styles ──────────────
const styles = StyleSheet.create({
  header: { backgroundColor: NAVY, borderBottomColor: 'rgba(255,255,255,0.10)', borderBottomWidth: 1 },
  headerInner: { height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#B8C7E0', fontSize: 13 },
  logoutBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  overviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  greeting: { color: MUTED, fontSize: 13 },
  greetingName: { color: NAVY, fontSize: 18, fontWeight: '700', marginTop: 2 },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: BLUE, paddingHorizontal: 16, height: 44, borderRadius: 12 },
  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginLeft: 6 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, minWidth: 140, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { color: NAVY, fontSize: 22, fontWeight: '700' },
  statTitle: { color: MUTED, fontSize: 12, marginTop: 4 },
  statSub: { color: MUTED, fontSize: 11, marginTop: 2 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { color: NAVY, fontSize: 16, fontWeight: '700' },
  cardLink: { color: BLUE, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 4 },

  regRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  regName: { color: NAVY, fontSize: 14, fontWeight: '600' },
  regSub: { color: MUTED, fontSize: 13, marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  quickRow: { gap: 10 },
  quickBtn: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, flexDirection: 'row', alignItems: 'center' },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quickLabel: { flex: 1, color: NAVY, fontSize: 14, fontWeight: '600' },

  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  profileLogo: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#FFFFFF' },

  tabBar: { height: 64, backgroundColor: NAVY, flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.10)' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', paddingTop: 8 },
  tabIndicator: { position: 'absolute', top: 0, width: 36, height: 3, borderRadius: 2, backgroundColor: BLUE },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 4 },
});
