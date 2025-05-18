import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { COLORS } from '../constants/colors';

class ForegroundService {
  private static instance: ForegroundService;
  private notificationChannelId: string | null = null;
  private currentNotificationId: string | null = null;
  private isInitialized = false;
  private notificationListener: Notifications.Subscription | null = null;
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

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Verificar permissões antes de inicializar
      const { status } = await Notifications.getPermissionsAsync();
      this.hasPermissions = status === 'granted';

      if (!this.hasPermissions) {
        console.log('ForegroundService: Sem permissões de notificação');
        return;
      }

      if (Platform.OS === 'android') {
        const channel = await Notifications.setNotificationChannelAsync('radio-playback', {
          name: 'Reprodução da Rádio',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: COLORS.PRIMARY,
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
        });
        this.notificationChannelId = channel?.id || null;
      }

      // Configurar o comportamento das notificações
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        }),
      });

      this.isInitialized = true;
      console.log('ForegroundService inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar ForegroundService:', error);
      throw error;
    }
  }

  async updateNotification(isPlaying: boolean) {
    try {
      // Verificar permissões
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('ForegroundService: Sem permissões para notificação');
        return;
      }

      // Remover notificação anterior
      if (this.currentNotificationId) {
        await Notifications.dismissNotificationAsync(this.currentNotificationId);
        this.currentNotificationId = null;
      }

      // Criar nova notificação
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rádio Câmara Sete Lagoas',
          body: isPlaying ? 'Tocando agora' : 'Pausado',
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
      console.log('Notificação atualizada:', isPlaying ? 'Tocando' : 'Pausado', 'ID:', notificationId);
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
    }
  }

  async stopNotification() {
    if (!this.hasPermissions) {
      console.log('ForegroundService: Sem permissões para remover notificação');
      return;
    }

    if (this.currentNotificationId) {
      try {
        await Notifications.dismissNotificationAsync(this.currentNotificationId);
        this.currentNotificationId = null;
        console.log('Notificação removida');
      } catch (error) {
        console.error('Erro ao remover notificação:', error);
        throw error;
      }
    }
  }
}

export default ForegroundService.getInstance();