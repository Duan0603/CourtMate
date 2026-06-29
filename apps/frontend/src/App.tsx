import React from 'react';
import { TamaguiProvider, Theme, YStack, Spinner, Paragraph, H2 } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import LoginScreen from './features/auth/screens/LoginScreen';
import OnboardingScreen from './features/auth/screens/OnboardingScreen';
import { AuthProvider, useLogin } from './features/auth/hooks/useLogin';
import { UserRole } from '@courtmate/shared';
import { Button } from './components';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading, logout } = useLogin();

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" bg="$background">
        <Spinner size="large" color="$themeColor" />
        <Paragraph mt="$2" col="$colorMuted">Đang tải ứng dụng...</Paragraph>
      </YStack>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  // D-10: Redirect and lock users in the onboarding wizard if they log in but have not finished onboarding
  if (user.role === UserRole.USER) {
    return <OnboardingScreen />;
  }

  // Fully authenticated and onboarded
  return (
    <YStack f={1} ai="center" jc="center" bg="$background" p="$6" gap="$4">
      <YStack w="100%" maxWidth={340} ai="center" gap="$4">
        <H2 col="$color" ta="center">Xin chào, {user.name}!</H2>
        <Paragraph col="$colorMuted" ta="center">
          Bạn đã đăng nhập và hoàn thành onboarding thành công.
        </Paragraph>

        {/* Display profile summary */}
        <YStack bg="$backgroundHover" p="$4" br="$4" w="100%" gap="$2" borderWidth={1} borderColor="$borderColor">
          <Paragraph col="$color" fow="700">Thông tin tài khoản:</Paragraph>
          <Paragraph col="$colorMuted">Vai trò: <Paragraph col="$color">{user.role === UserRole.PLAYER ? 'Người chơi' : 'Ban tổ chức'}</Paragraph></Paragraph>
          <Paragraph col="$colorMuted">Thành phố: <Paragraph col="$color">{user.preferences.location}</Paragraph></Paragraph>
          {user.role === UserRole.PLAYER ? (
            <>
              <Paragraph col="$colorMuted">Môn chơi: <Paragraph col="$color">{(user.preferences.sports || []).join(', ')}</Paragraph></Paragraph>
              <Paragraph col="$colorMuted">Trình độ: <Paragraph col="$color">{user.preferences.skillLevel}</Paragraph></Paragraph>
            </>
          ) : (
            <Paragraph col="$colorMuted">Câu lạc bộ: <Paragraph col="$color">{user.preferences.clubName}</Paragraph></Paragraph>
          )}
        </YStack>

        <Button mt="$4" onPress={logout} theme="alt2">
          Đăng xuất
        </Button>
      </YStack>
    </YStack>
  );
};

export const App: React.FC = () => {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Theme>
    </TamaguiProvider>
  );
};

export default App;

