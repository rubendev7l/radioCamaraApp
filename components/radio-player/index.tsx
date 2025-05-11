import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Share, Animated } from 'react-native';
import { RadioPlayerProps } from '../../types/radio';
import { useRadioAudio } from '../../hooks/use-radio-audio';
import { useRadioNotification } from '../../hooks/use-radio-notification';
import { RadioControls } from './components/radio-controls';
import { RadioStatus } from './components/radio-status';
import { AudioWave } from '../AudioWave';

export function RadioPlayer({ currentStation, onExit }: RadioPlayerProps) {
  // Refs para animações
  const liveDotScale = useRef(new Animated.Value(1)).current;
  const liveDotOpacity = useRef(new Animated.Value(1)).current;

  // Hooks personalizados
  const {
    status,
    togglePlayback,
    toggleMute,
    reload,
  } = useRadioAudio({
    streamUrl: currentStation.streamUrl,
    onError: (error) => {
      console.error('Audio error:', error);
    },
  });

  const { settings } = useRadioNotification({
    stationName: currentStation.name,
    isPlaying: status.isPlaying,
    hasError: status.hasError,
    onTogglePlayback: togglePlayback,
    onStop: onExit,
  });

  // Efeito para animação do indicador "AO VIVO"
  useEffect(() => {
    if (status.isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(liveDotScale, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(liveDotOpacity, {
              toValue: 0.7,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(liveDotScale, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(liveDotOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      liveDotScale.setValue(1);
      liveDotOpacity.setValue(1);
    }
  }, [status.isPlaying]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Ouça ${currentStation.name} ao vivo!`,
        url: currentStation.streamUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <RadioStatus
          status={status}
          stationName={currentStation.name}
          liveDotScale={liveDotScale}
          liveDotOpacity={liveDotOpacity}
        />

        <AudioWave isPlaying={status.isPlaying} />

        <RadioControls
          status={status}
          onTogglePlayback={togglePlayback}
          onToggleMute={toggleMute}
          onReload={reload}
          onShare={handleShare}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'space-between',
    padding: 16,
  },
}); 