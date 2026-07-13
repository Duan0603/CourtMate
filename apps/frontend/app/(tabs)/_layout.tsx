import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from "react-native";
import { Tabs, router, useLocalSearchParams } from "expo-router";
import {
  Trophy,
  MessageCircle,
  User as UserIcon,
} from "lucide-react-native";
import { useLogin } from "../../src/features/auth/hooks/useLogin";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { routes, index: activeIndex } = state;
  const params = useLocalSearchParams<{ view?: string }>();
  const isEditProfile = params.view === 'edit-profile';

  if (isEditProfile) return null;

  return (
    <View 
      style={styles.floatingContainer}
      className="absolute bottom-4 left-6 right-6 h-16 bg-white/95 rounded-full flex-row items-center justify-around px-4 shadow-lg border border-slate-200/50 z-50"
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
        const activeTextColor = 'text-blue-600';
        const activeColor = '#2563eb';
        let labelText = 'Giải đấu';

        if (route.name === 'chat') {
          IconComponent = MessageCircle;
          labelText = 'Tin nhắn';
        } else if (route.name === 'profile') {
          IconComponent = UserIcon;
          labelText = 'Cá nhân';
        }

        if (isFocused) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className={`flex-row items-center px-4 py-2 rounded-full ${activeBg} transition-all duration-300`}
              activeOpacity={0.8}
            >
              <IconComponent color={activeColor} size={18} />
              <Text className={`${activeTextColor} font-semibold text-xs ml-2`}>
                {labelText}
              </Text>
            </TouchableOpacity>
          );
        } else {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="p-3 rounded-full justify-center items-center active:scale-95 transition-transform"
              activeOpacity={0.7}
            >
              <IconComponent color="#64748b" size={22} />
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isLoading, user } = useLogin();
  const params = useLocalSearchParams<{ view?: string }>();
  const isEditProfile = params.view === 'edit-profile';

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/");
      } else if (user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') {
        router.replace("/admin");
      }
    }
  }, [isAuthenticated, isLoading, user?.role]);

  if (isLoading || !isAuthenticated || user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') {
    return null;
  }

  const userAvatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Unified top taskbar header */}
      {!isEditProfile && (
        <View 
          style={Platform.OS === 'web' ? { position: 'fixed', top: 0, left: 0, right: 0 } as any : undefined}
          className="h-16 bg-white border-b border-slate-200 shadow-sm flex-row items-center justify-between px-6 z-50"
        >
          <View className="flex-row items-center">
            <Text className="text-[24px] font-bold text-blue-600 tracking-tighter">CourtMate</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity 
              onPress={() => router.push('/profile?view=edit-profile')} 
              className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 active:scale-95 transition-transform"
            >
              <Image source={{ uri: userAvatar }} className="w-full h-full object-cover" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ flex: 1, paddingTop: !isEditProfile ? 64 : 0 }}>
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen name="dashboard" />
          <Tabs.Screen name="tracker" options={{ href: null }} />
          <Tabs.Screen name="chat" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    // Custom soft drop shadow
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
    position: 'absolute',
  }
});
