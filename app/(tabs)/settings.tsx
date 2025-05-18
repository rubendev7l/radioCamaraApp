import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { RADIO_CONFIG } from '../../constants/radio';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

interface NotificationSettings {
  playback: boolean;
}

export default function SettingsScreen() {
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    playback: true,
  });
  const [hasPermission, setHasPermission] = React.useState<boolean>(false);

  React.useEffect(() => {
    checkNotificationPermission();
    loadNotificationSettings();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      const finalStatus = existingStatus;
      setHasPermission(finalStatus === 'granted');
    } catch (error) {
      console.error('Error checking notification permission:', error);
      setHasPermission(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationSettings({
          playback: parsedSettings.playback,
        });
      } else {
        // Se não tem configurações salvas, ativa por padrão
        setNotificationSettings({ playback: true });
        await AsyncStorage.setItem('notificationSettings', JSON.stringify({ playback: true }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleNotificationChange = async (type: keyof NotificationSettings) => {
    if (!hasPermission) {
      await requestNotificationPermission();
      return;
    }

    const newSettings = {
      ...notificationSettings,
      [type]: !notificationSettings[type],
    };
    
    setNotificationSettings(newSettings);
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (granted) {
        const newSettings = { playback: true };
        setNotificationSettings(newSettings);
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      } else {
        Alert.alert(
          'Permissão Necessária',
          'Para receber notificações e manter a rádio tocando em segundo plano, você precisa permitir o acesso nas configurações do seu dispositivo.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Abrir Configurações',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleSocialMediaPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.camarasete.mg.gov.br');
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
            Notificações
          </Text>
          <View style={[styles.settingItem, styles.settingCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
                Notificações de Reprodução
              </Text>
              <Text style={[styles.settingDescription, { color: COLORS.TEXT.DARK }]}>
                {hasPermission 
                  ? 'Receba notificações sobre o status da reprodução da rádio'
                  : 'Permita notificações para manter a rádio tocando em segundo plano'}
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

          <View style={styles.linksContainer}>
            <TouchableOpacity 
              style={[styles.linkButton, styles.card]}
              onPress={handleOpenWebsite}
            >
              <Ionicons name="globe-outline" size={24} color={COLORS.PRIMARY} />
              <Text style={[styles.linkButtonText, { color: COLORS.TEXT.DARK }]}>Site da Câmara</Text>
              <Ionicons name="chevron-forward" size={24} color={COLORS.PRIMARY} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.linkButton, styles.card, styles.spotifyButton]}
              onPress={() => handleSocialMediaPress('https://open.spotify.com/show/01a4F30Ajd5CThsrbKsbWx')}
            >
              <FontAwesome name="spotify" size={24} color="#1DB954" />
              <Text style={[styles.linkButtonText, { color: COLORS.TEXT.DARK }]}>Podcast no Spotify</Text>
              <Ionicons name="chevron-forward" size={24} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
            Suporte
          </Text>
          <View style={[styles.supportCard, styles.card]}>
            <Text style={[styles.supportText, { color: COLORS.TEXT.DARK }]}>
              Em caso de problemas com o aplicativo ou com a transmissão da rádio, entre em contato com nosso suporte técnico:
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
              onPress={() => Linking.openURL('mailto:rodrigo.cpd@camarasete.mg.gov.br?subject=Suporte%20Técnico%20-%20App%20Rádio%20Câmara&body=Olá,%20gostaria%20de%20reportar%20um%20problema%20com%20o%20aplicativo:')}
            >
              <Ionicons name="mail" size={24} color="white" />
              <Text style={[styles.buttonText, { color: 'white' }]}>Suporte Técnico</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  socialButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linksContainer: {
    marginTop: 16,
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
  },
  linkButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  spotifyButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  supportCard: {
    padding: 16,
    marginHorizontal: 16,
  },
  supportText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionContainer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 'auto',
  },
  versionText: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 