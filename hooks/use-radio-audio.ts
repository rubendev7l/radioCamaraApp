import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { AudioPlayerStatus } from '../types/radio';

interface UseRadioAudioProps {
  streamUrl: string;
  onError?: (error: Error) => void;
}

export function useRadioAudio({ streamUrl, onError }: UseRadioAudioProps) {
  const [status, setStatus] = useState<AudioPlayerStatus>({
    isPlaying: false,
    hasError: false,
    isMuted: false,
  });
  
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setupAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [streamUrl]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: false }
      );
      
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.isLoaded) {
          setStatus(prev => ({
            ...prev,
            isPlaying: playbackStatus.isPlaying,
            hasError: false,
          }));
        } else {
          setStatus(prev => ({
            ...prev,
            hasError: true,
          }));
        }
      });

      if (Platform.OS === 'android') {
        await sound.setVolumeAsync(1.0);
        await sound.setIsMutedAsync(false);
        await sound.setProgressUpdateIntervalAsync(100);
      }
    } catch (error) {
      console.error('Error setting up audio:', error);
      setStatus(prev => ({ ...prev, hasError: true }));
      onError?.(error as Error);
    }
  };

  const togglePlayback = async () => {
    try {
      if (!soundRef.current) return;

      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setStatus(prev => ({ ...prev, hasError: true }));
      onError?.(error as Error);
    }
  };

  const toggleMute = async () => {
    try {
      if (!soundRef.current) return;

      const newMutedState = !status.isMuted;
      await soundRef.current.setIsMutedAsync(newMutedState);
      setStatus(prev => ({ ...prev, isMuted: newMutedState }));
    } catch (error) {
      console.error('Error toggling mute:', error);
      onError?.(error as Error);
    }
  };

  const reload = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      await setupAudio();
    } catch (error) {
      console.error('Error reloading audio:', error);
      setStatus(prev => ({ ...prev, hasError: true }));
      onError?.(error as Error);
    }
  };

  return {
    status,
    togglePlayback,
    toggleMute,
    reload,
  };
} 