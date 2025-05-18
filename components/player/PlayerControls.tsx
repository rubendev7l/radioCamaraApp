import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onMute: () => void;
  onShare: () => void;
}

export default function PlayerControls({ 
  isPlaying, 
  onPlayPause, 
  onMute, 
  onShare 
}: PlayerControlsProps) {
  const handlePress = (callback: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    callback();
  };

  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => handlePress(onMute)}
        activeOpacity={0.7}
        accessibilityLabel={isPlaying ? "Desativar som" : "Ativar som"}
        accessibilityRole="button"
      >
        <Ionicons 
          name={isPlaying ? "volume-mute" : "volume-high"} 
          size={24}
          color="white" 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => handlePress(onPlayPause)}
        activeOpacity={0.7}
        accessibilityLabel={isPlaying ? "Pausar" : "Tocar"}
        accessibilityRole="button"
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={32}
          color="white" 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: '#E6F0FF' }]}
        onPress={() => handlePress(onShare)}
        activeOpacity={0.7}
        accessibilityLabel="Compartilhar a rádio"
        accessibilityRole="button"
      >
        <Ionicons 
          name="share-social" 
          size={24}
          color="#1B4B8F"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
}); 