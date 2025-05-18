import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';

export function usePermissions() {
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const { status: notificationStatus } = await Notifications.getPermissionsAsync();
        const permission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        const granted = notificationStatus === 'granted' && permission;
        console.log('Status das permissões:', { notificationStatus, permission, granted });
        setHasPermissions(granted);
        return granted;
      } else {
        const { status } = await Notifications.getPermissionsAsync();
        const granted = status === 'granted';
        console.log('Status das permissões iOS:', { status, granted });
        setHasPermissions(granted);
        return granted;
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setHasPermissions(false);
      return false;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        // Primeiro, solicita a permissão do Android
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Permissão de Notificações',
            message: 'O app precisa de permissão para mostrar notificações e manter a rádio tocando em segundo plano.',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        // Se a permissão do Android foi concedida, solicita a permissão do Expo
        if (permission === PermissionsAndroid.RESULTS.GRANTED) {
          const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
          const granted = notificationStatus === 'granted';
          console.log('Resultado da solicitação de permissões:', { notificationStatus, permission, granted });
          setHasPermissions(granted);
          return granted;
        }

        console.log('Permissão do Android negada:', permission);
        setHasPermissions(false);
        return false;
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        const granted = status === 'granted';
        console.log('Resultado da solicitação de permissões iOS:', { status, granted });
        setHasPermissions(granted);
        return granted;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      setHasPermissions(false);
      return false;
    }
  };

  return { hasPermissions, requestPermissions };
} 