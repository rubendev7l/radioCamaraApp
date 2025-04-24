import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, useColorScheme } from 'react-native';
import { FONTS } from '../../constants/fonts';

interface TextInputProps extends RNTextInputProps {
  variant?: 'default' | 'large';
}

export function TextInput({ style, variant = 'default', ...props }: TextInputProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  const variantStyles = {
    default: {
      fontSize: 16,
      fontFamily: FONTS.regular,
    },
    large: {
      fontSize: 18,
      fontFamily: FONTS.medium,
    },
  };

  return (
    <RNTextInput
      style={[
        { color },
        variantStyles[variant],
        style,
      ]}
      placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
      {...props}
    />
  );
} 