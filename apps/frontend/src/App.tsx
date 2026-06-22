import React from 'react';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import LoginScreen from './features/auth/screens/LoginScreen';

export const App: React.FC = () => {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <LoginScreen />
      </Theme>
    </TamaguiProvider>
  );
};
export default App;
