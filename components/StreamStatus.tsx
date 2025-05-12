/**
 * StreamStatus.tsx
 * 
 * Componente de status do stream de áudio que exibe informações sobre:
 * - Estado atual da reprodução
 * - Qualidade da conexão
 * - Status da rede
 * - Indicador visual de transmissão ao vivo
 * 
 * Características:
 * - Feedback visual em tempo real
 * - Indicadores de estado coloridos
 * - Informações de rede
 * - Indicador "AO VIVO" dinâmico
 * - Suporte a temas claro/escuro
 * 
 * Estados de Status:
 * - playing: Reprodução normal
 * - paused: Reprodução pausada
 * - buffering: Carregando stream
 * - error: Erro na reprodução
 * - offline: Stream offline
 * - no_internet: Sem conexão
 * - reconnecting: Tentando reconectar
 * 
 * Dependências:
 * - @react-navigation/native: Para temas
 * - @expo/vector-icons: Para ícones
 * - hooks personalizados: useStreamStatus, useNetworkStatus, useStreamMonitor, useAudioPlayer
 * 
 * @author Equipe de Desenvolvimento da Câmara Municipal
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useStreamStatus } from '../hooks/useStreamStatus';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useStreamMonitor } from '../hooks/useStreamMonitor';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export const StreamStatus = () => {
  const { status, error, isBuffering, getStatusMessage, isConnected, isInternetReachable } = useStreamStatus();
  const { quality, type } = useNetworkStatus();
  const { isStreamOnline, isChecking, streamError } = useStreamMonitor();
  const { initialLoadError } = useAudioPlayer();
  const { colors } = useTheme();

  const statusMessage = getStatusMessage();

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

  const getNetworkMessage = () => {
    if (!isConnected || !isInternetReachable) return 'Sem conexão';
    if (type === 'wifi') return 'WiFi';
    if (type === 'cellular') return 'Dados móveis';
    return 'Desconhecido';
  };

  const getStatusIcon = () => {
    // Ícone de rádio para estados ativos (playing ou paused)
    if (status === 'playing' || status === 'paused') {
      return 'radio';
    }
    
    // Ícone de erro para estados problemáticos
    if (status === 'error' || status === 'offline' || status === 'no_internet') {
      return 'error';
    }
    
    // Ícone padrão para outros estados
    return 'radio-button-unchecked';
  };

  const showLiveIndicator = status === 'playing' || status === 'paused';

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        {isChecking ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <MaterialIcons
            name={getStatusIcon()}
            size={16}
            color={getStatusColor()}
          />
        )}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {statusMessage}
        </Text>
        {showLiveIndicator && (
          <View style={[styles.liveIndicator, { backgroundColor: getStatusColor() }]} />
        )}
      </View>

      <View style={styles.networkContainer}>
        <MaterialIcons
          name={quality === 'unavailable' || !isConnected || !isInternetReachable ? 'wifi-off' : 'wifi'}
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
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
}); 