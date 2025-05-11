/**
 * Interface que define a estrutura de uma estação de rádio
 * Contém as informações necessárias para reprodução do stream
 */
export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  description?: string;
}

/**
 * Props do componente principal do player de rádio
 */
export interface RadioPlayerProps {
  currentStation: RadioStation;
  onExit: () => void;
}

/**
 * Status do player de áudio
 */
export interface AudioPlayerStatus {
  isPlaying: boolean;
  hasError: boolean;
  isMuted: boolean;
}

/**
 * Configuração de notificações
 */
export interface NotificationSettings {
  playback: boolean;
  updates: boolean;
} 