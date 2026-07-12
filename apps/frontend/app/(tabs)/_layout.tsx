import React from "react";
import { Tabs, router } from "expo-router";
import {
  Trophy,
  MessageCircle,
  Calendar,
  User as UserIcon,
} from "lucide-react-native";
import { YStack, Text } from "tamagui";
import { useLogin } from "../../src/features/auth/hooks/useLogin";

export default function TabLayout() {
  const { isAuthenticated, isLoading, user } = useLogin();

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderTopWidth: 1,
          borderTopColor: "rgba(15, 23, 42, 0.08)",
          height: 80,
          paddingBottom: 20,
        },
        tabBarShowLabel: false, // We'll render custom labels
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.7}>
              <Trophy color={focused ? "#059669" : "#94B5A6"} size={24} />
              <Text color={focused ? "#059669" : "#94B5A6"} fos={10} fow="600">
                Giải đấu
              </Text>
            </YStack>
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.7}>
              <Calendar color={focused ? "#059669" : "#94B5A6"} size={24} />
              <Text color={focused ? "#059669" : "#94B5A6"} fos={10} fow="600">
                Hồ sơ
              </Text>
            </YStack>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.7}>
              <MessageCircle color={focused ? "#059669" : "#94B5A6"} size={24} />
              <Text color={focused ? "#059669" : "#94B5A6"} fos={10} fow="600">
                Nhắn tin
              </Text>
            </YStack>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.7}>
              <UserIcon color={focused ? "#059669" : "#94B5A6"} size={24} />
              <Text color={focused ? "#059669" : "#94B5A6"} fos={10} fow="600">
                Cá nhân
              </Text>
            </YStack>
          ),
        }}
      />
    </Tabs>
  );
}
