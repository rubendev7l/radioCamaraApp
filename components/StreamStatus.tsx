import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useStreamStatus } from '../hooks/useStreamStatus';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useStreamMonitor } from '../hooks/useStreamMonitor';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export const StreamStatus = () => {
  const { status, error, isBuffering } = useStreamStatus();
  const { quality, type } = useNetworkStatus();
  const { isStreamOnline, isChecking, streamError } = useStreamMonitor();
  const { initialLoadError } = useAudioPlayer();
  const { colors } = useTheme();

  const getStatusMessage = () => {
    if (isChecking) return 'Verificando transmissão...';
    if (streamError) return streamError;
    if (isStreamOnline === false) return 'Transmissão fora do ar';
    if (error) return error;
    if (isBuffering) return 'Carregando...';
    if (status === 'loading') return 'Iniciando...';
    if (status === 'playing') return 'Ao vivo';
    if (status === 'idle') return 'Pronto para reproduzir';
    return 'Offline';
  };

  const getStatusColor = () => {
    if (isChecking) return colors.text;
    if (streamError || isStreamOnline === false) return colors.error;
    if (error) return colors.error;
    if (isBuffering || status === 'loading') return colors.warning;
    if (status === 'playing') return colors.success;
    return colors.text;
  };

  const getNetworkMessage = () => {
    if (type === 'wifi') return 'WiFi';
    if (type === 'cellular') return 'Dados móveis';
    return 'Sem conexão';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        {isChecking ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <MaterialIcons
            name={status === 'playing' ? 'radio' : 'radio-button-unchecked'}
            size={16}
            color={getStatusColor()}
          />
        )}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusMessage()}
        </Text>
      </View>

      <View style={styles.networkContainer}>
        <MaterialIcons
          name={quality === 'unavailable' ? 'wifi-off' : 'wifi'}
          size={16}
          color={colors.text}
        />
        <Text style={[styles.networkText, { color: colors.text }]}>
          {getNetworkMessage()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    gap: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  networkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  networkText: {
    fontSize: 12,
    opacity: 0.8,
  },
}); 