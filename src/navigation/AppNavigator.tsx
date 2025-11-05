import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';

import { HomeScreen } from '@screens/HomeScreen';
import { theme } from '@theme/index';

enableScreens(true);

type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.palette.midnight,
    text: theme.palette.platinum,
    border: 'transparent',
  },
};

export function AppNavigator() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Enable experimental layout anims once per platform
      import('react-native-reanimated').catch(() => undefined);
    }
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTransparent: true,
          headerTitle: '',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
