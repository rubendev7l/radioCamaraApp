import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const useAudioStream = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setupAudio();
    setupNotifications();

    return () => {
      cleanup();
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio mode:', error);
    }
  };

  const setupNotifications = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('audio', {
        name: 'Controles de Áudio',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  };

  const updateNotification = async (isPlaying: boolean) => {
    if (Platform.OS === 'android') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rádio Câmara Sete Lagoas',
          body: isPlaying ? 'Tocando agora' : 'Pausado',
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,
          categoryIdentifier: 'audio',
          data: {
            action: isPlaying ? 'pause' : 'play',
          },
        },
        trigger: null,
      });
    }
  };

  const play = async () => {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://camarasete.mg.gov.br/stream' },
          { 
            shouldPlay: true,
            isLooping: true,
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true
          },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
      } else {
        await soundRef.current.playAsync();
      }
      setIsPlaying(true);
      await updateNotification(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const pause = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        await updateNotification(false);
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsBuffering(status.isBuffering);
      if (status.didJustFinish) {
        setIsPlaying(false);
        updateNotification(false);
      }
    }
  };

  const cleanup = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  };

  return {
    isPlaying,
    isBuffering,
    play,
    pause,
  };
}; 