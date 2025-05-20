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
          color="#E6F0FF" 
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
          color="#E6F0FF" 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => handlePress(onShare)}
        activeOpacity={0.7}
        accessibilityLabel="Compartilhar a rádio"
        accessibilityRole="button"
      >
        <Ionicons 
          name="share-social" 
          size={24}
          color="#E6F0FF"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
}); 