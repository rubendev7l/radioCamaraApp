import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export const BatteryOptimizationStatus = () => {
  const { isOptimized, isChecking } = useBatteryOptimization();

  if (Platform.OS !== 'android' || isChecking) {
    return null;
  }

  return (
    <View testID="battery-optimization-status" style={styles.container}>
      <MaterialIcons
        name={isOptimized ? 'battery-alert' : 'battery-full'}
        size={24}
        color={isOptimized ? COLORS.ERROR : COLORS.STATUS.LIVE}
      />
      <Text style={[styles.text, isOptimized && styles.warning]}>
        {isOptimized
          ? 'Modo economia de bateria pode interromper a reprodução'
          : 'Otimização de bateria desativada'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    marginVertical: 4,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.TEXT.DARK,
  },
  warning: {
    color: COLORS.ERROR,
  },
}); 