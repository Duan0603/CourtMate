import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, RefreshControl, Animated,
} from 'react-native';
import {
  Trophy, ClipboardList, Users, Building2, MessageCircle,
  Plus, LogOut, Check, X, ChevronRight, Send, Search, CheckCheck,
  DollarSign, TrendingUp, BarChart2, ArrowLeft, UserRound, Award,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { User } from '@courtmate/shared';
import { useLogin } from '../features/auth/hooks/useLogin';
import { authApi } from '../features/auth/services/auth.api';
import {
  getOrganizerMetrics,
  initialOrganizerDashboardData,
  type OrganizerDashboardData,
  type RegistrationItem,
} from './organizerMockData';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
interface ChatMessage { _id: string; senderId: string; senderName: string; content: string; createdAt: string; }

// ────────────── Design tokens ──────────────
const NAVY   = '#00102F';
const BLUE   = '#0077FF';
const YELLOW = '#FFC400';
const MUTED  = '#52627A';
const CANVAS = '#F7FAFF';
const BORDER = 'rgba(0,16,47,0.10)';
const GREEN  = '#16A34A';
const RED    = '#E8483B';

type OrgTab = 'overview' | 'tournaments' | 'registrations' | 'messages' | 'profile';

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

// ────────────── Chat Tab ──────────────
function UnreadBadge({ count }: { count: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (count === 0) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 20, bounciness: 12 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 8  }),
    ]).start();
  }, [count]);
  if (count === 0) return null;
  return (
    <Animated.View style={{ transform: [{ scale }], minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: YELLOW, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: NAVY, fontSize: 13, fontWeight: '700', lineHeight: 16 }}>{count > 99 ? '99+' : count}</Text>
    </Animated.View>
  );
}

function SeenReceipt({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 2, marginBottom: 4, marginRight: 2 }}>
      <CheckCheck color={BLUE} size={13} />
      <Text style={{ color: BLUE, fontSize: 11, fontWeight: '600', marginLeft: 3 }}>Đã xem</Text>
    </View>
  );
}

