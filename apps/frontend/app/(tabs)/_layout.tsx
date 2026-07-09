import React from 'react';
import { Tabs } from 'expo-router';
import { Trophy, Search, Calendar, User as UserIcon } from 'lucide-react-native';
import { YStack, Text } from 'tamagui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(20,20,20,0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 80,
          paddingBottom: 20,
        },
        tabBarShowLabel: false, // We'll render custom labels
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.5}>
              <Trophy color={focused ? '#C4F82A' : 'white'} size={24} />
              <Text color={focused ? '#C4F82A' : 'white'} fos={10} fow="600">Giải đấu</Text>
            </YStack>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.5}>
              <Search color={focused ? '#C4F82A' : 'white'} size={24} />
              <Text color={focused ? '#C4F82A' : 'white'} fos={10} fow="600">Tìm kiếm</Text>
            </YStack>
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.5}>
              <Calendar color={focused ? '#C4F82A' : 'white'} size={24} />
              <Text color={focused ? '#C4F82A' : 'white'} fos={10} fow="600">Hồ sơ</Text>
            </YStack>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack ai="center" gap="$1" opacity={focused ? 1 : 0.5}>
              <UserIcon color={focused ? '#C4F82A' : 'white'} size={24} />
              <Text color={focused ? '#C4F82A' : 'white'} fos={10} fow="600">Cá nhân</Text>
            </YStack>
          ),
        }}
      />
    </Tabs>
  );
}
