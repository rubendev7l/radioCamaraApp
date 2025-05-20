import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import PowerManager from '../utils/PowerManager';

export const useBatteryOptimization = () => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkOptimization = async () => {
    if (Platform.OS !== 'android') {
      setIsOptimized(false);
      setIsChecking(false);
      return;
    }

    try {
      const isIgnoring = await PowerManager.isIgnoringBatteryOptimizations();
      setIsOptimized(!isIgnoring);
    } catch (error) {
      console.error('Error checking battery optimization:', error);
      setIsOptimized(false);
    } finally {
      setIsChecking(false);
    }
  };

  const requestIgnoreOptimization = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const success = await PowerManager.requestIgnoreBatteryOptimizations();
      if (success) {
        await checkOptimization();
      }
      return success;
    } catch (error) {
      console.error('Error requesting battery optimization:', error);
      return false;
    }
  };

  useEffect(() => {
    checkOptimization();

    const subscription = PowerManager.addListener('batteryOptimizationChanged', (isOptimized) => {
      setIsOptimized(isOptimized);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    isOptimized,
    isChecking,
    checkOptimization,
    requestIgnoreOptimization,
  };
}; 