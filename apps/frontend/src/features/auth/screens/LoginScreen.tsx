import React from 'react';
import { YStack, H2, Paragraph } from 'tamagui';
import { useLogin } from '../hooks/useLogin';
import { LoginForm } from '../components/LoginForm';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, isAuthenticated, user } = useLogin();

  const handleLogin = async (email: string) => {
    try {
      await login(email);
    } catch (e) {
      console.error('Login error', e);
    }
  };

  return (
    <YStack f={1} ai="center" jc="center" bg="$background" p="$6" gap="$4">
      {isAuthenticated && user ? (
        <YStack ai="center" gap="$2">
          <H2 col="$color">Chào mừng, {user.name}!</H2>
          <Paragraph col="$colorMuted">Bạn đã đăng nhập thành công.</Paragraph>
        </YStack>
      ) : (
        <YStack ai="center" w="100%" gap="$4">
          <H2 col="$color">Đăng nhập</H2>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </YStack>
      )}
    </YStack>
  );
};
export default LoginScreen;
