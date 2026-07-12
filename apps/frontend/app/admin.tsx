import React from 'react';
import { Alert } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Text, View } from 'tamagui';
import { Shield, LogOut, Code } from 'lucide-react-native';
import { useLogin } from '../src/features/auth/hooks/useLogin';
import { UserRole } from '@courtmate/shared';
import { router } from 'expo-router';

export default function AdminScreen() {
  const { user, logout, isAuthenticated, isLoading } = useLogin();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || (user?.role !== 'REGIONAL_ADMIN' && user?.role !== 'SUPER_ADMIN')) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user?.role, isLoading]);

  if (isLoading || !isAuthenticated) {
    return (
      <YStack f={1} ai="center" jc="center" bg="#F4FBF7">
        <Text color="#059669" fos={16} fow="600">Đang kiểm tra quyền truy cập...</Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} bg="#F4FBF7" jc="center" ai="center" p="$6">
      <View
        bg="#FFFFFF"
        br={24}
        p="$6"
        w="100%"
        maxWidth={400}
        ai="center"
        style={{
          shadowColor: '#059669',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 5,
        }}
      >
        {/* Shield Icon Header */}
        <YStack w={80} h={80} br={40} bg="rgba(5, 150, 105, 0.1)" jc="center" ai="center" mb="$4" borderWidth={2} borderColor="#059669">
          <Shield color="#059669" size={40} />
        </YStack>

        <H2 color="#062F21" fow="800" ta="center">Trang Quản Trị</H2>
        <Text color="#059669" fos={13} fow="700" tt="uppercase" ls={1} mt="$1" mb="$5">
          {user?.role === UserRole.SUPER_ADMIN ? 'Super Admin Console' : 'Regional Admin Console'}
        </Text>

        {/* Feature Under Development Notice */}
        <YStack
          bg="rgba(5, 150, 105, 0.04)"
          p="$5"
          br={16}
          borderWidth={1}
          borderColor="rgba(5, 150, 105, 0.1)"
          ai="center"
          gap="$3"
          w="100%"
          mb="$6"
        >
          <Code color="#059669" size={32} />
          <H3 color="#062F21" fow="700" ta="center">Đang tiếp tục phát triển</H3>
          <Paragraph color="#476F62" fos={13} ta="center" lh={20}>
            Hệ thống quản lý giải đấu và người dùng dành cho quản trị viên đang được hoàn thiện. Vui lòng quay lại sau.
          </Paragraph>
        </YStack>

        {/* User Info */}
        <Paragraph color="#476F62" fos={12} mb="$6" ta="center">
          Đăng nhập bởi: <Text fow="700">{user?.name || user?.email}</Text>
        </Paragraph>

        {/* Logout Button */}
        <XStack
          w="100%"
          p="$4"
          ai="center"
          jc="center"
          bg="rgba(239, 68, 68, 0.05)"
          br={14}
          borderWidth={1}
          borderColor="rgba(239, 68, 68, 0.15)"
          onPress={async () => {
            try {
              console.log('Admin console logout clicked');
              await logout();
              router.replace('/');
            } catch (err) {
              console.error('Error during admin logout:', err);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Chi tiết: ' + String(err));
            }
          }}
          pressStyle={{ scale: 0.98, opacity: 0.8 }}
        >
          <XStack ai="center" gap="$2.5">
            <LogOut color="#EF4444" size={20} />
            <Text color="#EF4444" fos={15} fow="700">Đăng xuất</Text>
          </XStack>
        </XStack>
      </View>
    </YStack>
  );
}
