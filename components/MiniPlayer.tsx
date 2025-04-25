import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAudioStream } from '../hooks/useAudioStream';

export const MiniPlayer = () => {
  const { isPlaying, isBuffering, play, pause } = useAudioStream();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          Rádio Câmara Sete Lagoas
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {isBuffering ? 'Carregando...' : isPlaying ? 'Ao vivo' : 'Pausado'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={isPlaying ? pause : play}
        accessibilityLabel={isPlaying ? 'Pausar' : 'Tocar'}
        accessibilityRole="button"
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color={COLORS.PRIMARY}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.SECONDARY,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT.DARK,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT.DARK,
    opacity: 0.7,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 