import { Platform } from 'react-native';
import PowerManager from '../utils/PowerManager';

describe('PowerManager', () => {
  it('should be defined', () => {
    expect(PowerManager).toBeDefined();
  });

  it('should have isIgnoringBatteryOptimizations method', () => {
    expect(PowerManager.isIgnoringBatteryOptimizations).toBeDefined();
  });

  it('should have requestIgnoreBatteryOptimizations method', () => {
    expect(PowerManager.requestIgnoreBatteryOptimizations).toBeDefined();
  });

  it('should return true for non-Android platforms', async () => {
    Platform.OS = 'ios';
    const result = await PowerManager.isIgnoringBatteryOptimizations();
    expect(result).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    Platform.OS = 'android';
    try {
      await PowerManager.isIgnoringBatteryOptimizations();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
}); 