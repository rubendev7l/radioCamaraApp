import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';

export function usePermissions() {
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('Solicitando permissões...');
      
      if (Platform.OS === 'android') {
        // Primeiro, solicita permissão de notificações
        const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
        console.log('Status da permissão de notificações:', notificationStatus);
        
        // Depois, solicita as permissões do Android
        const permissions = [
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ];

        console.log('Solicitando permissões do Android:', permissions);
        
        // Solicita cada permissão individualmente
        const results = await Promise.all(
          permissions.map(async (permission) => {
            try {
              const result = await PermissionsAndroid.request(permission);
              console.log(`Resultado da permissão ${permission}:`, result);
              return result;
            } catch (error) {
              console.error(`Erro ao solicitar permissão ${permission}:`, error);
              return PermissionsAndroid.RESULTS.DENIED;
            }
          })
        );
        
        console.log('Resultados das permissões:', results);
        
        const allGranted = results.every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        console.log('Todas as permissões concedidas:', allGranted);
        setHasPermissions(allGranted && notificationStatus === 'granted');
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('Status da permissão de notificações (iOS):', status);
        setHasPermissions(status === 'granted');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      setHasPermissions(false);
    }
  };

  return { hasPermissions, requestPermissions };
} 