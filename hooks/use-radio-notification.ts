import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings } from '../types/radio';

interface UseRadioNotificationProps {
  stationName: string;
  isPlaying: boolean;
  hasError: boolean;
  onTogglePlayback: () => void;
  onStop: () => void;
}

export function useRadioNotification({
  stationName,
  isPlaying,
  hasError,
  onTogglePlayback,
  onStop,
}: UseRadioNotificationProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    playback: true,
    updates: true,
  });

  useEffect(() => {
    loadSettings();
    setupNotificationHandlers();
  }, []);

  useEffect(() => {
    if (settings.playback) {
      updateNotification();
    }
  }, [isPlaying, hasError, settings.playback]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('notificationSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const setupNotificationHandlers = () => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const actionId = response.actionIdentifier;
        if (actionId === 'TOGGLE_PLAYBACK') {
          onTogglePlayback();
        } else if (actionId === 'STOP') {
          onStop();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  };

  const updateNotification = async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();

      if (!hasError || !isPlaying) {
        const notificationContent = {
          title: stationName,
          body: hasError ? 'Transmissão fora do ar' : (isPlaying ? 'Tocando agora' : 'Pausado'),
          sound: false,
          android: {
            channelId: 'radio-playback',
            priority: 'max',
            sticky: true,
            icon: './assets/images/notification-icon.png',
            color: '#FF231F7C',
            actions: [
              {
                title: hasError ? 'Tentar novamente' : (isPlaying ? 'Pausar' : 'Tocar'),
                pressAction: {
                  id: 'TOGGLE_PLAYBACK',
                },
              },
              {
                title: 'Fechar',
                pressAction: {
                  id: 'STOP',
                },
              },
            ],
          },
        };

        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const toggleNotificationSetting = async (key: keyof NotificationSettings) => {
    try {
      const newSettings = {
        ...settings,
        [key]: !settings[key],
      };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error toggling notification setting:', error);
    }
  };

  return {
    settings,
    toggleNotificationSetting,
  };
} 