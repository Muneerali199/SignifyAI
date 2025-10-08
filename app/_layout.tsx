import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider } from '@/contexts/AppContext';
import { lightweightGestureRecognition } from '@/services/gestureRecognitionLightweight';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();
  
  useFrameworkReady();

  useEffect(() => {
    // Check onboarding status and initialize app
    const initializeApp = async () => {
      try {
        // Check if user has seen onboarding
        const onboardingSeen = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(onboardingSeen === 'true');

        // Initialize gesture recognition
        console.log('🎯 Initializing ISL gesture recognition...');
        const success = await lightweightGestureRecognition.initialize();
        if (success) {
          const info = lightweightGestureRecognition.getModelInfo();
          console.log(`✅ Gesture recognition ready with ${info.gestures.length} gestures:`, info.gestures);
        } else {
          console.warn('⚠️ Gesture recognition initialization failed');
        }
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isReady || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!hasSeenOnboarding && inAuthGroup) {
      // Redirect to onboarding
      router.replace('/onboarding');
    } else if (hasSeenOnboarding && segments[0] === 'onboarding') {
      // Redirect to main app
      router.replace('/(tabs)');
    }
  }, [isReady, hasSeenOnboarding, segments]);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </AppProvider>
  );
}
