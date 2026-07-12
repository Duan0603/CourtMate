import React, { useRef, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Text, ScrollView, Separator } from 'tamagui';
import { Settings, Shield, CreditCard, LogOut, ChevronRight, User as UserIcon } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import gsap from 'gsap';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import { useRegistrations } from '../../src/features/registrations/hooks/useRegistrations';
import { router } from 'expo-router';

export default function ProfileTab() {
  const { user, logout } = useLogin();
  const { registrations, fetchRegistrations, isLoading: isRegLoading } = useRegistrations();
  
  const isFocused = useIsFocused();
  const containerRef = useRef<any>(null);
  const headerRef = useRef<any>(null);

  useEffect(() => {
    if (isFocused && Platform.OS === 'web' && headerRef.current) {
      // Ensure profile header is visible initially
      gsap.set(headerRef.current, { y: 0, opacity: 1 });
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused && Platform.OS === 'web' && containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [isFocused]);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (Platform.OS === 'web' && headerRef.current) {
      if (scrollY > 20) {
        // Scrolling down: slide profile header up and out of view
        gsap.to(headerRef.current, {
          y: -220,
          opacity: 0,
          duration: 0.3,
          overwrite: 'auto',
          ease: 'power2.out'
        });
      } else {
        // Scrolling up to top: slide profile header back down
        gsap.to(headerRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          overwrite: 'auto',
          ease: 'power2.out'
        });
      }
    }
  };
  
  const mockPlayerId = '64957e841234567890abcdef';

  useEffect(() => {
    fetchRegistrations(mockPlayerId);
  }, [fetchRegistrations]);

  const menuItems = [
    { icon: <UserIcon color="#1d4ed8" size={20} />, title: 'Chỉnh sửa thông tin', route: '/edit-profile' },
    { icon: <Shield color="#1d4ed8" size={20} />, title: 'Bảo mật & Mật khẩu' },
    { icon: <CreditCard color="#1d4ed8" size={20} />, title: 'Phương thức thanh toán' },
    { icon: <Settings color="#1d4ed8" size={20} />, title: 'Cài đặt ứng dụng' },
  ];

  return (
    <YStack ref={containerRef} f={1} bg="#fcf8fa" position="relative">
      {/* Header Profile */}
      <YStack 
        ref={headerRef} 
        pt="$10" 
        pb="$6" 
        px="$5" 
        ai="center" 
        bg="#FFFFFF" 
        borderBottomWidth={1} 
        borderBottomColor="rgba(29, 78, 216, 0.08)"
        style={{
          position: Platform.OS === 'web' ? 'fixed' : 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 220,
          transition: 'transform 0.3s, opacity 0.3s'
        } as any}
      >
        <YStack w={80} h={80} br={40} bg="rgba(29, 78, 216, 0.1)" jc="center" ai="center" mb="$3" borderWidth={2} borderColor="#1d4ed8">
          <UserIcon color="#1d4ed8" size={40} />
        </YStack>
        <H2 color="#00174b" fow="800">{user?.name || user?.email || 'Người chơi ẩn danh'}</H2>
        <Paragraph color="#45464d" fos={14} mt="$1">
          {user?.role === 'PLAYER' ? 'Vận động viên' : user?.role === 'ORGANIZER' ? 'Nhà tổ chức' : 'Thành viên'}
        </Paragraph>
        
        <XStack mt="$4" gap="$3">
          <YStack bg="rgba(29, 78, 216, 0.06)" px="$3" py="$1.5" br="$4">
            <Text color="#1d4ed8" fos={12} fow="600">{user?.preferences?.location || 'Chưa cập nhật'}</Text>
          </YStack>
          <YStack bg="rgba(29, 78, 216, 0.06)" px="$3" py="$1.5" br="$4">
            <Text color="#00174b" fos={12} fow="600">{user?.preferences?.skillLevel === 'Beginner' ? 'Nhập môn' : user?.preferences?.skillLevel === 'Intermediate' ? 'Trung bình' : user?.preferences?.skillLevel === 'Advanced' ? 'Nâng cao' : 'Chưa cập nhật'}</Text>
          </YStack>
        </XStack>
      </YStack>

      <ScrollView 
        f={1} 
        p="$5" 
        onScroll={handleScroll} 
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 220, paddingBottom: 100 }}
      >
        <YStack gap="$4" pb="$8">
          
          <Text color="#00174b" fos={18} fow="700" mb="$2">Lịch sử giải đấu</Text>

          {isRegLoading ? (
            <Text col="#45464d">Đang tải lịch sử...</Text>
          ) : registrations.length === 0 ? (
            <Text col="#45464d">Bạn chưa đăng ký giải đấu nào.</Text>
          ) : (
            <YStack gap="$3">
              {registrations.map((reg: any, idx) => (
                <XStack
                  key={reg.id || idx}
                  bg="#FFFFFF"
                  p="$4"
                  br={12}
                  borderWidth={1}
                  borderColor="rgba(29, 78, 216, 0.08)"
                  jc="space-between"
                  ai="center"
                  onPress={() => router.push(`/ticket/${reg.tournamentId || reg.tournament?._id || reg.tournament}` as any)}
                  pressStyle={{ bg: 'rgba(29, 78, 216, 0.04)' }}
                >
                  <YStack f={1}>
                    <Text color="#00174b" fos={15} fow="700" numberOfLines={1}>
                      {reg.playerName} (Đăng ký)
                    </Text>
                    <Text color="#45464d" fos={13} mt="$1">
                      Mã giải: {String(reg.tournamentId || reg.tournament?._id || reg.tournament).substring(0, 8).toUpperCase()}
                    </Text>
                  </YStack>
                  <YStack bg="rgba(29, 78, 216, 0.1)" px="$3" py="$1.5" br="$4">
                    <Text color="#1d4ed8" fos={12} fow="700">Xem vé</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}

          <Text color="#062F21" fos={18} fow="700" mt="$4" mb="$2">Cài đặt chung</Text>

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
