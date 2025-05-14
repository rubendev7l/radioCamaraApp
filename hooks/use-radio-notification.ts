import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings } from '../types/radio';
import { ForegroundService } from '../services/ForegroundService';

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
    const subscription = ForegroundService.onButtonPress((response) => {
      const actionId = response.actionIdentifier;
      if (actionId === 'TOGGLE_PLAYBACK') {
        onTogglePlayback();
      } else if (actionId === 'STOP') {
        onStop();
      }
    });

    return () => {
      ForegroundService.offButtonPress(subscription);
    };
  };

  const updateNotification = async () => {
    try {
      if (!settings.playback) {
        await ForegroundService.stopService();
        return;
      }

      if (!hasError || !isPlaying) {
        await ForegroundService.startService(isPlaying);
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

      if (key === 'playback' && !newSettings.playback) {
        await ForegroundService.stopService();
      }
    } catch (error) {
      console.error('Error toggling notification setting:', error);
    }
  };

  return {
    settings,
    toggleNotificationSetting,
  };
} 