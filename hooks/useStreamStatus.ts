/**
 * useStreamStatus.ts
 * 
 * Hook personalizado para gerenciamento do status do stream de áudio.
 * Fornece um sistema robusto de monitoramento e controle de estado com:
 * - Monitoramento de conexão
 * - Verificação de disponibilidade do stream
 * - Gerenciamento de estados de buffering
 * - Tratamento de erros
 * - Logging detalhado
 * 
 * Estados do Stream:
 * - idle: Inicial
 * - loading: Carregando stream
 * - playing: Reprodução ativa
 * - paused: Reprodução pausada
 * - buffering: Bufferizando
 * - error: Erro na reprodução
 * - offline: Stream indisponível
 * - no_internet: Sem conexão
 * - reconnecting: Reconectando
 * 
 * Funcionalidades:
 * - Monitoramento de conexão
 * - Verificação de stream
 * - Gerenciamento de buffering
 * - Tratamento de erros
 * - Logging de mudanças
 * - Mensagens de status
 * 
 * Dependências:
 * - hooks/useNetworkStatus: Para status da rede
 * - hooks/useStreamMonitor: Para monitoramento do stream
 * - constants/radio: Para mensagens de erro
 * 
 * @author Equipe de Desenvolvimento da Câmara Municipal
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useStreamMonitor } from './useStreamMonitor';
import { RADIO_CONFIG } from '../constants/radio';

type StreamStatusType = 
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'error'
  | 'offline'
  | 'no_internet'
  | 'reconnecting';

const logStateChange = (from: StreamStatusType, to: StreamStatusType, isBuffering: boolean, reason?: string) => {
  const logMessage = {
    type: 'StreamStatus',
    from,
    to,
    isBuffering,
    reason: reason || 'Sem motivo específico'
  };
  console.log('Estado:', JSON.stringify(logMessage, null, 2));
};

export const useStreamStatus = () => {
  const [status, setStatus] = useState<StreamStatusType>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const { isStreamOnline, isChecking, streamError } = useStreamMonitor();

  // Log inicial para teste
  useEffect(() => {
    const initialState = {
      type: 'InitialState',
      status,
      isBuffering,
      connection: { isConnected, isInternetReachable },
      stream: { isStreamOnline, isChecking }
    };
    console.log('Estado Inicial:', JSON.stringify(initialState, null, 2));
  }, []);

  // Efeito para monitorar mudanças na conexão e status do stream
  useEffect(() => {
    const connectionState = {
      type: 'ConnectionChange',
      isConnected,
      isInternetReachable,
      isStreamOnline,
      isChecking,
      currentStatus: status
    };
    console.log('Mudança de Conexão:', JSON.stringify(connectionState, null, 2));

    // Não altera o status se estiver em playing ou paused
    if (status === 'playing' || status === 'paused') {
      return;
    }

    // Se não há conexão, força o status para no_internet
    if (!isConnected || !isInternetReachable) {
      logStateChange(status, 'no_internet', false, 'Sem conexão com a internet');
      setStatus('no_internet');
      setError(RADIO_CONFIG.ERROR_MESSAGES.NO_INTERNET);
      setIsBuffering(false);
      return;
    }

    // Se está verificando o status do stream, mantém loading
    if (isChecking) {
      logStateChange(status, 'loading', true, 'Verificando status do stream');
      setStatus('loading');
      setIsBuffering(true);
      return;
    }

    // Se o stream está offline, força o status para offline
    if (!isStreamOnline) {
      logStateChange(status, 'offline', false, 'Stream offline');
      setStatus('offline');
      setError(RADIO_CONFIG.ERROR_MESSAGES.STREAM_OFFLINE);
      setIsBuffering(false);
      return;
    }

    // Se estava offline ou sem internet e agora tem conexão e stream online,
    // volta para loading para iniciar a reprodução
    if ((status === 'offline' || status === 'no_internet') && 
        isConnected && 
        isInternetReachable && 
        isStreamOnline) {
      logStateChange(status, 'loading', true, 'Conexão restaurada, iniciando stream');
      setStatus('loading');
      setError(null);
      setIsBuffering(true);
    }
  }, [isConnected, isInternetReachable, isStreamOnline, isChecking, status]);

  const updateStatus = useCallback((newStatus: StreamStatusType, errorMessage?: string) => {
    // Não altera o status se não houver conexão
    if (!isConnected || !isInternetReachable) {
      logStateChange(status, 'no_internet', false, 'Sem conexão com a internet');
      setStatus('no_internet');
      setError(RADIO_CONFIG.ERROR_MESSAGES.NO_INTERNET);
      setIsBuffering(false);
      return;
    }

    // Se está verificando o status do stream, mantém loading
    if (isChecking) {
      logStateChange(status, 'loading', true, 'Verificando status do stream');
      setStatus('loading');
      setIsBuffering(true);
      return;
    }

    // Não altera o status se o stream estiver offline
    if (!isStreamOnline) {
      logStateChange(status, 'offline', false, 'Stream offline');
      setStatus('offline');
      setError(RADIO_CONFIG.ERROR_MESSAGES.STREAM_OFFLINE);
      setIsBuffering(false);
      return;
    }

    // Atualiza o status normalmente
    logStateChange(status, newStatus, isBuffering, errorMessage);
    setStatus(newStatus);
    setError(errorMessage || null);

    // Lógica específica de buffering para cada estado
    let newBufferingState = isBuffering;
    switch (newStatus) {
      case 'playing':
        newBufferingState = false;
        break;
      case 'paused':
        // Mantém o buffering se já estava buffering
        break;
      case 'buffering':
        newBufferingState = true;
        break;
      case 'loading':
      case 'reconnecting':
        newBufferingState = true;
        break;
      case 'error':
      case 'offline':
      case 'no_internet':
        newBufferingState = false;
        break;
      default:
        newBufferingState = false;
    }

    if (newBufferingState !== isBuffering) {
      const bufferingChange = {
        type: 'BufferingChange',
        from: isBuffering,
        to: newBufferingState,
        status: newStatus
      };
      console.log('Mudança de Buffering:', JSON.stringify(bufferingChange, null, 2));
    }
    setIsBuffering(newBufferingState);
  }, [isConnected, isInternetReachable, isStreamOnline, isChecking, status, isBuffering]);

  const handleError = useCallback((errorMessage: string) => {
    // Não altera o status se não houver conexão
    if (!isConnected || !isInternetReachable) {
      logStateChange(status, 'no_internet', false, 'Sem conexão com a internet');
      setStatus('no_internet');
      setError(RADIO_CONFIG.ERROR_MESSAGES.NO_INTERNET);
      setIsBuffering(false);
      return;
    }

    logStateChange(status, 'error', false, errorMessage);
    setError(errorMessage);
    setStatus('error');
    setIsBuffering(false);
  }, [isConnected, isInternetReachable, status]);

  const getStatusMessage = useCallback(() => {
    // Prioridade 1: Sem conexão
    if (!isConnected || !isInternetReachable) {
      return RADIO_CONFIG.ERROR_MESSAGES.NO_INTERNET;
    }

    // Prioridade 2: Stream offline
    if (!isStreamOnline && !isChecking) {
      return RADIO_CONFIG.ERROR_MESSAGES.STREAM_OFFLINE;
    }

    // Prioridade 3: Estados específicos
    switch (status) {
      case 'playing':
        return isBuffering ? 'Carregando...' : 'Ao vivo';
      case 'paused':
        return isBuffering ? 'Carregando...' : 'Ao vivo (pausado)';
      case 'buffering':
      case 'loading':
      case 'reconnecting':
        return 'Carregando...';
      case 'error':
        return error || RADIO_CONFIG.ERROR_MESSAGES.ERROR_LOADING_STREAM;
      case 'offline':
        return RADIO_CONFIG.ERROR_MESSAGES.STREAM_OFFLINE;
      case 'no_internet':
        return RADIO_CONFIG.ERROR_MESSAGES.NO_INTERNET;
      default:
        return 'Carregando...';
    }
  }, [status, error, isConnected, isInternetReachable, isStreamOnline, isChecking, isBuffering]);

  const canPlay = isConnected && isInternetReachable && isStreamOnline && !isChecking;

  return {
    status,
    error,
    isBuffering,
    updateStatus,
    handleError,
    getStatusMessage,
    isConnected,
    isInternetReachable,
    canPlay
  };
}; 