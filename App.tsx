import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation/RootNavigator';
import { ThemeProvider } from '@/theme';

const App: React.FC = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  </SafeAreaProvider>
);

export default App;
