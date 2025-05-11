import React, { memo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AudioPlayerStatus } from '../../../types/radio';

interface RadioStatusProps {
  status: AudioPlayerStatus;
  stationName: string;
  liveDotScale: Animated.Value;
  liveDotOpacity: Animated.Value;
}

export const RadioStatus = memo(function RadioStatus({
  status,
  stationName,
  liveDotScale,
  liveDotOpacity,
}: RadioStatusProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.stationName}>{stationName}</Text>
      
      <View style={styles.statusContainer}>
        {status.isPlaying && !status.hasError && (
          <View style={styles.liveContainer}>
            <Animated.View
              style={[
                styles.liveDot,
                {
                  transform: [{ scale: liveDotScale }],
                  opacity: liveDotOpacity,
                },
              ]}
            />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        )}
        
        {status.hasError && (
          <Text style={styles.errorText}>
            Transmissão fora do ar
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
}); 