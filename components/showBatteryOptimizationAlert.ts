import { Alert, Platform, Linking } from 'react-native';

export function showBatteryOptimizationAlert() {
  if (Platform.OS !== 'android') return;

  Alert.alert(
    'Permitir uso irrestrito de bateria',
    'Para garantir que o áudio continue tocando com a tela bloqueada ou em segundo plano, permita que o app use a bateria sem restrições nas configurações do seu dispositivo Android.\n\nComo fazer:\n1. Toque em "Abrir configurações" abaixo.\n2. Procure por “Bateria” ou “Otimização de bateria”.\n3. Encontre o app “Rádio Câmara Sete Lagoas” na lista.\n4. Selecione “Não otimizar” ou “Permitir atividade em segundo plano”.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir configurações', onPress: () => Linking.openSettings() }
    ]
  );
} 