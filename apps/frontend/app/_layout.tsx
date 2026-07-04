import { Slot } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '../src/features/auth/hooks/useLogin';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </Theme>
    </TamaguiProvider>
  );
}
