import React from 'react';
import { YStack, Spinner, Paragraph } from 'tamagui';
import { useLogin } from '../src/features/auth/hooks/useLogin';
import { UserRole } from '@courtmate/shared';

// Screens
import LoginScreen from '../src/features/auth/screens/LoginScreen';
import OnboardingScreen from '../src/features/auth/screens/OnboardingScreen';
import DashboardScreen from '../src/features/dashboard/screens/DashboardScreen';

import StartScreen from '../src/features/auth/screens/StartScreen';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useLogin();
  const [hasStarted, setHasStarted] = React.useState(false);

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" bg="#0A0A0A">
        <Spinner size="large" color="#C4F82A" />
        <Paragraph mt="$4" color="rgba(255,255,255,0.6)">Đang tải ứng dụng...</Paragraph>
      </YStack>
    );
  }

  if (!hasStarted && !isAuthenticated) {
    return <StartScreen onStart={() => setHasStarted(true)} />;
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen onBack={() => setHasStarted(false)} />;
  }

  // User has logged in but hasn't completed onboarding yet (UserRole.USER is the default before they pick Player/Organizer)
  if (user.role === UserRole.USER) {
    return <OnboardingScreen />;
  }

  // Fully authenticated and onboarded
  return <DashboardScreen />;
}