function ChatTab({ user, token, isAuthenticated }: {
  user: any; token: string | null; isAuthenticated: boolean;
}) {
  const [friends, setFriends]           = useState<User[]>([]);
  const [activeFriend, setActiveFriend] = useState<User | null>(null);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [message, setMessage]           = useState('');
  const [query, setQuery]               = useState('');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [connected, setConnected]       = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastSeenByFriend, setLastSeenByFriend] = useState<string | null>(null);

  const socketRef       = useRef<Socket | null>(null);
  const messagesRef     = useRef<ScrollView>(null);
  const activeFriendRef = useRef<User | null>(null);

  useEffect(() => { activeFriendRef.current = activeFriend; }, [activeFriend]);

  const loadFriends = useCallback(async (refresh = false) => {
    if (!token) return;
    refresh ? setRefreshing(true) : setLoading(true);
    try { setFriends(await authApi.getFriends(token)); }
    catch { setFriends([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { if (isAuthenticated) loadFriends(); }, [isAuthenticated, loadFriends]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const myId = user.id || user._id;
    const socket = io(API_URL, { transports: ['websocket'], forceNew: true });
    socketRef.current = socket;

    socket.on('connect', () => { setConnected(true); socket.emit('register_user', { userId: myId }); });
    socket.on('disconnect',    () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
      setTimeout(() => messagesRef.current?.scrollToEnd({ animated: false }), 80);
    });

    socket.on('receive_message', (incoming: ChatMessage) => {
      setMessages(prev => [...prev, incoming]);
      setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 80);
      const curFriend   = activeFriendRef.current;
      const curFriendId = curFriend ? ((curFriend as any).id || (curFriend as any)._id) : null;
      if (incoming.senderId !== myId && incoming.senderId === curFriendId && socketRef.current) {
        socketRef.current.emit('mark_seen', { roomId: [myId, curFriendId].sort().join('_'), userId: myId, lastMessageId: incoming._id });
      } else if (incoming.senderId !== myId) {
        setUnreadCounts(prev => ({ ...prev, [incoming.senderId]: (prev[incoming.senderId] || 0) + 1 }));
      }
    });

    socket.on('message_seen', ({ userId, lastMessageId }: { userId: string; lastMessageId: string }) => {
      const curFriend   = activeFriendRef.current;
      const curFriendId = curFriend ? ((curFriend as any).id || (curFriend as any)._id) : null;
      if (userId === curFriendId) setLastSeenByFriend(lastMessageId);
    });

    return () => { socket.disconnect(); };
  }, [isAuthenticated, user]);

  const openChat = (friend: User) => {
    const friendId = (friend as any).id || (friend as any)._id;
    setUnreadCounts(prev => ({ ...prev, [friendId]: 0 }));
    setLastSeenByFriend(null);
    setActiveFriend(friend);
  };

  useEffect(() => {
    if (!activeFriend || !connected || !user || !socketRef.current) return;
    const myId     = user.id || user._id;
    const friendId = (activeFriend as any).id || (activeFriend as any)._id;
    const roomId   = [myId, friendId].sort().join('_');
    socketRef.current.emit('join_room', { roomId });
    socketRef.current.emit('mark_seen', { roomId, userId: myId, lastMessageId: 'all' });
  }, [activeFriend, connected, user]);

  const sendMessage = () => {
    if (!message.trim() || !connected || !activeFriend || !user || !socketRef.current) return;
    const myId     = user.id || user._id;
    const friendId = (activeFriend as any).id || (activeFriend as any)._id;
    socketRef.current.emit('send_message', {
      roomId: [myId, friendId].sort().join('_'), senderId: myId,
      senderName: user.name || user.email?.split('@')[0], receiverId: friendId, content: message.trim(),
    });
    setMessage('');
  };

  const visibleFriends = friends.filter(f =>
    `${(f as any).name} ${(f as any).email}`.toLowerCase().includes(query.toLowerCase())
  );

  if (activeFriend) {
    const myId = user?.id || user?._id;
    const lastSeenIndex = (() => {
      if (!lastSeenByFriend) return -1;
      if (lastSeenByFriend === 'all') {
        for (let i = messages.length - 1; i >= 0; i--) { if (messages[i].senderId === myId) return i; }
        return -1;
      }
      return messages.findIndex(m => m._id === lastSeenByFriend);
    })();

    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F7FAFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ backgroundColor: NAVY, flexDirection: 'row', alignItems: 'center', height: 60, paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={() => setActiveFriend(null)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' }}>
            <UserRound color="#FFFFFF" size={20} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{(activeFriend as any).name || (activeFriend as any).email?.split('@')[0]}</Text>
            <Text style={{ color: connected ? '#B8C7E0' : '#FFC4C0', fontSize: 13 }}>{connected ? '● Đã kết nối' : '● Mất kết nối'}</Text>
          </View>
        </View>

        {!connected && (
          <View style={{ backgroundColor: '#FFF2F1', padding: 10 }}>
            <Text style={{ color: '#A62F27', fontSize: 13 }}>Đang mất kết nối. Tin nhắn chưa thể gửi.</Text>
          </View>
        )}

        <ScrollView ref={messagesRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: messages.length ? 'flex-start' : 'center' }}>
          {!messages.length
            ? <Text style={{ color: MUTED, textAlign: 'center', fontSize: 15 }}>Bắt đầu cuộc trò chuyện.</Text>
            : messages.map((item, index) => {
                const mine = item.senderId === myId;
                const showSeen = mine && index === lastSeenIndex;
                return (
                  <View key={item._id}>
                    <View style={{
                      alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%',
                      backgroundColor: mine ? BLUE : '#FFFFFF',
                      borderWidth: mine ? 0 : 1, borderColor: BORDER,
                      borderRadius: 16, borderBottomRightRadius: mine ? 4 : 16,
                      borderBottomLeftRadius: mine ? 16 : 4,
                      paddingHorizontal: 14, paddingVertical: 10, marginBottom: 2,
                    }}>
                      <Text style={{ color: mine ? '#FFFFFF' : NAVY, fontSize: 15 }}>{item.content}</Text>
                    </View>
                    <SeenReceipt visible={showSeen} />
                  </View>
                );
              })
          }
        </ScrollView>

        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER, flexDirection: 'row', alignItems: 'flex-end' }}>
          <TextInput value={message} onChangeText={setMessage} placeholder="Nhập tin nhắn…" placeholderTextColor="#7B8AA3" multiline style={{ flex: 1, minHeight: 48, maxHeight: 112, borderRadius: 16, backgroundColor: '#F1F6FD', color: NAVY, fontSize: 15, paddingHorizontal: 16, paddingVertical: 12 }} />
          <TouchableOpacity disabled={!message.trim() || !connected} onPress={sendMessage} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: message.trim() && connected ? BLUE : '#B7C5D8', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
            <Send color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ color: NAVY, fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Tin nhắn</Text>
        <View style={{ height: 46, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Search color={MUTED} size={18} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Tìm người dùng..." placeholderTextColor={MUTED} style={{ flex: 1, color: NAVY, fontSize: 15, marginLeft: 8 }} />
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color={BLUE} style={{ marginTop: 48 }} /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFriends(true)} tintColor={BLUE} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {!visibleFriends.length ? (
            <View style={{ marginTop: 60, alignItems: 'center', paddingHorizontal: 24 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle color={YELLOW} size={30} />
              </View>
              <Text style={{ color: NAVY, fontSize: 18, fontWeight: '700', marginTop: 20, textAlign: 'center' }}>Chưa có cuộc trò chuyện</Text>
              <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', marginTop: 8 }}>Người chơi liên hệ với bạn sẽ xuất hiện ở đây.</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' }}>
              {visibleFriends.map((friend, index) => {
                const id        = (friend as any).id || (friend as any)._id;
                const isOrg     = (friend as any).role === 'ORGANIZER';
                const unread    = unreadCounts[id] || 0;
                const hasUnread = unread > 0;
                return (
                  <TouchableOpacity key={id} activeOpacity={0.75} onPress={() => openChat(friend)} style={{ minHeight: 72, padding: 12, flexDirection: 'row', alignItems: 'center', borderTopWidth: index ? 1 : 0, borderTopColor: BORDER, backgroundColor: hasUnread ? '#EEF5FF' : '#FFFFFF' }}>
                    <View style={{ position: 'relative' }}>
                      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}>
                        <UserRound color="#FFFFFF" size={20} />
                      </View>
                      {hasUnread && <View style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#FFFFFF' }} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: NAVY, fontSize: 15, fontWeight: hasUnread ? '700' : '600' }} numberOfLines={1}>{(friend as any).name || (friend as any).email?.split('@')[0]}</Text>
                        {isOrg && <Award color={YELLOW} size={15} style={{ marginLeft: 6 }} />}
                      </View>
                      <Text style={{ color: hasUnread ? BLUE : MUTED, fontSize: 13, fontWeight: hasUnread ? '600' : '400' }} numberOfLines={1}>
                        {hasUnread ? `${unread} tin nhắn mới` : isOrg ? 'Ban tổ chức · Nhấn để trò chuyện' : 'Người chơi · Nhấn để trò chuyện'}
                      </Text>
                    </View>
                    <UnreadBadge count={unread} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ────────────── Main Component ──────────────
export function OrganizerDashboard() {
  const { user, logout, token, isAuthenticated } = useLogin();
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
    { id: 'messages',       label: 'Nhắn tin',   icon: MessageCircle },
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
        {activeTab === 'messages' && (
          <ChatTab user={user} token={token} isAuthenticated={isAuthenticated} />
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
