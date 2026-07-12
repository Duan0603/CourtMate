import React from 'react';
import { Alert } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Text, ScrollView, Separator } from 'tamagui';
import { Settings, Shield, CreditCard, LogOut, ChevronRight, User as UserIcon } from 'lucide-react-native';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import { router } from 'expo-router';

export default function ProfileTab() {
  const { user, logout } = useLogin();

  const menuItems = [
    { icon: <UserIcon color="#059669" size={20} />, title: 'Chỉnh sửa thông tin', route: '/edit-profile' },
    { icon: <Shield color="#059669" size={20} />, title: 'Bảo mật & Mật khẩu' },
    { icon: <CreditCard color="#059669" size={20} />, title: 'Phương thức thanh toán' },
    { icon: <Settings color="#059669" size={20} />, title: 'Cài đặt ứng dụng' },
  ];

  return (
    <YStack f={1} bg="#F4FBF7">
      {/* Header Profile */}
      <YStack pt="$10" pb="$6" px="$5" ai="center" bg="#FFFFFF" borderBottomWidth={1} borderBottomColor="rgba(5, 150, 105, 0.08)">
        <YStack w={80} h={80} br={40} bg="rgba(5, 150, 105, 0.1)" jc="center" ai="center" mb="$3" borderWidth={2} borderColor="#059669">
          <UserIcon color="#059669" size={40} />
        </YStack>
        <H2 color="#062F21" fow="800">{user?.name || user?.email || 'Người chơi ẩn danh'}</H2>
        <Paragraph color="#476F62" fos={14} mt="$1">
          {user?.role === 'PLAYER' ? 'Vận động viên' : user?.role === 'ORGANIZER' ? 'Nhà tổ chức' : 'Thành viên'}
        </Paragraph>
        
        <XStack mt="$4" gap="$3">
          <YStack bg="rgba(5, 150, 105, 0.06)" px="$3" py="$1.5" br="$4">
            <Text color="#059669" fos={12} fow="600">{user?.preferences?.location || 'Chưa cập nhật'}</Text>
          </YStack>
          <YStack bg="rgba(5, 150, 105, 0.06)" px="$3" py="$1.5" br="$4">
            <Text color="#062F21" fos={12} fow="600">{user?.preferences?.skillLevel === 'Beginner' ? 'Nhập môn' : user?.preferences?.skillLevel === 'Intermediate' ? 'Trung bình' : user?.preferences?.skillLevel === 'Advanced' ? 'Nâng cao' : 'Chưa cập nhật'}</Text>
          </YStack>
        </XStack>
      </YStack>

      <ScrollView f={1} p="$5">
        <YStack gap="$4" pb="$8">
          
          <Text color="#062F21" fos={18} fow="700" mb="$2">Cài đặt chung</Text>

          <YStack 
            bg="#FFFFFF" 
            br={12} 
            overflow="hidden" 
            borderWidth={1} 
            borderColor="rgba(5, 150, 105, 0.08)"
            shadowColor="rgba(5, 150, 105, 0.06)"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={1}
            shadowRadius={8}
            elevation={1}
          >
            {menuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <XStack 
                  p="$4" 
                  ai="center" 
                  jc="space-between" 
                  pressStyle={{ bg: 'rgba(5, 150, 105, 0.04)' }}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <XStack ai="center" gap="$3">
                    <YStack w={36} h={36} br={18} bg="rgba(5, 150, 105, 0.06)" jc="center" ai="center">
                      {item.icon}
                    </YStack>
                    <Text color="#062F21" fos={15} fow="600">{item.title}</Text>
                  </XStack>
                  <ChevronRight color="rgba(5, 150, 105, 0.3)" size={20} />
                </XStack>
                {index < menuItems.length - 1 && (
                  <Separator borderColor="rgba(5, 150, 105, 0.08)" ml="$11" />
                )}
              </React.Fragment>
            ))}
          </YStack>

          <YStack mt="$4">
            <XStack 
              p="$4" 
              ai="center" 
              jc="space-between" 
              bg="rgba(239, 68, 68, 0.05)" 
              br={12}
              borderWidth={1}
              borderColor="rgba(239, 68, 68, 0.15)"
              onPress={async () => {
                try {
                  console.log('Profile logout button clicked');
                  await logout();
                  console.log('Profile logout call finished, redirecting...');
                  router.replace('/');
                } catch (err) {
                  console.error('Error during profile logout:', err);
                  Alert.alert('Lỗi', 'Không thể đăng xuất. Chi tiết: ' + String(err));
                }
              }}
              pressStyle={{ scale: 0.98, opacity: 0.8 }}
            >
              <XStack ai="center" gap="$3">
                <YStack w={36} h={36} br={18} bg="rgba(239, 68, 68, 0.1)" jc="center" ai="center">
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
