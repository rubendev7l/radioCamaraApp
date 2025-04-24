import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/theme';

interface CustomTextProps extends TextProps {
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
}

export function CustomText({ style, variant = 'body', ...props }: CustomTextProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const color = isDarkMode ? COLORS.dark.text : COLORS.light.text;

  return (
    <Text
      style={[
        styles[variant],
        { color },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 