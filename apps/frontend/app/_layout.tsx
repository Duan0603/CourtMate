import { Slot } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { AuthProvider } from '../src/features/auth/hooks/useLogin';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css'; // Assuming nativewind setup requires this, or will use classNames

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    // Alias Inter to Geist for NativeWind to resolve fontFamily: 'Geist'
    Geist: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    'Geist-Bold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Theme name="light">
        <AuthProvider>
          <View style={styles.container}>
            <Slot />
          </View>
        </AuthProvider>
      </Theme>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // gray-light (Level 0)
  },
});

