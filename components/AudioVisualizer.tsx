import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
const BAR_COUNT = 20;
const BAR_WIDTH = 4;
const BAR_SPACING = 2;
const MAX_HEIGHT = 100;

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export function AudioVisualizer({ isPlaying }: AudioVisualizerProps) {
  const bars = useRef(
    Array(BAR_COUNT)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!isPlaying) {
      // Reset bars when not playing
      bars.forEach(bar => bar.setValue(0));
      return;
    }

    const animation = Animated.loop(
      Animated.sequence(
        bars.map((bar, index) =>
          Animated.timing(bar, {
            toValue: Math.random() * MAX_HEIGHT,
            duration: 300 + Math.random() * 200,
            useNativeDriver: false,
          })
        )
      )
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isPlaying, bars]);

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: bar,
              backgroundColor: '#fff',
              opacity: 0.8,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_HEIGHT,
    marginVertical: 20,
  },
  bar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_SPACING,
    borderRadius: BAR_WIDTH / 2,
  },
}); 