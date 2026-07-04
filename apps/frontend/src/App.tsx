import React from 'react';
import { TamaguiProvider, Theme, YStack, Spinner, Paragraph, H2 } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import LoginScreen from './features/auth/screens/LoginScreen';
import OnboardingScreen from './features/auth/screens/OnboardingScreen';
import DashboardScreen from './features/dashboard/screens/DashboardScreen';
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
  return <DashboardScreen />;
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

