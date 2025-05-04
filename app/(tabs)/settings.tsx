import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { RADIO_CONFIG } from '../../constants/radio';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  general: boolean;
  sessions: boolean;
  specialPrograms: boolean;
  maintenance: boolean;
  playback: boolean;
}

export default function SettingsScreen() {
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    general: true,
    sessions: false,
    specialPrograms: false,
    maintenance: true,
    playback: true,
  });

  React.useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        setNotificationSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleNotificationChange = async (type: keyof NotificationSettings) => {
    let newSettings: NotificationSettings;
    
    if (type === 'general') {
      // Se estiver ativando notificações gerais, ativa todas as outras disponíveis
      newSettings = {
        ...notificationSettings,
        general: !notificationSettings.general,
        maintenance: !notificationSettings.general,
        playback: !notificationSettings.general,
      };
    } else {
      // Se estiver desativando uma notificação específica, desativa também a geral
      newSettings = {
        ...notificationSettings,
        [type]: !notificationSettings[type],
        general: false,
      };

      // Se todas as notificações disponíveis estiverem ativas, ativa a geral
      if (type === 'maintenance' && !notificationSettings[type] && notificationSettings.playback) {
        newSettings.general = true;
      } else if (type === 'playback' && !notificationSettings[type] && notificationSettings.maintenance) {
        newSettings.general = true;
      }
    }
    
    setNotificationSettings(newSettings);
    
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleSocialMediaPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
            Notificações
          </Text>
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
                Notificações Gerais
              </Text>
            </View>
            <Switch
              value={notificationSettings.general}
              onValueChange={() => handleNotificationChange('general')}
              trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
              thumbColor={COLORS.TEXT.DARK}
            />
          </View>

          <View style={[styles.settingItem, styles.disabledSetting]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: COLORS.TEXT.DARK, opacity: 0.5 }]}>
                Sessões da Câmara
              </Text>
              <Text style={[styles.disabledText, { color: COLORS.TEXT.DARK }]}>
                (Em breve)
              </Text>
            </View>
            <Switch
              value={false}
              disabled={true}
              trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
              thumbColor={COLORS.TEXT.DARK}
            />
          </View>

          <View style={[styles.settingItem, styles.disabledSetting]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: COLORS.TEXT.DARK, opacity: 0.5 }]}>
                Programas Especiais
              </Text>
              <Text style={[styles.disabledText, { color: COLORS.TEXT.DARK }]}>
                (Em breve)
              </Text>
            </View>
            <Switch
              value={false}
              disabled={true}
              trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
              thumbColor={COLORS.TEXT.DARK}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
                Manutenção
              </Text>
            </View>
            <Switch
              value={notificationSettings.maintenance}
              onValueChange={() => handleNotificationChange('maintenance')}
              trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
              thumbColor={COLORS.TEXT.DARK}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
                Notificações de Reprodução
              </Text>
            </View>
            <Switch
              value={notificationSettings.playback}
              onValueChange={() => handleNotificationChange('playback')}
              trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
              thumbColor={COLORS.TEXT.DARK}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
            Redes Sociais
          </Text>
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.FACEBOOK)}
            >
              <Ionicons name="logo-facebook" size={32} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.INSTAGRAM)}
            >
              <Ionicons name="logo-instagram" size={32} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.YOUTUBE)}
            >
              <Ionicons name="logo-youtube" size={32} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.FLICKR)}
            >
              <Ionicons name="logo-flickr" size={32} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
            Suporte
          </Text>
          <Text style={[styles.supportText, { color: COLORS.TEXT.DARK }]}>
            Em caso de problemas com o aplicativo, entre em contato com nosso suporte técnico:
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => Linking.openURL('mailto:rodrigo.cpd@camarasete.mg.gov.br?subject=Suporte%20Técnico%20-%20App%20Rádio%20Câmara&body=Olá,%20gostaria%20de%20reportar%20um%20problema%20com%20o%20aplicativo:')}
          >
            <Ionicons name="mail" size={24} color="white" />
            <Text style={[styles.buttonText, { color: 'white' }]}>Suporte Técnico</Text>
          </TouchableOpacity>

          <Text style={[styles.supportText, { color: COLORS.TEXT.DARK, marginTop: 24 }]}>
            Em caso de problemas com a transmissão da rádio:
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => handleSocialMediaPress('https://wa.me/5531986340773')}
          >
            <Ionicons name="logo-whatsapp" size={24} color="white" />
            <Text style={[styles.buttonText, { color: 'white' }]}>Contato da Rádio</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: COLORS.TEXT.DARK }]}>
          Versão {Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  socialButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND,
    elevation: 4,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND,
    elevation: 2,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  supportText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  disabledSetting: {
    opacity: 0.7,
  },
  disabledText: {
    fontSize: 12,
    marginTop: 2,
  },
}); 