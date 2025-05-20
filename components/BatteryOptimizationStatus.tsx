import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, Animated, useColorScheme } from 'react-native';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export const BatteryOptimizationStatus = () => {
  const { isOptimized, isChecking } = useBatteryOptimization();
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    if (isOptimized && isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOptimized, isVisible]);

  if (Platform.OS !== 'android' || isChecking || !isVisible) {
    return null;
  }

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  return (
    <Modal
      transparent
      visible={isOptimized && isVisible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={[
        styles.modalOverlay,
        { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }
      ]}>
        <Animated.View 
          style={[
            styles.modalContent,
            { 
              opacity: fadeAnim,
              backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
            }
          ]}
        >
          <View style={styles.header}>
            <MaterialIcons
              name="battery-alert"
              size={24}
              color={COLORS.ERROR}
            />
            <Text style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : COLORS.ERROR }
            ]}>
              Otimização de Bateria
            </Text>
            <TouchableOpacity 
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Fechar mensagem"
              accessibilityRole="button"
            >
              <MaterialIcons 
                name="close" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#666666'} 
              />
            </TouchableOpacity>
          </View>

          <Text style={[
            styles.message,
            { color: isDark ? '#E1E1E1' : '#333333' }
          ]}>
            O modo economia de bateria está ativado e pode interromper a reprodução da rádio. Para uma melhor experiência, recomendamos desativar a otimização de bateria.
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: COLORS.PRIMARY }
            ]}
            onPress={handleClose}
          >
            <Text style={styles.actionButtonText}>Entendi</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 