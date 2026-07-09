import React from 'react';
import { YStack, XStack, H2, H3, Paragraph, Text, ScrollView, Separator } from 'tamagui';
import { Settings, Shield, CreditCard, LogOut, ChevronRight, User as UserIcon } from 'lucide-react-native';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import { router } from 'expo-router';

export default function ProfileTab() {
  const { user, logout } = useLogin();

  const menuItems = [
    { icon: <UserIcon color="white" size={20} />, title: 'Chỉnh sửa thông tin', route: '/edit-profile' },
    { icon: <Shield color="white" size={20} />, title: 'Bảo mật & Mật khẩu' },
    { icon: <CreditCard color="white" size={20} />, title: 'Phương thức thanh toán' },
    { icon: <Settings color="white" size={20} />, title: 'Cài đặt ứng dụng' },
  ];

  return (
    <YStack f={1} bg="#0A0A0A">
      {/* Header Profile */}
      <YStack pt="$10" pb="$6" px="$5" ai="center" bg="rgba(20,20,20,0.8)" borderBottomWidth={1} borderBottomColor="rgba(255,255,255,0.05)">
        <YStack w={80} h={80} br={40} bg="rgba(196, 248, 42, 0.2)" jc="center" ai="center" mb="$3" borderWidth={2} borderColor="#C4F82A">
          <UserIcon color="#C4F82A" size={40} />
        </YStack>
        <H2 color="white" fow="800">{user?.name || user?.identifier || 'Người chơi ẩn danh'}</H2>
        <Paragraph color="rgba(255,255,255,0.6)" fos={14} mt="$1">
          {user?.role === 'PLAYER' ? 'Vận động viên' : user?.role === 'ORGANIZER' ? 'Nhà tổ chức' : 'Thành viên'}
        </Paragraph>
        
        <XStack mt="$4" gap="$3">
          <YStack bg="rgba(255,255,255,0.05)" px="$3" py="$1.5" br="$4">
            <Text color="#C4F82A" fos={12} fow="600">{user?.preferences?.location || 'Chưa cập nhật'}</Text>
          </YStack>
          <YStack bg="rgba(255,255,255,0.05)" px="$3" py="$1.5" br="$4">
            <Text color="white" fos={12} fow="600">{user?.preferences?.skillLevel === 'Beginner' ? 'Nhập môn' : user?.preferences?.skillLevel === 'Intermediate' ? 'Trung bình' : user?.preferences?.skillLevel === 'Advanced' ? 'Nâng cao' : 'Chưa cập nhật'}</Text>
          </YStack>
        </XStack>
      </YStack>

      <ScrollView f={1} p="$5">
        <YStack gap="$4" pb="$8">
          
          <Text color="white" fos={18} fow="700" mb="$2">Cài đặt chung</Text>

          <YStack bg="rgba(20,20,20,0.6)" br="$6" overflow="hidden" borderWidth={1} borderColor="rgba(255,255,255,0.05)">
            {menuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <XStack 
                  p="$4" 
                  ai="center" 
                  jc="space-between" 
                  pressStyle={{ bg: 'rgba(255,255,255,0.05)' }}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <XStack ai="center" gap="$3">
                    <YStack w={36} h={36} br={18} bg="rgba(255,255,255,0.05)" jc="center" ai="center">
                      {item.icon}
                    </YStack>
                    <Text color="white" fos={15} fow="600">{item.title}</Text>
                  </XStack>
                  <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                </XStack>
                {index < menuItems.length - 1 && (
                  <Separator borderColor="rgba(255,255,255,0.05)" ml="$11" />
                )}
              </React.Fragment>
            ))}
          </YStack>

          <YStack mt="$4">
            <XStack 
              p="$4" 
              ai="center" 
              jc="space-between" 
              bg="rgba(239, 68, 68, 0.1)" 
              br="$6"
              borderWidth={1}
              borderColor="rgba(239, 68, 68, 0.2)"
              onPress={async () => {
                await logout();
                router.replace('/');
              }}
              pressStyle={{ scale: 0.98, opacity: 0.8 }}
            >
              <XStack ai="center" gap="$3">
                <YStack w={36} h={36} br={18} bg="rgba(239, 68, 68, 0.2)" jc="center" ai="center">
                  <LogOut color="#EF4444" size={20} />
                </YStack>
                <Text color="#EF4444" fos={15} fow="700">Đăng xuất</Text>
              </XStack>
            </XStack>
          </YStack>

        </YStack>
      </ScrollView>
    </YStack>
  );
}
