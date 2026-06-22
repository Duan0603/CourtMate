import React from 'react';
import { Stack } from 'expo-router';

export const AppNavigator: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
    </Stack>
  );
};
export default AppNavigator;
