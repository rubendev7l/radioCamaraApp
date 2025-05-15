import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Platform, SafeAreaView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[
          styles.container,
          isSmallScreen && styles.containerSmall
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Ajuda & Dicas</Text>
        <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>🔋 Otimização de Bateria</Text>
        <Text style={[styles.text, isSmallScreen && styles.textSmall]}>
          Para garantir que o áudio continue tocando com a tela bloqueada ou em segundo plano, desative as otimizações de bateria para este aplicativo nas configurações do seu dispositivo Android.
          {'\n\n'}Como fazer:
          {'\n'}1. Abra as Configurações do seu aparelho.
          {'\n'}2. Procure por "Bateria" ou "Otimização de bateria".
          {'\n'}3. Encontre o app "Rádio Câmara Sete Lagoas" na lista.
          {'\n'}4. Selecione "Não otimizar" ou "Permitir atividade em segundo plano".
        </Text>
        <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>🔔 Permissões</Text>
        <Text style={[styles.text, isSmallScreen && styles.textSmall]}>
          Certifique-se de permitir notificações e acesso à internet para o app funcionar corretamente.
        </Text>
        <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>❓ Dúvidas Frequentes</Text>
        <Text style={[styles.text, isSmallScreen && styles.textSmall]}>
          - O áudio para sozinho? Verifique a otimização de bateria.
          {'\n'}- O app não toca em background? Veja as dicas acima.
        </Text>
        <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>📧 Suporte</Text>
        <Text style={[styles.text, isSmallScreen && styles.textSmall]}>
          Em caso de dúvidas, entre em contato: {' '}
          <Text style={styles.link} onPress={() => Linking.openURL('mailto:suporte@camarasete.mg.gov.br')}>
            suporte@camarasete.mg.gov.br
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: 24,
    backgroundColor: 'transparent',
  },
  containerSmall: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleSmall: {
    fontSize: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitleSmall: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  textSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 