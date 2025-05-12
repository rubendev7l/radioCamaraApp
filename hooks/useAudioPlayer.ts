/**
 * useAudioPlayer.ts
 * 
 * Hook personalizado para gerenciamento de reprodução de áudio.
 * Fornece funcionalidades avançadas para streaming de áudio com:
 * - Controle de reprodução
 * - Gerenciamento de estado
 * - Tratamento de erros
 * - Reconexão automática
 * - Notificações
 * - Persistência de estado
 * 
 * Funcionalidades:
 * - Reprodução em background
 * - Reconexão automática
 * - Feedback tátil
 * - Logging de erros
 * - Notificações persistentes
 * - Validação de estado
 * - Otimização de recursos
 * 
 * Estados:
 * - isPlaying: Estado atual da reprodução
 * - initialLoadError: Erro inicial de carregamento
 * - retryCount: Contador de tentativas de reconexão
 * 
 * Dependências:
 * - expo-av: Para streaming de áudio
 * - expo-notifications: Para notificações
 * - @react-native-async-storage/async-storage: Para persistência
 * - hooks/useStreamStatus: Para status do stream
 * - hooks/useNetworkStatus: Para status da rede
 * 
 * @author Equipe de Desenvolvimento da Câmara Municipal
 * @version 1.0.0
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Audio } from 'expo-av';
import { Platform, Vibration, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStreamStatus } from './useStreamStatus';
import { useNetworkStatus } from './useNetworkStatus';
import { RADIO_CONFIG } from '../constants/radio';

const PLAYBACK_STATE_KEY = '@radio_playback_state';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;
const VIBRATION_PATTERN = [0, 100, 200, 100];
const BACKGROUND_UPDATE_INTERVAL = 5000; // 5 segundos em background
const FOREGROUND_UPDATE_INTERVAL = 1000; // 1 segundo em foreground

// Tipos para validação de estado
type PlaybackState = {
  wasPlaying: boolean;
  lastError?: string;
  timestamp: number;
  retryCount: number;
};

type ErrorType = 'NETWORK' | 'PLAYBACK' | 'PERMISSION' | 'UNKNOWN' | 'LOADING';

export const useAudioPlayer = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const lastErrorRef = useRef<{ type: ErrorType; message: string } | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { updateStatus, handleError, canPlay } = useStreamStatus();
  const { isNetworkSuitableForStreaming } = useNetworkStatus();

  // Memoize callbacks para evitar re-renders desnecessários
  const provideFeedback = useCallback((type: 'error' | 'success' | 'warning') => {
    if (Platform.OS === 'android') {
      switch (type) {
        case 'error':
          Vibration.vibrate(VIBRATION_PATTERN);
          break;
        case 'success':
          Vibration.vibrate(100);
          break;
        case 'warning':
          Vibration.vibrate([0, 50, 100, 50]);
          break;
      }
    }
  }, []);

  // Otimizar logging para reduzir operações em background
  const logError = useCallback((type: ErrorType, error: any, context?: string) => {
    if (appStateRef.current === 'active') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ${type} Error${context ? ` in ${context}` : ''}:`, {
        message: errorMessage,
        type,
        context,
        stack: error instanceof Error ? error.stack : undefined,
      });
      lastErrorRef.current = { type, message: errorMessage };
    }
  }, []);

  // Validação de estado
  const validatePlaybackState = useCallback(async (): Promise<boolean> => {
    try {
      const savedState = await AsyncStorage.getItem(PLAYBACK_STATE_KEY);
      if (!savedState) return true;

      const state: PlaybackState = JSON.parse(savedState);
      const now = Date.now();
      const isRecent = now - state.timestamp < 24 * 60 * 60 * 1000; // 24 horas

      if (!isRecent) {
        await AsyncStorage.removeItem(PLAYBACK_STATE_KEY);
        return true;
      }

      return state.retryCount < MAX_RETRY_ATTEMPTS;
    } catch (error) {
      logError('UNKNOWN', error, 'validatePlaybackState');
      return true;
    }
  }, [logError]);

  // Carrega o estado salvo com validação
  const loadSavedState = async () => {
    try {
      const isValid = await validatePlaybackState();
      if (!isValid) {
        await AsyncStorage.removeItem(PLAYBACK_STATE_KEY);
        return;
      }

      const savedState = await AsyncStorage.getItem(PLAYBACK_STATE_KEY);
      if (savedState) {
        const state: PlaybackState = JSON.parse(savedState);
        if (state.wasPlaying) {
          await setupAudio();
        }
      }
    } catch (error) {
      logError('UNKNOWN', error, 'loadSavedState');
      provideFeedback('error');
    }
  };

  // Salva o estado atual com validação
  const savePlaybackState = async (wasPlaying: boolean) => {
    try {
      const state: PlaybackState = {
        wasPlaying,
        timestamp: Date.now(),
        retryCount: retryCountRef.current,
        lastError: lastErrorRef.current?.message,
      };
      await AsyncStorage.setItem(PLAYBACK_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      logError('UNKNOWN', error, 'savePlaybackState');
      provideFeedback('error');
    }
  };

  // Reconexão automática melhorada
  const retryPlayback = useCallback(async () => {
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      const errorMessage = 'Não foi possível reconectar após várias tentativas. Tente novamente mais tarde.';
      handleError(errorMessage);
      logError('PLAYBACK', errorMessage, 'retryPlayback');
      provideFeedback('error');
      retryCountRef.current = 0;
      return;
    }

    retryCountRef.current++;
    console.log(`Tentativa de reconexão ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}`);

    try {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      await setupAudio();
      provideFeedback('success');
    } catch (error) {
      logError('PLAYBACK', error, 'retryPlayback');
      provideFeedback('error');
      retryPlayback();
    }
  }, [handleError, logError, provideFeedback]);

  // Configura a notificação persistente
  const setupNotification = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('radio-playback', {
        name: 'Reprodução da Rádio',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableVibrate: true,
        enableLights: true,
      });
    }
  };

  const showPlaybackNotification = async (isPlaying: boolean) => {
    if (Platform.OS === 'android') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rádio Câmara Sete Lagoas',
          body: isPlaying ? 'Ao vivo' : 'Pausado',
          data: { type: 'playback' },
          sticky: true,
          autoDismiss: false,
        },
        trigger: null,
        android: {
          channelId: 'radio-playback',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sticky: true,
          ongoing: true,
          autoCancel: false,
          showWhen: false,
        },
      } as Notifications.NotificationRequestInput);
    }
  };

  // Gerenciar estado do app para otimizar recursos
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App voltou ao foreground
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
        updateIntervalRef.current = setInterval(() => {
          if (soundRef.current && isPlaying) {
            soundRef.current.getStatusAsync();
          }
        }, FOREGROUND_UPDATE_INTERVAL);
      } else if (nextAppState.match(/inactive|background/)) {
        // App foi para background
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
        updateIntervalRef.current = setInterval(() => {
          if (soundRef.current && isPlaying) {
            soundRef.current.getStatusAsync();
          }
        }, BACKGROUND_UPDATE_INTERVAL);
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Otimizar setup de áudio
  const setupAudio = useCallback(async () => {
    try {
      await setupNotification();
      
      // Configurar modo de áudio otimizado
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: 1, // DO_NOT_MIX
        interruptionModeIOS: 1, // DO_NOT_MIX
        allowsRecordingIOS: false,
      });

      // Limpar player existente para evitar vazamentos de memória
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (error) {
          logError('PLAYBACK', error, 'cleanupExistingPlayer');
        }
        soundRef.current = null;
      }

      // Criar novo player com configurações otimizadas
      const { sound } = await Audio.Sound.createAsync(
        { uri: RADIO_CONFIG.STREAM_URL },
        { 
          shouldPlay: false,
          progressUpdateIntervalMillis: appStateRef.current === 'active' 
            ? FOREGROUND_UPDATE_INTERVAL 
            : BACKGROUND_UPDATE_INTERVAL,
          androidImplementation: 'MediaPlayer', // Mais estável no Android
          volume: 1.0,
          rate: 1.0,
          isLooping: false,
          isMuted: false,
        }
      );

      soundRef.current = sound;
      updateStatus('idle');

      // Verificar se é uma central multimídia
      const isCarHeadUnit = Platform.OS === 'android' && 
        (await AsyncStorage.getItem('isCarHeadUnit') === 'true');

      if (isCarHeadUnit || isNetworkSuitableForStreaming()) {
        try {
          await sound.playAsync();
          await showPlaybackNotification(true);
          await savePlaybackState(true);
          retryCountRef.current = 0;
          provideFeedback('success');
        } catch (playError) {
          const errorMessage = 'Não foi possível iniciar a reprodução. Verifique sua conexão e tente novamente.';
          setInitialLoadError(errorMessage);
          logError('PLAYBACK', playError, 'setupAudio');
          provideFeedback('error');
          retryPlayback();
        }
      } else {
        const errorMessage = 'Conexão de rede instável. Aguarde uma conexão melhor para ouvir a rádio.';
        setInitialLoadError(errorMessage);
        logError('NETWORK', errorMessage, 'setupAudio');
        provideFeedback('warning');
      }
    } catch (error) {
      logError('UNKNOWN', error, 'setupAudio');
      handleError(error instanceof Error ? error.message : 'Erro desconhecido');
      provideFeedback('error');
      retryPlayback();
    }
  }, [isNetworkSuitableForStreaming, updateStatus, handleError, retryPlayback, logError, provideFeedback]);

  // Detectar se está rodando em uma central multimídia
  useEffect(() => {
    const detectCarHeadUnit = async () => {
      if (Platform.OS === 'android') {
        try {
          const isCar = await AsyncStorage.getItem('isCarHeadUnit');
          if (!isCar) {
            // Verificar características típicas de centrais multimídia
            const isCarHeadUnit = 
              Platform.constants.Brand?.toLowerCase().includes('android') &&
              !Platform.constants.Brand?.toLowerCase().includes('phone');
            
            await AsyncStorage.setItem('isCarHeadUnit', isCarHeadUnit.toString());
          }
        } catch (error) {
          console.error('Error detecting car head unit:', error);
        }
      }
    };

    detectCarHeadUnit();
  }, []);

  // Otimizar toggle de reprodução
  const togglePlayback = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        await showPlaybackNotification(false);
        await savePlaybackState(false);
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
      } else {
        // Verificar estado do player antes de tocar
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) {
          await setupAudio();
          return;
        }

        await soundRef.current.playAsync();
        await showPlaybackNotification(true);
        await savePlaybackState(true);
        updateIntervalRef.current = setInterval(() => {
          if (soundRef.current) {
            soundRef.current.getStatusAsync();
          }
        }, appStateRef.current === 'active' ? FOREGROUND_UPDATE_INTERVAL : BACKGROUND_UPDATE_INTERVAL);
      }
    } catch (error) {
      logError('PLAYBACK', error, 'togglePlayback');
      handleError(error instanceof Error ? error.message : 'Erro desconhecido');
      provideFeedback('error');
      retryPlayback();
    }
  }, [isPlaying, handleError, retryPlayback, logError, provideFeedback, setupAudio]);

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

  // Carrega estado salvo ao montar
  useEffect(() => {
    loadSavedState();
  }, []);

  // Cleanup otimizado
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch (error) {
            logError('PLAYBACK', error, 'cleanup');
          }
          soundRef.current = null;
        }
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
        if (Platform.OS === 'android') {
          await Notifications.dismissAllNotificationsAsync();
        }
      };
      cleanup();
    };
  }, [logError]);

  // Memoize valores retornados para evitar re-renders
  return useMemo(() => ({
    isPlaying,
    initialLoadError,
    togglePlayback,
    setupAudio,
  }), [isPlaying, initialLoadError, togglePlayback, setupAudio]);
}; 