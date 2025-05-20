import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PowerManager } = NativeModules;

class PowerManagerModule {
  private eventEmitter: NativeEventEmitter | null = null;

  constructor() {
    if (Platform.OS === 'android') {
      this.eventEmitter = new NativeEventEmitter(PowerManager);
    }
  }

  async isIgnoringBatteryOptimizations(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      return await PowerManager.isIgnoringBatteryOptimizations();
    } catch (error) {
      console.error('Error checking battery optimizations:', error);
      return false;
    }
  }

  async requestIgnoreBatteryOptimizations(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      return await PowerManager.requestIgnoreBatteryOptimizations();
    } catch (error) {
      console.error('Error requesting battery optimizations:', error);
      return false;
    }
  }

  addListener(eventName: string, callback: (isOptimized: boolean) => void) {
    if (Platform.OS !== 'android' || !this.eventEmitter) return { remove: () => {} };
    
    // Inicia a verificação periódica do status
    const interval = setInterval(() => {
      PowerManager.checkBatteryOptimizationStatus();
    }, 5000); // Verifica a cada 5 segundos

    const subscription = this.eventEmitter.addListener(eventName, callback);

    return {
      remove: () => {
        clearInterval(interval);
        subscription.remove();
      }
    };
  }
}

export default new PowerManagerModule(); 