import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Platform } from 'react-native';

export default function HelpScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ajuda & Dicas</Text>
      <Text style={styles.sectionTitle}>🔋 Otimização de Bateria</Text>
      <Text style={styles.text}>
        Para garantir que o áudio continue tocando com a tela bloqueada ou em segundo plano, desative as otimizações de bateria para este aplicativo nas configurações do seu dispositivo Android.
        {'\n\n'}Como fazer:
        {'\n'}1. Abra as Configurações do seu aparelho.
        {'\n'}2. Procure por “Bateria” ou “Otimização de bateria”.
        {'\n'}3. Encontre o app “Rádio Câmara Sete Lagoas” na lista.
        {'\n'}4. Selecione “Não otimizar” ou “Permitir atividade em segundo plano”.
      </Text>
      <Text style={styles.sectionTitle}>🔔 Permissões</Text>
      <Text style={styles.text}>
        Certifique-se de permitir notificações e acesso à internet para o app funcionar corretamente.
      </Text>
      <Text style={styles.sectionTitle}>❓ Dúvidas Frequentes</Text>
      <Text style={styles.text}>
        - O áudio para sozinho? Verifique a otimização de bateria.
        {'\n'}- O app não toca em background? Veja as dicas acima.
      </Text>
      <Text style={styles.sectionTitle}>📧 Suporte</Text>
      <Text style={styles.text}>
        Em caso de dúvidas, entre em contato: {' '}
        <Text style={styles.link} onPress={() => Linking.openURL('mailto:suporte@camarasete.mg.gov.br')}>
          suporte@camarasete.mg.gov.br
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  text: { fontSize: 16, color: '#333', marginBottom: 8 },
  link: { color: '#007AFF', textDecorationLine: 'underline' },
}); 