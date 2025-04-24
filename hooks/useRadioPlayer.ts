import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { RADIO_CONFIG, PLAYER_CONFIG } from '../constants/radio';

interface RadioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  isMuted: boolean;
  previousVolume: number;
  status: 'offline' | 'loading' | 'live' | 'error';
  buffering: boolean;
}

export function useRadioPlayer() {
  const [player, setPlayer] = useState<Audio.Sound | null>(null);
  const [state, setState] = useState<RadioPlayerState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    volume: 1,
    isMuted: false,
    previousVolume: 1,
    status: 'offline',
    buffering: false,
  });

  const setVolume = useCallback(async (newVolume: number) => {
    try {
      if (player) {
        await player.setVolumeAsync(newVolume);
        setState(prev => ({ 
          ...prev, 
          volume: newVolume,
          isMuted: newVolume === 0
        }));
      }
    } catch (error) {
      console.error('Erro ao ajustar volume:', error);
      setState(prev => ({ ...prev, status: 'error', error: 'Erro ao ajustar volume' }));
    }
  }, [player]);

  const toggleMute = useCallback(async () => {
    try {
      if (player) {
        if (state.isMuted) {
          await setVolume(state.previousVolume);
        } else {
          setState(prev => ({ ...prev, previousVolume: prev.volume }));
          await setVolume(0);
        }
      }
    } catch (error) {
      console.error('Erro ao alternar mudo:', error);
      setState(prev => ({ ...prev, status: 'error', error: 'Erro ao alternar mudo' }));
    }
  }, [player, state.isMuted, state.previousVolume, setVolume]);

  const loadAndPlay = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        status: 'loading',
        buffering: true 
      }));

      // Descarrega qualquer player existente
      if (player) {
        await player.unloadAsync();
      }

      // Configura o modo de áudio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Cria e carrega o novo player
      const { sound } = await Audio.Sound.createAsync(
        { uri: RADIO_CONFIG.STREAM_URL },
        { 
          shouldPlay: true,
          volume: state.volume,
        }
      );

      // Configura o listener de status
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setState(prev => ({
            ...prev,
            status: 'live',
            buffering: status.isBuffering,
            isPlaying: status.isPlaying,
          }));
        } else {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: 'Erro ao carregar a rádio',
          }));
        }
      });

      setPlayer(sound);
      setState(prev => ({ 
        ...prev, 
        isPlaying: true, 
        isLoading: false,
        status: 'live',
        buffering: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        status: 'error',
        error: RADIO_CONFIG.ERROR_MESSAGES.LOAD_ERROR,
      }));
    }
  }, [player, state.volume]);

  const stop = useCallback(async () => {
    try {
      if (player) {
        await player.stopAsync();
        await player.unloadAsync();
        setPlayer(null);
        setState(prev => ({ 
          ...prev, 
          isPlaying: false,
          status: 'offline',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: RADIO_CONFIG.ERROR_MESSAGES.STOP_ERROR,
      }));
    }
  }, [player]);

  const togglePlayback = useCallback(async () => {
    if (state.isPlaying) {
      await stop();
    } else {
      await loadAndPlay();
    }
  }, [state.isPlaying, loadAndPlay, stop]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (player) {
        player.unloadAsync();
      }
    };
  }, [player]);

  return {
    ...state,
    togglePlayback,
    stop,
    setVolume,
    toggleMute,
  };
} 