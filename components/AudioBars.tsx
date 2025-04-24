import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_COUNT = 30;
const BAR_WIDTH = 4;
const BAR_SPACING = 4;
const MAX_BAR_HEIGHT = 60;

interface AudioBarsProps {
  isPlaying: boolean;
  color?: string;
}

export function AudioBars({ isPlaying, color = '#FFFFFF' }: AudioBarsProps) {
  const translateYValues = Array.from({ length: BAR_COUNT }, () => useSharedValue(0));

  useEffect(() => {
    if (isPlaying) {
      translateYValues.forEach((translateY, index) => {
        const delay = index * 50;
        setTimeout(() => {
          translateY.value = withRepeat(
            withTiming(
              -MAX_BAR_HEIGHT * (Math.random() * 0.8 + 0.2),
              {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
              }
            ),
            -1,
            true
          );
        }, delay);
      });
    } else {
      translateYValues.forEach(translateY => {
        cancelAnimation(translateY);
        translateY.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
      });
    }

    return () => {
      translateYValues.forEach(translateY => cancelAnimation(translateY));
    };
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {translateYValues.map((translateY, index) => {
        const barStyle = useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value }],
          backgroundColor: color,
          opacity: Math.abs(translateY.value / MAX_BAR_HEIGHT) + 0.2,
        }));

        return (
          <Animated.View
            key={index}
            style={[styles.bar, barStyle]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: MAX_BAR_HEIGHT,
    width: '100%',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  bar: {
    width: BAR_WIDTH,
    height: MAX_BAR_HEIGHT,
    marginHorizontal: BAR_SPACING / 2,
    borderRadius: BAR_WIDTH / 2,
  },
}); 