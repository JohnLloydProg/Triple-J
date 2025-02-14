import { DarkTheme, DefaultTheme, NavigationIndependentTree, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {NavigationContainer} from '@react-navigation/native';

import { useColorScheme } from '@/hooks/useColorScheme';
import colors from '../constants/globalStyles';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    KeaniaOne: require('../assets/fonts/KeaniaOne-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NavigationIndependentTree>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTitleStyle: {
            fontFamily: 'KeaniaOne',
            fontSize: 24,
          },
          headerTintColor: colors.redAccent,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colors.headerColor },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerTitle: 'Triple J' }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="index" options={{ headerTitle: 'Triple J' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>

    </NavigationIndependentTree>
  );
}
