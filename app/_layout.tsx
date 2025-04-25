import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay,
  withSequence
} from 'react-native-reanimated';
import { View } from 'react-native';

function SplashScreen() {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withDelay(200, withSpring(1.2, { damping: 8 })),
      withSpring(1, { damping: 8 })
    );
    opacity.value = withDelay(200, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <Animated.Image
        source={require('../assets/images/icon.png')}
        style={[
          {
            width: 200,
            height: 200,
          },
          animatedStyle
        ]}
      />
    </View>
  );
}

export default function RootLayout() {
  const [isSplashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashComplete(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isSplashComplete) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
