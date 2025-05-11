import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioPlayerStatus } from '../../../types/radio';

interface RadioControlsProps {
  status: AudioPlayerStatus;
  onTogglePlayback: () => void;
  onToggleMute: () => void;
  onReload: () => void;
  onShare: () => void;
}

export const RadioControls = memo(function RadioControls({
  status,
  onTogglePlayback,
  onToggleMute,
  onReload,
  onShare,
}: RadioControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onToggleMute}
        style={styles.button}
        accessibilityLabel={status.isMuted ? 'Desativar mudo' : 'Ativar mudo'}
        accessibilityRole="button"
      >
        <Ionicons
          name={status.isMuted ? 'volume-mute' : 'volume-high'}
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onTogglePlayback}
        style={[styles.button, styles.playButton]}
        accessibilityLabel={status.isPlaying ? 'Pausar' : 'Tocar'}
        accessibilityRole="button"
      >
        <Ionicons
          name={status.isPlaying ? 'pause' : 'play'}
          size={32}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReload}
        style={styles.button}
        accessibilityLabel="Recarregar"
        accessibilityRole="button"
      >
        <Ionicons name="reload" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onShare}
        style={styles.button}
        accessibilityLabel="Compartilhar"
        accessibilityRole="button"
      >
        <Ionicons name="share-social" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  button: {
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playButton: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}); 