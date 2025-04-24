import React from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet } from 'react-native';

interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

export function CustomSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  minimumTrackTintColor = '#FFFFFF',
  maximumTrackTintColor = 'rgba(255, 255, 255, 0.3)',
  thumbTintColor = '#FFFFFF',
  style,
}: CustomSliderProps) {
  return (
    <Slider
      style={[styles.slider, style]}
      value={value}
      onValueChange={onValueChange}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
    />
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 40,
  },
}); 