/**
 * Serviço de Foreground para manter o streaming de áudio ativo em background
 * Este serviço é crítico para o funcionamento do app e deve ser mantido com cuidado
 * 
 * IMPORTANTE:
 * - Nunca altere o ID do canal de notificação ('radio-playback')
 * - Mantenha a prioridade MAX para garantir que a notificação não seja removida
 * - O serviço depende das permissões de notificação
 * - Em caso de problemas, verifique os logs com prefixo 'ForegroundService:'
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import {
  NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_CHANNEL_NAME,
  DEBUG_MODE,
  LOG_LEVEL
} from '@env';

class ForegroundService {
  // Singleton para garantir uma única instância do serviço
  private static instance: ForegroundService;
  // ID do canal de notificação - NÃO ALTERAR
  private notificationChannelId: string | null = null;
  // ID da notificação atual para gerenciamento
  private currentNotificationId: string | null = null;
  // Flag de inicialização
  private isInitialized = false;
  // Listener para interações com a notificação
  private notificationListener: Notifications.Subscription | null = null;
  // Status das permissões
  private hasPermissions = false;

  private constructor() {
    this.setupNotificationListener();
  }

  public static getInstance(): ForegroundService {
    if (!ForegroundService.instance) {
      ForegroundService.instance = new ForegroundService();
    }
    return ForegroundService.instance;
  }

  private setupNotificationListener() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }

    this.notificationListener = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data.type === 'playback') {
        if (Platform.OS === 'android') {
          const { NativeEventEmitter } = require('react-native');
          const eventEmitter = new NativeEventEmitter();
          eventEmitter.emit('notificationPlaybackToggle');
        }
      }
    });
  }

  /**
   * Inicializa o serviço de foreground
   * Deve ser chamado antes de qualquer operação
   * Configura o canal de notificação no Android
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Verificar permissões antes de inicializar
      const { status } = await Notifications.getPermissionsAsync();
      this.hasPermissions = status === 'granted';

      if (!this.hasPermissions) {
        if (DEBUG_MODE === 'true') {
          console.log('ForegroundService: Sem permissões de notificação');
        }
        return;
      }

      if (Platform.OS === 'android') {
        // Configuração do canal de notificação
        // IMPORTANTE: Manter estas configurações para garantir que a notificação não seja removida
        const channel = await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
          name: NOTIFICATION_CHANNEL_NAME,
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: COLORS.PRIMARY,
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
        });
        this.notificationChannelId = channel?.id || null;
      }

      // Configuração do handler de notificações
      // IMPORTANTE: Manter estas configurações para garantir que a notificação seja exibida corretamente
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        }),
      });

      this.isInitialized = true;
      if (DEBUG_MODE === 'true') {
        console.log('ForegroundService inicializado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao inicializar ForegroundService:', error);
      throw error;
    }
  }

  /**
   * Atualiza a notificação com o status atual da reprodução
   * IMPORTANTE: Chamar sempre que o status de reprodução mudar
   */
  async updateNotification(isPlaying: boolean, customMessage?: string) {
    try {
      // Verificar permissões
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        if (DEBUG_MODE === 'true') {
          console.log('ForegroundService: Sem permissões para notificação');
        }
        return;
      }

      // Remover notificação anterior
      if (this.currentNotificationId) {
        await Notifications.dismissNotificationAsync(this.currentNotificationId);
        this.currentNotificationId = null;
      }

      // Criar nova notificação
      // IMPORTANTE: Manter estas configurações para garantir que a notificação seja persistente
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rádio Câmara Sete Lagoas',
          body: customMessage || (isPlaying ? 'Tocando agora' : 'Pausado'),
          data: { type: 'playback' },
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          sticky: true,
          autoDismiss: false,
          sound: true,
        },
        trigger: null,
      });

      this.currentNotificationId = notificationId;
      if (DEBUG_MODE === 'true') {
        console.log('Notificação atualizada:', isPlaying ? 'Tocando' : 'Pausado', 'ID:', notificationId);
      }
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
    }
  }

  /**
   * Remove a notificação atual
   * IMPORTANTE: Chamar quando o streaming for encerrado
   */
  async stopNotification() {
    if (!this.hasPermissions) {
      if (DEBUG_MODE === 'true') {
        console.log('ForegroundService: Sem permissões para remover notificação');
      }
      return;
    }

    if (this.currentNotificationId) {
      try {
        await Notifications.dismissNotificationAsync(this.currentNotificationId);
        this.currentNotificationId = null;
        if (DEBUG_MODE === 'true') {
          console.log('Notificação removida');
        }
      } catch (error) {
        console.error('Erro ao remover notificação:', error);
        throw error;
      }
    }
  }
}

// Exporta uma única instância do serviço
export default ForegroundService.getInstance();