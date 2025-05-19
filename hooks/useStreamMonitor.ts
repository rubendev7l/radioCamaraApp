/**
 * useStreamMonitor.ts
 * 
 * Hook personalizado para monitoramento contínuo do status do stream de áudio.
 * Fornece verificação periódica da disponibilidade do stream com:
 * - Verificação automática a cada 30 segundos
 * - Notificações de mudança de status
 * - Monitoramento do estado do app
 * - Tratamento de erros
 * 
 * Funcionalidades:
 * - Verificação periódica do stream
 * - Notificações de status
 * - Monitoramento de estado do app
 * - Reconexão automática
 * - Logging de erros
 * - Gerenciamento de estado
 * 
 * Estados:
 * - isStreamOnline: Status atual do stream
 * - isChecking: Em processo de verificação
 * - streamError: Mensagem de erro (se houver)
 * 
 * Dependências:
 * - expo-av: Para verificação do stream
 * - expo-notifications: Para notificações
 * - constants/radio: Para configurações
 * 
 * @author Equipe de Desenvolvimento da Câmara Municipal
 * @version 1.0.0
 */

import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { Platform, AppState } from 'react-native';
import { RADIO_CONFIG } from '../constants/radio';
import ForegroundService from '../services/ForegroundService';
import {
  STREAM_CHECK_INTERVAL,
  STREAM_TIMEOUT,
  NOTIFICATION_COOLDOWN,
  DEBUG_MODE,
  LOG_LEVEL
} from '@env';

const CHECK_INTERVAL = parseInt(STREAM_CHECK_INTERVAL);
const TIMEOUT = parseInt(STREAM_TIMEOUT);
const COOLDOWN = parseInt(NOTIFICATION_COOLDOWN);

export const useStreamMonitor = () => {
  const checkInterval = useRef<NodeJS.Timeout>();
  const [isStreamOnline, setIsStreamOnline] = useState<boolean | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const lastStatus = useRef<'online' | 'offline'>('online');
  const appState = useRef(AppState.currentState);
  const lastNotificationTime = useRef<number>(0);

  const checkStreamStatus = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: RADIO_CONFIG.STREAM_URL },
        { shouldPlay: false }
      );

      await sound.unloadAsync();

      if (lastStatus.current === 'offline') {
        // Garante que a notificação anterior seja removida antes de criar uma nova
        await ForegroundService.stopNotification();
        await ForegroundService.updateNotification(true);
        lastStatus.current = 'online';
        setStreamError(null);
      }
      setIsStreamOnline(true);
    } catch (error) {
      const errorMessage = 'Transmissão temporariamente fora do ar. Tentaremos reconectar em 30 segundos...';
      setStreamError(errorMessage);
      
      // Só atualiza a notificação se passou o tempo de cooldown
      const now = Date.now();
      if (lastStatus.current === 'online' && (now - lastNotificationTime.current > COOLDOWN)) {
        // Garante que a notificação anterior seja removida antes de criar uma nova
        await ForegroundService.stopNotification();
        await ForegroundService.updateNotification(false, 'Sem conexão com a internet');
        lastStatus.current = 'offline';
        lastNotificationTime.current = now;
      }
      setIsStreamOnline(false);
    }
  };

  useEffect(() => {
    // Inicializar o serviço de notificações
    ForegroundService.initialize();

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