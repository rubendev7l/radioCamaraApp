declare module '@voximplant/react-native-foreground-service' {
  interface NotificationChannelConfig {
    id: string;
    name: string;
    description?: string;
    importance?: number;
    enableVibration?: boolean;
  }

  interface NotificationConfig {
    channelId: string;
    id: number;
    title: string;
    text: string;
    icon: string;
    button?: string;
    priority?: number;
  }

  class VIForegroundService {
    static getInstance(): VIForegroundService;
    createNotificationChannel(config: NotificationChannelConfig): Promise<void>;
    startService(config: NotificationConfig): Promise<void>;
    stopService(): Promise<void>;
    on(event: string, handler: () => void): void;
    off(event: string, handler?: () => void): void;
  }

  export default VIForegroundService;
} 