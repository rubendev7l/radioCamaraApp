import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';

interface PlayerStatusProps {
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
}

export default function PlayerStatus({ isPlaying, isBuffering, error }: PlayerStatusProps) {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  // Se houver erro específico de conexão ou stream offline
  if (error && (error.includes('offline') || error.includes('conexão') || error.includes('conexao'))) {
    return (
      <View style={[styles.container, styles.offlineContainer]}>
        <Text style={[styles.text, styles.offlineText]}>
          OFFLINE
        </Text>
      </View>
    );
  }

  // Se houver qualquer outro erro
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.text, styles.errorText]}>
          {error}
        </Text>
      </View>
    );
  }

  // Se estiver carregando inicialmente
  if (isBuffering && !isPlaying) {
    return (
      <View style={[styles.container, styles.bufferingContainer]}>
        <ActivityIndicator size="small" color="#64B5F6" />
        <Text style={[styles.text, styles.bufferingText]}>
          Carregando...
        </Text>
      </View>
    );
  }

  // Se estiver tocando (mesmo que buffering)
  if (isPlaying) {
    return (
      <View style={[styles.container, styles.liveContainer]}>
        <Animated.View 
          style={[
            styles.liveDot,
            {
              transform: [{ scale: pulseAnim }],
            }
          ]} 
        />
        <Text style={[styles.text, styles.liveText]}>
          AO VIVO
        </Text>
      </View>
    );
  }

  // Estado padrão (quando pausado)
  return (
    <View style={[styles.container, styles.pausedContainer]}>
      <Text style={[styles.text, styles.pausedText]}>
        PAUSADO
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 75, 143, 0.15)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },
  liveContainer: {
    borderColor: '#00BFA5',
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
  },
  bufferingContainer: {
    borderColor: '#64B5F6',
    backgroundColor: 'rgba(100, 181, 246, 0.15)',
  },
  errorContainer: {
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  offlineContainer: {
    borderColor: '#78909C',
    backgroundColor: 'rgba(120, 144, 156, 0.15)',
  },
  pausedContainer: {
    borderColor: '#78909C',
    backgroundColor: 'rgba(120, 144, 156, 0.15)',
  },
  liveText: {
    color: '#00BFA5',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bufferingText: {
    color: '#64B5F6',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  errorText: {
    color: '#FF5252',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  offlineText: {
    color: '#78909C',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pausedText: {
    color: '#78909C',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BFA5',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
}); 