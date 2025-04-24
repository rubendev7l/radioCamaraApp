import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { PLAYER_CONFIG } from '../constants/radio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAVE_COUNT = 3;
const WAVE_HEIGHT = 100;
const DEFAULT_WAVE_COLOR = 'rgba(255, 255, 255, 0.3)';
const WAVE_WIDTH = SCREEN_WIDTH * 1.5;
const ANIMATION_DURATION = 800;

interface WaveVisualizerProps {
  isPlaying: boolean;
  color?: string;
}

export function WaveVisualizer({ isPlaying, color = DEFAULT_WAVE_COLOR }: WaveVisualizerProps) {
  const progress = useSharedValue(0);
  const amplitude = useSharedValue(0.2);
  const frequency = useSharedValue(0.5);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setupAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      cancelAnimation(progress);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      progress.value = 0;
      progress.value = withRepeat(
        withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: Easing.linear,
        }),
        -1,
        false
      );
      
      amplitude.value = withRepeat(
        withSpring(0.5, {
          damping: 2,
          stiffness: 20,
        }),
        -1,
        true
      );
      
      frequency.value = withRepeat(
        withSpring(0.8, {
          damping: 2,
          stiffness: 20,
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(progress);
      cancelAnimation(amplitude);
      cancelAnimation(frequency);
      progress.value = 0;
      amplitude.value = 0.2;
      frequency.value = 0.5;
    }
  }, [isPlaying]);

  async function setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: 1,
        interruptionModeIOS: 1,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: PLAYER_CONFIG.STREAM_URL },
        { shouldPlay: false, volume: 1 },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
    } catch (error) {
      console.error('Error setting up audio for visualization:', error);
    }
  }

  function onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      const currentAmplitude = status.volume || 0.2;
      const currentFrequency = status.isPlaying ? 0.8 : 0.5;
      
      amplitude.value = withSpring(currentAmplitude, {
        damping: 2,
        stiffness: 20,
      });
      
      frequency.value = withSpring(currentFrequency, {
        damping: 2,
        stiffness: 20,
      });
    }
  }

  function renderWave(index: number) {
    const waveStyle = useAnimatedStyle(() => {
      const phase = progress.value * Math.PI * 2;
      const currentAmplitude = amplitude.value * (1 - index * 0.2);
      const currentFrequency = frequency.value * (1 + index * 0.1);
      
      const points = Array.from({ length: 50 }, (_, i) => {
        const x = (i / 49) * WAVE_WIDTH;
        const y = Math.sin(x * currentFrequency + phase) * currentAmplitude * WAVE_HEIGHT;
        return `${x},${y}`;
      });

      const path = `M ${points.join(' L ')}`;

      return {
        transform: [
          { translateX: -WAVE_WIDTH / 2 },
          { translateY: WAVE_HEIGHT / 2 },
          { scaleY: currentAmplitude },
        ],
      };
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.wave,
          waveStyle,
        ]}
      >
        <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT}>
          <Path
            d={renderWavePath(index)}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        </Svg>
      </Animated.View>
    );
  }

  function renderWavePath(index: number) {
    const points = Array.from({ length: 50 }, (_, i) => {
      const x = (i / 49) * WAVE_WIDTH;
      const y = Math.sin(x * 0.1) * WAVE_HEIGHT * 0.5;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: WAVE_COUNT }).map((_, index) => renderWave(index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: WAVE_HEIGHT,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: WAVE_WIDTH,
    height: WAVE_HEIGHT,
  },
}); 