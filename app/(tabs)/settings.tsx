import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { RADIO_CONFIG } from '../../constants/radio';
import * as Linking from 'expo-linking';

interface NotificationSettings {
  general: boolean;
  sessions: boolean;
  specialPrograms: boolean;
  maintenance: boolean;
}

export default function SettingsScreen() {
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    general: true,
    sessions: true,
    specialPrograms: true,
    maintenance: true,
  });

  const handleNotificationChange = (type: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSocialMediaPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
          Notificações
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
              Notificações Gerais
            </Text>
            <Text style={[styles.settingDescription, { color: COLORS.TEXT.DARK }]}>
              Receba alertas sobre transmissões ao vivo e programação especial
            </Text>
          </View>
          <Switch
            value={notificationSettings.general}
            onValueChange={() => handleNotificationChange('general')}
            trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
            thumbColor={COLORS.TEXT.DARK}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
              Sessões da Câmara
            </Text>
            <Text style={[styles.settingDescription, { color: COLORS.TEXT.DARK }]}>
              Avisos sobre início de sessões legislativas
            </Text>
          </View>
          <Switch
            value={notificationSettings.sessions}
            onValueChange={() => handleNotificationChange('sessions')}
            trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
            thumbColor={COLORS.TEXT.DARK}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
              Programas Especiais
            </Text>
            <Text style={[styles.settingDescription, { color: COLORS.TEXT.DARK }]}>
              Alertas sobre entrevistas e programas especiais
            </Text>
          </View>
          <Switch
            value={notificationSettings.specialPrograms}
            onValueChange={() => handleNotificationChange('specialPrograms')}
            trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
            thumbColor={COLORS.TEXT.DARK}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingText, { color: COLORS.TEXT.DARK }]}>
              Manutenção e Atualizações
            </Text>
            <Text style={[styles.settingDescription, { color: COLORS.TEXT.DARK }]}>
              Avisos sobre manutenção programada e atualizações do app
            </Text>
          </View>
          <Switch
            value={notificationSettings.maintenance}
            onValueChange={() => handleNotificationChange('maintenance')}
            trackColor={{ false: COLORS.SECONDARY, true: COLORS.PRIMARY }}
            thumbColor={COLORS.TEXT.DARK}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
          Redes Sociais
        </Text>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.FACEBOOK)}
        >
          <Ionicons name="logo-facebook" size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.socialText, { color: COLORS.TEXT.DARK }]}>
            Facebook
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.INSTAGRAM)}
        >
          <Ionicons name="logo-instagram" size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.socialText, { color: COLORS.TEXT.DARK }]}>
            Instagram
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.YOUTUBE)}
        >
          <Ionicons name="logo-youtube" size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.socialText, { color: COLORS.TEXT.DARK }]}>
            YouTube
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleSocialMediaPress(RADIO_CONFIG.SOCIAL_MEDIA.FLICKR)}
        >
          <Ionicons name="logo-flickr" size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.socialText, { color: COLORS.TEXT.DARK }]}>
            Flickr
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.TEXT.DARK }]}>
          Suporte
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
          onPress={() => Linking.openURL('mailto:rodrigo.cpd@camarasete.mg.gov.br?subject=Suporte%20Técnico%20-%20App%20Rádio%20Câmara&body=Olá,%20gostaria%20de%20reportar%20um%20problema%20com%20o%20aplicativo:')}
          accessibilityLabel="Enviar e-mail para suporte técnico"
          accessibilityRole="button"
        >
          <Ionicons name="mail" size={24} color="white" />
          <Text style={[styles.buttonText, { color: 'white' }]}>Suporte Técnico</Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: COLORS.BACKGROUND }]}>
          <View style={styles.infoHeader}>
            <Ionicons 
              name="information-circle" 
              size={24} 
              color={COLORS.PRIMARY} 
            />
            <Text style={[styles.infoTitle, { color: COLORS.TEXT.DARK }]}>
              E se a RÁDIO estiver fora do ar?
            </Text>
          </View>
          <Text style={[styles.infoText, { color: COLORS.TEXT.DARK }]}>
            Em caso de dúvida ou se a sintonia da RÁDIO Câmara não estiver pegando ou com problemas, ligue:
          </Text>
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={() => handleSocialMediaPress('https://wa.me/5531986340773')}
          >
            <Ionicons name="call" size={20} color={COLORS.PRIMARY} />
            <Text style={[styles.phoneText, { color: COLORS.TEXT.DARK }]}>
              31 98634-0773
            </Text>
          </TouchableOpacity>
          <Text style={[styles.infoText, { color: COLORS.TEXT.DARK }]}>
            De segunda a sexta-feira, das 8 às 17 horas.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SECONDARY,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    marginBottom: 8,
  },
  socialText: {
    marginLeft: 12,
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 