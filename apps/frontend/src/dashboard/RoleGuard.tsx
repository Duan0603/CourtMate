import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { UserRole } from '@courtmate/shared';
import { useLogin } from '../features/auth/hooks/useLogin';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useLogin();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.REGIONAL_ADMIN) {
        router.replace('/admin');
      } else if (user.role === UserRole.ORGANIZER) {
        router.replace('/organizer');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles]);

  if (isLoading || !isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-light">
        <Text className="text-primary font-semibold text-base">Checking access...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
