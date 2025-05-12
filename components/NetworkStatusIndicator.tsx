/**
 * NetworkStatusIndicator.tsx
 * 
 * Componente que exibe o status atual da conexão de rede do dispositivo.
 * Fornece feedback visual sobre a qualidade e tipo de conexão disponível.
 * 
 * Características:
 * - Indicador visual da qualidade da rede
 * - Identificação do tipo de conexão (WiFi/Dados)
 * - Cores dinâmicas baseadas na qualidade
 * - Ícones adaptativos
 * - Suporte a temas claro/escuro
 * 
 * Estados de Qualidade:
 * - excellent: Conexão excelente
 * - good: Conexão boa
 * - poor: Conexão ruim
 * - unavailable: Sem conexão
 * 
 * Tipos de Conexão:
 * - wifi: Conexão WiFi
 * - cellular: Dados móveis
 * - none: Sem conexão
 * 
 * Dependências:
 * - @react-navigation/native: Para temas
 * - @expo/vector-icons: Para ícones
 * - hooks/useNetworkStatus: Para monitoramento da rede
 * 
 * @author Equipe de Desenvolvimento da Câmara Municipal
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNetworkStatus, NetworkQuality } from '../hooks/useNetworkStatus';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

const getQualityColor = (quality: NetworkQuality, colors: any) => {
  switch (quality) {
    case 'excellent':
      return colors.success;
    case 'good':
      return colors.primary;
    case 'poor':
      return colors.warning;
    case 'unavailable':
      return colors.error;
    default:
      return colors.text;
  }
};

const getQualityIcon = (quality: NetworkQuality) => {
  switch (quality) {
    case 'excellent':
      return 'wifi';
    case 'good':
      return 'wifi';
    case 'poor':
      return 'wifi-off';
    case 'unavailable':
      return 'wifi-off';
    default:
      return 'wifi';
  }
};

export const NetworkStatusIndicator = () => {
  const { quality, type } = useNetworkStatus();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialIcons
        name={getQualityIcon(quality)}
        size={20}
        color={getQualityColor(quality, colors)}
      />
      <Text style={[styles.text, { color: colors.text }]}>
        {type === 'wifi' ? 'WiFi' : type === 'cellular' ? 'Dados' : 'Sem conexão'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  text: {
    marginLeft: 4,
    fontSize: 12,
  },
}); 