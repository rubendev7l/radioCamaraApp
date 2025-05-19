declare module '@env' {
  // App
  export const APP_ENV: string;
  export const APP_VERSION: string;
  export const APP_BUILD_NUMBER: string;

  // Audio
  export const AUDIO_STREAM_URL: string;
  export const AUDIO_BUFFER_SIZE: string;
  export const AUDIO_UPDATE_INTERVAL: string;

  // Notification
  export const NOTIFICATION_COOLDOWN: string;
  export const NOTIFICATION_CHANNEL_ID: string;
  export const NOTIFICATION_CHANNEL_NAME: string;

  // Monitoring
  export const STREAM_CHECK_INTERVAL: string;
  export const STREAM_TIMEOUT: string;

  // Debug
  export const DEBUG_MODE: string;
  export const LOG_LEVEL: string;
} 