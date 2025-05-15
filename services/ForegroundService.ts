import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'radio-playback';
const NOTIFICATION_ID = 1;

// Configurar o comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const ForegroundService = {
  async initialize() {
    try {
      // Inicializar configurações de notificação
      const defaultSettings = { playback: true };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(defaultSettings));

      if (Platform.OS === 'android') {
        console.log('[ForegroundService] Inicializando canal de notificação');
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Rádio Câmara',
          description: 'Serviço de streaming da Rádio Câmara',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0],
          lightColor: '#FF231F7C',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
          sound: null,
          enableLights: true,
          enableVibrate: false,
          showBadge: true,
        });
        console.log('[ForegroundService] Canal de notificação inicializado');
      }
    } catch (error) {
      console.error('[ForegroundService] Erro ao inicializar o canal de notificação:', error);
    }
  },

  async startService(isPlaying: boolean = true) {
    try {
      console.log('[ForegroundService] startService chamado, isPlaying:', isPlaying);
      
      // Verificar se as notificações estão habilitadas
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (!settings) {
        // Se não existir configuração, criar uma padrão
        await this.initialize();
      }

      const { playback } = JSON.parse(settings || '{"playback": true}');
      if (!playback) {
        console.log('[ForegroundService] Notificações desativadas pelo usuário. Parando serviço.');
        await this.stopService();
        return;
      }

      await Notifications.dismissAllNotificationsAsync();

      const notificationContent = {
        title: 'Rádio Câmara Sete Lagoas',
        body: isPlaying ? '🎵 Tocando agora' : '⏸️ Pausado',
        data: { isPlaying },
        android: {
          channelId: CHANNEL_ID,
          priority: 'high',
          sticky: true,
          icon: './assets/images/notification-icon.png',
          color: '#FF231F7C',
          actions: [
            {
              title: isPlaying ? '⏸️ Pausar' : '▶️ Tocar',
              pressAction: {
                id: 'TOGGLE_PLAYBACK',
              },
              icon: isPlaying ? 'pause' : 'play',
            },
            {
              title: '❌ Fechar',
              pressAction: {
                id: 'STOP',
              },
              icon: 'close',
            },
          ],
          importance: 'high',
          visibility: 'public',
          showWhen: true,
          autoCancel: false,
          ongoing: true,
          fullScreenIntent: true,
          category: 'call',
        },
      };

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null,
        identifier: String(NOTIFICATION_ID),
      });
      console.log('[ForegroundService] Notificação agendada/atualizada');
    } catch (error) {
      console.error('[ForegroundService] Erro ao iniciar o serviço em primeiro plano:', error);
    }
  },

  async updateNotification(isPlaying: boolean) {
    try {
      console.log('[ForegroundService] updateNotification chamado, isPlaying:', isPlaying);
      await this.startService(isPlaying);
    } catch (error) {
      console.error('[ForegroundService] Erro ao atualizar a notificação:', error);
    }
  },

  async stopService() {
    try {
      console.log('[ForegroundService] stopService chamado');
      await Notifications.dismissAllNotificationsAsync();
      console.log('[ForegroundService] Notificações removidas');
    } catch (error) {
      console.error('[ForegroundService] Erro ao parar o serviço em primeiro plano:', error);
    }
  },

  onButtonPress(handler: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },

  offButtonPress(subscription: { remove: () => void }) {
    subscription.remove();
  }
};