import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Platform, AppState } from 'react-native';
import { RADIO_CONFIG } from '../constants/radio';

const CHECK_INTERVAL = 30000; // 30 segundos

export const useStreamMonitor = () => {
  const checkInterval = useRef<NodeJS.Timeout>();
  const [isStreamOnline, setIsStreamOnline] = useState<boolean | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const lastStatus = useRef<'online' | 'offline'>('online');
  const appState = useRef(AppState.currentState);

  const checkStreamStatus = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: RADIO_CONFIG.STREAM_URL },
        { shouldPlay: false }
      );

      await sound.unloadAsync();

      if (lastStatus.current === 'offline') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Rádio Câmara',
            body: 'A transmissão voltou ao ar! Você já pode ouvir a rádio.',
            sound: true,
          },
          trigger: null,
        });
        lastStatus.current = 'online';
        setStreamError(null);
      }
      setIsStreamOnline(true);
    } catch (error) {
      const errorMessage = 'Transmissão temporariamente fora do ar. Tentaremos reconectar em 30 segundos...';
      setStreamError(errorMessage);
      
      if (lastStatus.current === 'online') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Rádio Câmara',
            body: errorMessage,
            sound: true,
          },
          trigger: null,
        });
        lastStatus.current = 'offline';
      }
      setIsStreamOnline(false);
    }
  };

  useEffect(() => {
    // Configurar notificações
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Monitorar estado do app
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App voltou ao primeiro plano
        checkStreamStatus();
      }
      appState.current = nextAppState;
    });

    // Verificação imediata ao montar o componente
    checkStreamStatus();

    // Iniciar monitoramento periódico
    checkInterval.current = setInterval(checkStreamStatus, CHECK_INTERVAL);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
      subscription.remove();
    };
  }, []);

  return {
    isStreamOnline,
    isChecking: isStreamOnline === null,
    streamError
  };
}; 