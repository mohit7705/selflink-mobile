import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AppNavigator } from '@navigation/AppNavigator';
import { theme } from '@theme/index';

export default function App() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  const statusBarStyle = useMemo(
    () => (colorScheme === 'light' ? 'dark' : 'light'),
    [colorScheme],
  );

  const prepare = useCallback(async () => {
    // Placeholder for font loading or splash preparation
    setIsReady(true);
  }, []);

  useEffect(() => {
    prepare().catch(() => undefined);
  }, [prepare]);

  if (!isReady) {
    return <StatusBar style={statusBarStyle} backgroundColor={theme.palette.midnight} />;
  }

  return (
    <>
      <StatusBar style={statusBarStyle} backgroundColor={theme.palette.midnight} />
      <AppNavigator />
    </>
  );
}
