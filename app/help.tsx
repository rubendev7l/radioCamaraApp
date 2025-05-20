import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Platform, SafeAreaView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

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
        <View style={styles.header}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Ajuda & Dicas</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="battery-charging-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              Otimização de Bateria
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.text, isSmallScreen && styles.textSmall]}>
              Para garantir que o áudio continue tocando com a tela bloqueada ou em segundo plano, siga estes passos:
            </Text>
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Abra as Configurações do seu aparelho</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Procure por "Bateria" ou "Otimização de bateria"</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Encontre o app "Rádio Câmara Sete Lagoas"</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>Selecione "Não otimizar" ou "Permitir atividade em segundo plano"</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              Notificações
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.text, isSmallScreen && styles.textSmall]}>
              Mantenha as notificações ativas para:
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.featureText}>Controlar a reprodução pela notificação</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.featureText}>Manter a rádio tocando em segundo plano</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.featureText}>Receber alertas importantes</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              Dúvidas Frequentes
            </Text>
          </View>
          <View style={styles.card}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>O áudio para sozinho?</Text>
              <Text style={styles.faqAnswer}>Verifique se a otimização de bateria está desativada nas configurações do seu dispositivo.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>O app não toca em background?</Text>
              <Text style={styles.faqAnswer}>Certifique-se de que as notificações estão ativas e a otimização de bateria está desativada.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Como compartilhar a rádio?</Text>
              <Text style={styles.faqAnswer}>Use o botão de compartilhar no player para enviar o link da rádio para seus amigos.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              Suporte
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.text, isSmallScreen && styles.textSmall]}>
              Em caso de dúvidas ou problemas, entre em contato com nosso suporte técnico:
            </Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => Linking.openURL('mailto:rodrigo.cpd@camarasete.mg.gov.br?subject=Suporte%20Técnico%20-%20App%20Rádio%20Câmara')}
            >
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.supportButtonText}>Contato Suporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    padding: 20,
  },
  containerSmall: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT.DARK,
  },
  titleSmall: {
    fontSize: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT.DARK,
  },
  sectionTitleSmall: {
    fontSize: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    marginBottom: 16,
  },
  textSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#666666',
  },
  featuresList: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#666666',
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT.DARK,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 