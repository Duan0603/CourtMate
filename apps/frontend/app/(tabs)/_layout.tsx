import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, TextInput, Modal, ScrollView, Alert } from "react-native";
import { Tabs, router, useGlobalSearchParams, usePathname } from "expo-router";
import {
  Trophy,
  MessageCircle,
  User as UserIcon,
  Bell,
  Search,
  SlidersHorizontal,
  Calendar,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLogin } from "../../src/features/auth/hooks/useLogin";

export const HeaderScrollContext = React.createContext<{
  isScrolled: boolean;
  setIsScrolled: (val: boolean) => void;
}>({
  isScrolled: false,
  setIsScrolled: () => {},
});

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { routes, index: activeIndex } = state;
  const params = useGlobalSearchParams<{ view?: string; chatting?: string }>();
  const isEditProfile = params.view === 'edit-profile';
  const isChatting = params.chatting === 'true';

  if (isEditProfile || isChatting) return null;

  return (
    <View 
      style={styles.tabBar}
      className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/80 flex-row items-center justify-around px-6 z-50"
    >
      {routes.map((route: any, index: number) => {
        if (route.name === 'tracker') return null;

        const isFocused = activeIndex === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Determine icon and colors based on active tab
        let IconComponent = Trophy;
        const activeBg = 'bg-blue-50';
        const activeColor = '#2563eb';

        if (route.name === 'chat') {
          IconComponent = MessageCircle;
        } else if (route.name === 'profile') {
          IconComponent = UserIcon;
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className={`w-12 h-12 rounded-full justify-center items-center active:scale-95 transition-all duration-300 ${
              isFocused ? activeBg : 'bg-transparent'
            }`}
            activeOpacity={0.8}
          >
            <IconComponent color={isFocused ? activeColor : '#64748b'} size={22} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isLoading, user } = useLogin();
  
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
      }
    }
  }, [isAuthenticated, isLoading, user?.role]);


  const insets = useSafeAreaInsets();
  const [searchVal, setSearchVal] = React.useState("");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      title: "Đăng ký giải đấu thành công 🎉",
      description: "Chúc mừng! Bạn đã đăng ký thành công giải đấu Elite Clay Masters 2026.",
      time: "2 phút trước",
      read: false,
    },
    {
      id: 2,
      title: "Ứng dụng cập nhật v2.1.0 📢",
      description: "Giao diện CourtMate đã được làm mới với Lịch thi đấu và collapsing header cao cấp.",
      time: "1 giờ trước",
      read: false,
    },
    {
      id: 3,
      title: "Tin nhắn mới từ ban tổ chức 💬",
      description: "Lịch thi đấu của bạn vào ngày 20/07 đã được phê duyệt.",
      time: "Hôm qua",
      read: true,
    }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMJuy6DPTqraCzbCGubSvOP_URsWJZHNJdT3BWRGY1bvEm9xwAyauxG6VpB7rC5XmVBCygMlDvVJOQ9_BDSklP_N-dAAw02nnphfApJqsPAJfaHESPRjgqKrLx25HLZnFe1tjkuVKicL5_Q364S_d6cpCuIdLDneJ62m--bp2QgHysZXK-s_lKzBN7gkQQ6h-Lrrnqe1Pn3PC_dzn1ncmbv98ZhfFCTz7NZyb8LktIbwbW85rjvAwLxuhbHTcn0axGUws92p08rM0';
  const userAvatar = user?.preferences?.avatarUrl && user.preferences.avatarUrl !== defaultAvatar
    ? { uri: user.preferences.avatarUrl }
    : require("../../assets/images/woman_avatar.png");
  const pathname = usePathname();
  const isDashboard = pathname === '/home' || pathname === '/';

  if (isLoading || !isAuthenticated || user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') {
    return null;
  }

  const handleSearchSubmit = () => {
    router.push({
      pathname: "/(tabs)/home" as any,
      params: { search: searchVal }
    });
  };

  const handleSearchChange = (text: string) => {
    setSearchVal(text);
    router.push({
      pathname: "/(tabs)/home" as any,
      params: { search: text }
    });
  };

  const showCollapsed = isScrolled || !isDashboard;
  const contentPaddingTop = shouldHideHeader 
    ? 0 
    : (isDashboard ? 0 : 56 + insets.top);

  const shouldShowSearchActions = !showCollapsed || Platform.OS === 'web';

  return (
    <HeaderScrollContext.Provider value={{ isScrolled, setIsScrolled }}>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Unified top taskbar header */}
        {!shouldHideHeader && (
          <View 
            className="header-container"
            style={[
              Platform.OS === 'web' ? { position: 'fixed', top: 0, left: 0, right: 0 } as any : { position: 'absolute', top: 0, left: 0, right: 0 },
              { 
                paddingTop: insets.top,
                backgroundColor: showCollapsed ? '#FFFFFF' : 'transparent',
                borderBottomWidth: showCollapsed ? 1 : 0,
                borderBottomColor: '#E0E0E0',
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                zIndex: 50
              },
              showCollapsed ? styles.headerScrolledShadow : null
            ]}
          >
            <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
              {/* Top Row (User & Status) */}
              <View className="header-top-row flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-4">
                  <TouchableOpacity 
                    onPress={() => router.push('/profile?view=edit-profile')} 
                    className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 active:scale-95 transition-transform"
                  >
                    <Image source={userAvatar} className="header-avatar w-full h-full object-cover" />
                  </TouchableOpacity>
                  <View className="ml-3 flex-1">
                    <Text className="header-greeting text-[16px] font-bold text-[#1A1A1A]">
                      Xin chào, {user?.name || "Phúc"}! 👋
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => setIsNotificationsOpen(true)}
                  className="relative p-1 active:scale-95"
                >
                  <Bell color="#76777D" size={22} />
                  {unreadCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      right: -4,
                      top: -4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: '#2563eb', // CourtMate Blue
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 3,
                    }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' }}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Central Search Bar & Action Buttons (Collapsible) */}
              {shouldShowSearchActions && (
                <View 
                  className="collapsible-content overflow-hidden" 
                  style={Platform.OS === 'web' && !isDashboard ? { display: 'none' } : undefined}
                >
                  {/* Central Search Bar */}
                  <View className="search-bar flex-row items-center bg-[#F1F3F4] rounded-full h-11 px-4 mt-3">
                    <Search color="#76777D" size={18} />
                    <TextInput 
                      placeholder="Tìm kiếm..." 
                      placeholderTextColor="#76777D"
                      className="flex-1 ml-2 font-medium text-slate-800 h-full text-[14px]"
                      style={Platform.OS === 'web' ? { outline: 'none', borderStyle: 'none' } as any : undefined}
                      value={searchVal}
                      onChangeText={handleSearchChange}
                      onSubmitEditing={handleSearchSubmit}
                    />
                    <TouchableOpacity 
                      onPress={() => {
                        // Toggle search filter in dashboard
                        router.push({
                          pathname: "/(tabs)/home" as any,
                          params: { filter: 'true' }
                        });
                      }}
                      className="p-1 active:scale-95"
                    >
                      <SlidersHorizontal color="#76777D" size={18} />
                    </TouchableOpacity>
                  </View>

                  {/* Bottom Action Buttons */}
                  <View className="action-buttons flex-row gap-3 mt-3">
                    <TouchableOpacity
                      onPress={() => router.push('/profile?view=schedule')}
                      className="flex-1 flex-row items-center h-12 bg-white rounded-xl border border-[#E0E0E0] px-3 active:scale-[0.98]"
                      style={styles.actionButtonShadow}
                    >
                      <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                        <Calendar color="#2563eb" size={16} />
                      </View>
                      <Text className="ml-2 font-bold text-[#1A1A1A] text-[13px] flex-1" numberOfLines={1}>
                        Lịch thi đấu
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => router.push('/(tabs)/chat')}
                      className="flex-1 flex-row items-center h-12 bg-white rounded-xl border border-[#E0E0E0] px-3 active:scale-[0.98]"
                      style={styles.actionButtonShadow}
                    >
                      <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                        <MessageCircle color="#2563eb" size={16} />
                      </View>
                      <Text className="ml-2 font-bold text-[#1A1A1A] text-[13px] flex-1" numberOfLines={1}>
                        Nhắn tin
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ flex: 1, paddingTop: contentPaddingTop }}>
          <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="tracker" options={{ href: null }} />
            <Tabs.Screen name="chat" />
            <Tabs.Screen name="profile" />
          </Tabs>
        </View>

        {/* Notifications Modal */}
        <Modal
          visible={isNotificationsOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsNotificationsOpen(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsNotificationsOpen(false)} 
            className="flex-1 bg-black/40 justify-center items-center px-4"
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()} 
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex-col"
              style={Platform.OS === 'web' ? { maxHeight: '80%' } : { maxHeight: '70%' }}
            >
              {/* Modal Header */}
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-900">Thông báo</Text>
                <TouchableOpacity 
                  onPress={() => setIsNotificationsOpen(false)}
                  className="p-1 rounded-full bg-slate-100 active:scale-95"
                >
                  <X color="#64748B" size={18} />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
              >
                {notifications.map((notif) => (
                  <View 
                    key={notif.id}
                    className={`flex-row p-3 rounded-xl mb-3 border ${notif.read ? 'bg-white border-slate-100' : 'bg-blue-50/40 border-blue-100/60'}`}
                  >
                    {!notif.read && (
                      <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 mr-2.5" />
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-800 mb-0.5">{notif.title}</Text>
                      <Text className="text-xs text-slate-500 leading-normal mb-1">{notif.description}</Text>
                      <Text className="text-[10px] text-slate-400 font-semibold">{notif.time}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Modal Footer */}
              <TouchableOpacity 
                onPress={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  Alert.alert("Thành công", "Đã đánh dấu tất cả thông báo là đã đọc!");
                  setIsNotificationsOpen(false);
                }}
                className="w-full py-4 bg-slate-50 border-t border-slate-100 items-center justify-center active:bg-slate-100"
              >
                <Text className="text-sm font-bold text-blue-600">Đánh dấu đã đọc tất cả</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </HeaderScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    // Custom soft drop shadow at the top edge of classic bar
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    position: 'absolute',
  },
  headerScrolledShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  actionButtonShadow: {
    // Subtle shadow for the action buttons
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
});
