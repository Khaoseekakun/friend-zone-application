// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appearance, useColorScheme } from 'react-native';
import { getTheme } from './theme/theme';
import Index from '.';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = React.useMemo(() => getTheme(colorScheme), [colorScheme]);

  React.useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('Color scheme changed:', colorScheme);
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <Index />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}