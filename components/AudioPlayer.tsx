import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { StreamStatus } from './StreamStatus';
import { useStreamStatus } from '../hooks/useStreamStatus';

export const AudioPlayer = () => {
  const { isPlaying, play, pause, canPlay } = useAudioPlayer();
  const { status, isBuffering, getStatusMessage, isConnected, isInternetReachable } = useStreamStatus();
  const { colors } = useTheme();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const getStatusColor = () => {
    // Estados de erro têm prioridade
    if (!isConnected || !isInternetReachable || status === 'no_internet') {
      return colors.error;
    }
    if (status === 'error' || status === 'offline') {
      return colors.error;
    }

    // Estados de carregamento/reconexão
    if (status === 'buffering' || status === 'loading' || status === 'reconnecting') {
      return colors.warning;
    }

    // Estados normais
    if (status === 'playing') {
      return colors.success;
    }
    if (status === 'paused') {
      return colors.text;
    }

    // Estado padrão
    return colors.text;
  };

  const isButtonDisabled =
    !canPlay ||
    !isConnected ||
    !isInternetReachable ||
    status === 'offline' ||
    status === 'no_internet' ||
    status === 'loading' ||
    status === 'reconnecting' ||
    isBuffering;

  const showLoadingIndicator = 
    isBuffering || 
    status === 'loading' || 
    status === 'reconnecting';

  return (
    <View style={styles.container}>
      <StreamStatus />
      
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={isButtonDisabled}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar transmissão' : 'Reproduzir transmissão'}
          style={[
            styles.playButton,
            { 
              backgroundColor: getStatusColor(),
              opacity: isButtonDisabled ? 0.5 : 1,
            },
          ]}
        >
          {showLoadingIndicator ? (
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
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusMessage()}
      </Text>
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
  statusText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
}); 