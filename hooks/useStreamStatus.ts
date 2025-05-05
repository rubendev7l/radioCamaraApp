import { useState, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

export type StreamStatus = 'idle' | 'loading' | 'playing' | 'buffering' | 'error';

interface StreamState {
  status: StreamStatus;
  error: string | null;
  isBuffering: boolean;
  retryCount: number;
}

export const useStreamStatus = () => {
  const [streamState, setStreamState] = useState<StreamState>({
    status: 'idle',
    error: null,
    isBuffering: false,
    retryCount: 0
  });

  const { isNetworkSuitableForStreaming, quality } = useNetworkStatus();

  const updateStatus = (status: StreamStatus, error: string | null = null) => {
    setStreamState(prev => ({
      ...prev,
      status,
      error,
      isBuffering: status === 'buffering'
    }));
  };

  const handleError = (error: string) => {
    setStreamState(prev => ({
      ...prev,
      status: 'error',
      error,
      retryCount: prev.retryCount + 1
    }));
  };

  const resetRetryCount = () => {
    setStreamState(prev => ({
      ...prev,
      retryCount: 0
    }));
  };

  // Monitora mudanças na qualidade da rede
  useEffect(() => {
    if (!isNetworkSuitableForStreaming() && streamState.status === 'playing') {
      updateStatus('buffering');
    }
  }, [quality]);

  return {
    ...streamState,
    updateStatus,
    handleError,
    resetRetryCount,
    canPlay: isNetworkSuitableForStreaming()
  };
}; 