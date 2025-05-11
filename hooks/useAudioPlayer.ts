import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useStreamStatus } from './useStreamStatus';
import { useNetworkStatus } from './useNetworkStatus';
import { RADIO_CONFIG } from '../constants/radio';

export const useAudioPlayer = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const { updateStatus, handleError, canPlay } = useStreamStatus();
  const { isNetworkSuitableForStreaming } = useNetworkStatus();

  const setupAudio = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: 1, // DUCK_OTHERS
        interruptionModeIOS: 1, // DUCK_OTHERS
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: RADIO_CONFIG.STREAM_URL },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      updateStatus('idle');

      // Tenta iniciar a reprodução automaticamente
      if (isNetworkSuitableForStreaming()) {
        try {
          await sound.playAsync();
        } catch (playError) {
          const errorMessage = 'Não foi possível iniciar a reprodução. Verifique sua conexão e tente novamente.';
          setInitialLoadError(errorMessage);
          console.error('Erro ao iniciar reprodução:', playError);
        }
      } else {
        const errorMessage = 'Conexão de rede instável. Aguarde uma conexão melhor para ouvir a rádio.';
        setInitialLoadError(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Erro ao inicializar o player. Tente reiniciar o aplicativo.';
      handleError(errorMessage);
      setInitialLoadError(errorMessage);
      console.error(errorMessage, error);
    }
  }, [isNetworkSuitableForStreaming]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      if (status.error) {
        const errorMessage = `Erro na reprodução: ${status.error}. Tente novamente.`;
        handleError(errorMessage);
        setInitialLoadError(errorMessage);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setInitialLoadError(null);
    
    if (status.isBuffering) {
      updateStatus('buffering');
    } else if (status.isPlaying) {
      updateStatus('playing');
    } else if (soundRef.current) {
      // Se não está tocando mas o player existe, verifica o estado
      if (status.isBuffering || status.isLoaded === false) {
        updateStatus('buffering');
      } else {
        updateStatus('paused');
      }
    }
  };

  const play = useCallback(async () => {
    if (!soundRef.current) {
      await setupAudio();
    }

    if (!isNetworkSuitableForStreaming()) {
      const errorMessage = 'Conexão de rede instável. Aguarde uma conexão melhor para ouvir a rádio.';
      handleError(errorMessage);
      setInitialLoadError(errorMessage);
      return;
    }

    try {
      updateStatus('loading');
      await soundRef.current?.playAsync();
      setInitialLoadError(null);
    } catch (error) {
      const errorMessage = 'Erro ao iniciar a reprodução. Tente novamente.';
      handleError(errorMessage);
      setInitialLoadError(errorMessage);
      console.error(errorMessage, error);
    }
  }, [isNetworkSuitableForStreaming]);

  const pause = useCallback(async () => {
    try {
      const status = await soundRef.current?.getStatusAsync();
      
      if (status?.isLoaded) {
        if (status.isBuffering) {
          updateStatus('buffering');
        } else {
          await soundRef.current?.pauseAsync();
          updateStatus('paused');
        }
      } else {
        updateStatus('error', RADIO_CONFIG.ERROR_MESSAGES.ERROR_LOADING_STREAM);
      }
    } catch (error) {
      const errorMessage = 'Erro ao pausar a reprodução. Tente novamente.';
      handleError(errorMessage);
      console.error(errorMessage, error);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await soundRef.current?.stopAsync();
      updateStatus('idle');
    } catch (error) {
      const errorMessage = 'Erro ao parar a reprodução. Tente novamente.';
      handleError(errorMessage);
      console.error(errorMessage, error);
    }
  }, []);

  useEffect(() => {
    setupAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return {
    isPlaying,
    play,
    pause,
    stop,
    canPlay,
    initialLoadError
  };
}; 