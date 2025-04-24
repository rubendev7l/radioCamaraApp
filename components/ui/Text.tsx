import { Text as RNText, TextProps as RNTextProps, useColorScheme } from 'react-native';
import { FONTS, FONT_WEIGHTS } from '../../constants/fonts';

interface TextProps extends RNTextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'body' | 'caption';
}

export function Text({ style, variant = 'default', ...props }: TextProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  const variantStyles = {
    default: {
      fontSize: 16,
      fontFamily: FONTS.regular,
    },
    title: {
      fontSize: 24,
      fontFamily: FONTS.bold,
    },
    subtitle: {
      fontSize: 18,
      fontFamily: FONTS.semiBold,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: FONTS.regular,
    },
    caption: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#999' : '#666',
      fontFamily: FONTS.regular,
    },
  };

  return (
    <RNText
      style={[
        { color },
        variantStyles[variant],
        style,
      ]}
      {...props}
    />
  );
}

export { TextInput } from 'react-native';

interface ButtonProps extends RNTextProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export function Button({ title, onPress, disabled, style }: ButtonProps) {
  const colorScheme = useColorScheme();
  
  return (
    <RNText
      onPress={disabled ? undefined : onPress}
      style={[
        {
          backgroundColor: disabled ? '#ccc' : (colorScheme === 'dark' ? '#007AFF' : '#0A84FF'),
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          color: '#fff',
          fontSize: 16,
          fontFamily: FONTS.medium,
          textAlign: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {title}
    </RNText>
  );
} 