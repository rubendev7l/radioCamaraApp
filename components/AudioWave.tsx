import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface AudioWaveProps {
  isPlaying: boolean;
}

export function AudioWave({ isPlaying }: AudioWaveProps) {
  const waveAnimations = useRef<Animated.Value[]>(
    Array(8).fill(0).map(() => new Animated.Value(0.5))
  ).current;
  const glowAnimations = useRef<Animated.Value[]>(
    Array(8).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = waveAnimations.map((anim, index) => {
        const duration = 400 + (index * 50);
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      });

      const glowEffects = glowAnimations.map((_, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnimations[index], {
              toValue: 1,
              duration: 800 + (index * 100),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnimations[index], {
              toValue: 0,
              duration: 800 + (index * 100),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      });

      animations.forEach((anim: Animated.CompositeAnimation) => anim.start());
      glowEffects.forEach((anim: Animated.CompositeAnimation) => anim.start());

      return () => {
        animations.forEach((anim: Animated.CompositeAnimation) => anim.stop());
        glowEffects.forEach((anim: Animated.CompositeAnimation) => anim.stop());
      };
    } else {
      waveAnimations.forEach(anim => anim.setValue(0.5));
      glowAnimations.forEach(anim => anim.setValue(0));
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {waveAnimations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.wave,
            {
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
              opacity: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
              shadowColor: '#FFFFFF',
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
              shadowRadius: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 5],
              }),
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
    height: 40,
    marginVertical: 20,
  },
  wave: {
    width: 4,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
}); 