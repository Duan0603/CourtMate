import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Tabs, router, useGlobalSearchParams, usePathname } from 'expo-router';
import { Bell, MessageCircle, Trophy, UserRound, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogin } from '../../src/features/auth/hooks/useLogin';

const NAVY = '#00102F';
const BLUE = '#0077FF';
const YELLOW = '#FFC400';
const MUTED = '#B8C7E0';

export const HeaderScrollContext = React.createContext({
  isScrolled: false,
  setIsScrolled: (_value: boolean) => {},
});

const TAB_META: Record<string, { label: string; icon: typeof Trophy }> = {
  dashboard: { label: 'Giải đấu', icon: Trophy },
  chat: { label: 'Trò chuyện', icon: MessageCircle },
  profile: { label: 'Hồ sơ', icon: UserRound },
};

function CourtMateTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const params = useGlobalSearchParams<{ view?: string; chatting?: string }>();
  if (params.view === 'edit-profile' || params.view === 'schedule' || params.chatting === 'true') return null;

  const routes = state.routes.filter((route: any) => TAB_META[route.name]);
  return (
    <View
      style={{
        height: 64 + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: NAVY,
        borderTopColor: 'rgba(255,255,255,0.12)',
        borderTopWidth: 1,
        flexDirection: 'row',
      }}
    >
      {routes.map((route: any) => {
        const routeIndex = state.routes.findIndex((item: any) => item.key === route.key);
        const focused = state.index === routeIndex;
        const meta = TAB_META[route.name];
        const Icon = meta.icon;
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            activeOpacity={0.75}
            onPress={() => focused ? undefined : navigation.navigate(route.name)}
            style={{ flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            {focused && <View style={{ position: 'absolute', top: 0, width: 36, height: 3, borderRadius: 2, backgroundColor: BLUE }} />}
            <Icon color={focused ? BLUE : MUTED} size={22} strokeWidth={2} />
            <Text style={{ marginTop: 4, color: focused ? '#FFFFFF' : MUTED, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function BrandHeader({ title, unreadCount, onNotifications }: { title: string; unreadCount: number; onNotifications: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: NAVY, borderBottomColor: 'rgba(255,255,255,0.12)', borderBottomWidth: 1 }}>
      <View style={{ height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 15, height: 15, borderRadius: 8, borderWidth: 4, borderColor: BLUE }} />
            <View style={{ position: 'absolute', right: 3, top: 3, width: 9, height: 9, borderRadius: 5, backgroundColor: YELLOW }} />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '600' }}>CourtMate</Text>
            <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>{title}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity accessibilityLabel={`Thông báo, ${unreadCount} chưa đọc`} onPress={onNotifications} activeOpacity={0.7} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Bell color="#FFFFFF" size={22} />
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', right: 2, top: 2, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: YELLOW, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: NAVY, fontSize: 12, fontWeight: '600' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isLoading, user } = useLogin();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ view?: string; chatting?: string }>();
  const isEditProfile = params.view === 'edit-profile';
  const isChatting = params.chatting === 'true';
  const shouldHideHeader = isEditProfile || isChatting;

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/");
      } else if (user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') {
        router.replace("/admin");
      } else if (user?.role === 'ORGANIZER') {
        router.replace("/organizer");
      }
    }
  }, [isAuthenticated, isLoading, user?.role]);


  const insets = useSafeAreaInsets();
  const [searchVal, setSearchVal] = React.useState("");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, title: 'Hồ sơ đăng ký đã được duyệt', body: 'Ban tổ chức đã xác nhận lượt đăng ký gần nhất.', unread: true },
    { id: 2, title: 'Nguồn giải đấu mới', body: 'CourtMate vừa cập nhật dữ liệu giải đấu từ cộng đồng.', unread: true },
  ]);

  if (isLoading || !isAuthenticated || user?.role === 'REGIONAL_ADMIN' || user?.role === 'ORGANIZER') {
    return null;
  }

  const handleSearchSubmit = () => {
    router.push({
      pathname: "/(tabs)/dashboard",
      params: { search: searchVal }
    });
  };

  const handleSearchChange = (text: string) => {
    setSearchVal(text);
    router.push({
      pathname: "/(tabs)/dashboard",
      params: { search: text }
    });
  };

  if (isLoading || !isAuthenticated || user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') return null;

  const hiddenChrome = params.view === 'edit-profile' || params.view === 'schedule' || params.chatting === 'true';
  const title = pathname.includes('chat') ? 'Trò chuyện' : pathname.includes('profile') ? 'Hồ sơ' : 'Giải đấu';
  const unreadCount = notifications.filter(item => item.unread).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
      {!hiddenChrome && <BrandHeader title={title} unreadCount={unreadCount} onNotifications={() => setNotificationsOpen(true)} />}
      <View style={{ flex: 1 }}>
        <Tabs tabBar={(props) => <CourtMateTabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="dashboard" />
          <Tabs.Screen name="tracker" options={{ href: null }} />
          <Tabs.Screen name="chat" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>

      <Modal visible={notificationsOpen} transparent animationType="fade" onRequestClose={() => setNotificationsOpen(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setNotificationsOpen(false)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,16,47,0.48)' }}>
          <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{ maxHeight: '70%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32 }}>
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,16,47,0.18)', alignSelf: 'center', marginTop: 8 }} />
            <View style={{ height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600' }}>Thông báo</Text>
              <TouchableOpacity accessibilityLabel="Đóng thông báo" onPress={() => setNotificationsOpen(false)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <X color={NAVY} size={22} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
              {notifications.map(item => (
                <View key={item.id} style={{ paddingVertical: 16, borderTopColor: 'rgba(0,16,47,0.10)', borderTopWidth: 1, flexDirection: 'row' }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.unread ? BLUE : 'transparent', marginTop: 6, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: NAVY, fontSize: 16, lineHeight: 24, fontWeight: '600' }}>{item.title}</Text>
                    <Text style={{ color: '#52627A', fontSize: 14, lineHeight: 20, marginTop: 4 }}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setNotifications(prev => prev.map(item => ({ ...item, unread: false })))} style={{ marginHorizontal: 16, height: 48, borderRadius: 12, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Đánh dấu tất cả đã đọc</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
