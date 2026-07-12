import React from 'react';
import { YStack, Spinner, Paragraph } from 'tamagui';
import { useLogin } from '../src/features/auth/hooks/useLogin';
import { UserRole } from '@courtmate/shared';
import { router } from 'expo-router';

// Screens
import LoginScreen from '../src/features/auth/screens/LoginScreen';
import OnboardingScreen from '../src/features/auth/screens/OnboardingScreen';

import StartScreen from '../src/features/auth/screens/StartScreen';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useLogin();
  const [hasStarted, setHasStarted] = React.useState(false);

  const userRole = user?.role;
  React.useEffect(() => {
    console.log('[Home Redirect] userRole:', userRole, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    if (!isLoading && isAuthenticated && userRole) {
      if (userRole === 'REGIONAL_ADMIN' || userRole === 'SUPER_ADMIN') {
        console.log('[Home Redirect] Redirecting to /admin');
        router.replace('/admin');
      } else if (userRole !== 'USER') {
        console.log('[Home Redirect] Redirecting to /(tabs)/dashboard');
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [isAuthenticated, userRole, isLoading]);

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" bg="#F4FBF7">
        <Spinner size="large" color="#059669" />
        <Paragraph mt="$4" color="#476F62" fow="600">Đang tải ứng dụng...</Paragraph>
      </YStack>
    );
  }

  if (isAuthenticated && user && user.role === 'USER') {
    return <OnboardingScreen />;
  }

  if (!hasStarted && !isAuthenticated) {
    return <StartScreen onStart={() => setHasStarted(true)} />;
  }

  return <LoginScreen onBack={() => setHasStarted(false)} />;
}
