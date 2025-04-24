import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

export default function MessagesScreen() {
  const { isDarkMode } = useTheme();

  const handleWhatsAppPress = async () => {
    try {
      await Linking.openURL('https://wa.me/5531986340773');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo-cm7.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
        <View style={styles.infoHeader}>
          <Ionicons 
            name="radio" 
            size={24} 
            color={COLORS.PRIMARY} 
          />
          <Text style={[styles.infoTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Sobre a Rádio Câmara
          </Text>
        </View>
        <Text style={[styles.infoText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
          A Rádio Câmara Sete Lagoas é um canal de comunicação oficial da Câmara Municipal, 
          transmitindo ao vivo as sessões legislativas e oferecendo uma programação diversificada 
          com informações sobre as atividades do Poder Legislativo.
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
          Nossa missão é manter a população informada sobre os trabalhos dos vereadores, 
          projetos em tramitação e decisões importantes para o município, promovendo 
          transparência e participação popular.
        </Text>
      </View>

      <View style={[styles.contactCard, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
        <View style={styles.infoHeader}>
          <Ionicons 
            name="chatbubble-ellipses" 
            size={24} 
            color={COLORS.PRIMARY} 
          />
          <Text style={[styles.infoTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Participe!
          </Text>
        </View>
        <Text style={[styles.infoText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
          Não deixe de participar! Peça suas músicas favoritas ou envie recados 
          através do WhatsApp. Clique no botão abaixo ou adicione nosso número aos seus contatos.
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
          onPress={handleWhatsAppPress}
          accessibilityLabel="Abrir WhatsApp"
          accessibilityRole="button"
        >
          <Ionicons name="logo-whatsapp" size={24} color="white" />
          <Text style={[styles.buttonText, { color: 'white' }]}>WhatsApp</Text>
        </TouchableOpacity>
        
        <Text style={[styles.phoneNumber, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
          (31) 98634-0773
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logo: {
    width: 200,
    height: 100,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
  },
  contactCard: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneNumber: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
}); 