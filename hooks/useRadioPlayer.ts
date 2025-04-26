import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { RADIO_CONFIG, PLAYER_CONFIG } from '../constants/radio';

/** 
 * Interface que define o estado do player de rádio
 * Contém todas as informações necessárias para controle da reprodução
 */
interface RadioPlayerState {
  isPlaying: boolean;      // Indica se está tocando
  isLoading: boolean;      // Indica se está carregando
  error: string | null;    // Mensagem de erro, se houver
  volume: number;          // Volume atual (0-1)
  isMuted: boolean;        // Indica se está mudo
  previousVolume: number;  // Volume antes de mutar
  status: 'offline' | 'loading' | 'live' | 'error';  // Status atual do player
  buffering: boolean;      // Indica se está buffering
}

/** 
 * Hook personalizado para gerenciar a reprodução de rádio
 * Fornece controle completo sobre o player de áudio
 */
export function useRadioPlayer() {
  /** Referência para o player de áudio */
  const [player, setPlayer] = useState<Audio.Sound | null>(null);
  
  /** Estado inicial do player */
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

  /** 
   * Ajusta o volume do player
   * @param newVolume Novo volume (0-1)
   */
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

  /** 
   * Alterna entre mudo e desmudo
   * Mantém o volume anterior para restaurar ao desmutar
   */
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

  /** 
   * Carrega e inicia a reprodução
   * Configura o player e inicia o stream
   */
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

      // Configura o modo de áudio para reprodução em background
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

      // Configura o listener de status para monitorar a reprodução
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

  /** 
   * Para a reprodução e limpa o player
   * Descarrega o áudio e reseta o estado
   */
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
        error: RADIO_CONFIG.ERROR_MESSAGES.PLAYBACK_ERROR,
      }));
    }
  }, [player]);

  /** 
   * Alterna entre play e pause
   * Gerencia o estado de reprodução
   */
  const togglePlayback = useCallback(async () => {
    if (state.isPlaying) {
      await stop();
    } else {
      await loadAndPlay();
    }
  }, [state.isPlaying, loadAndPlay, stop]);

  /** 
   * Efeito de limpeza ao desmontar o componente
   * Garante que o player seja descarregado
   */
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