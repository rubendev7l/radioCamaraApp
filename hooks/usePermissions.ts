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
      if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.INTERNET,
          PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE,
          PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          PermissionsAndroid.PERMISSIONS.VIBRATE,
          PermissionsAndroid.PERMISSIONS.WAKE_LOCK,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        
        const allGranted = Object.values(results).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
          const { status } = await Notifications.requestPermissionsAsync();
          setHasPermissions(status === 'granted');
        }
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        setHasPermissions(status === 'granted');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  return { hasPermissions, requestPermissions };
} 