import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { StreamStatus } from './StreamStatus';
import { useStreamStatus } from '../hooks/useStreamStatus';

export const AudioPlayer = () => {
  const { isPlaying, play, pause, canPlay } = useAudioPlayer();
  const { status, isBuffering } = useStreamStatus();
  const { colors } = useTheme();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const getStatusColor = () => {
    if (isBuffering) return colors.warning;
    if (!canPlay) return colors.error;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      <StreamStatus />
      
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={!canPlay}
          style={[
            styles.playButton,
            { backgroundColor: getStatusColor() }
          ]}
        >
          {isBuffering ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color={colors.background}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 