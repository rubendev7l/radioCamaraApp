import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export type NetworkQuality = 'excellent' | 'good' | 'poor' | 'unavailable';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  quality: NetworkQuality;
  details: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string | null;
    strength?: number | null;
  };
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    quality: 'good',
    details: {}
  });

  useEffect(() => {
    let unsubscribe: NetInfoSubscription;

    const setupNetworkListener = async () => {
      // Configuração inicial
      const state = await NetInfo.fetch();
      updateNetworkStatus(state);

      // Listener para mudanças
      unsubscribe = NetInfo.addEventListener(updateNetworkStatus);
    };

    setupNetworkListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const updateNetworkStatus = (state: NetInfoState) => {
    const quality = determineNetworkQuality(state);
    
    setNetworkStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      quality,
      details: {
        isConnectionExpensive: state.details?.isConnectionExpensive,
        cellularGeneration: state.type === 'cellular' ? state.details?.cellularGeneration : undefined,
        strength: state.type === 'wifi' ? state.details?.strength : undefined
      }
    });
  };

  const determineNetworkQuality = (state: NetInfoState): NetworkQuality => {
    if (!state.isConnected || !state.isInternetReachable) {
      return 'unavailable';
    }

    switch (state.type) {
      case 'wifi':
        return state.details?.strength ? 'excellent' : 'good';
      case 'cellular':
        const generation = state.details?.cellularGeneration;
        if (generation === '5g' || generation === '4g') {
          return 'good';
        }
        return 'poor';
      default:
        return 'poor';
    }
  };

  const isNetworkSuitableForStreaming = () => {
    return networkStatus.quality !== 'unavailable' && 
           networkStatus.quality !== 'poor' &&
           networkStatus.isConnected &&
           networkStatus.isInternetReachable;
  };

  return {
    ...networkStatus,
    isNetworkSuitableForStreaming
  };
}; 