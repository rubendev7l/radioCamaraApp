// app/tabs/index.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar, SafeAreaView, BackHandler, TouchableOpacity, Alert } from 'react-native';
import { RadioPlayer } from '../../components/RadioPlayer';
import { RADIO_CONFIG } from '../../constants/radio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { UpdatesStateEventType } from 'expo-updates';

function useOtaUpdateNotifier() {
  useEffect(() => {
    const subscription = Updates.addUpdatesStateChangeListener((event) => {
      if (event.state === 'finished') {
        Alert.alert('Atualização', 'O app foi atualizado! Aproveite as novidades.');
      }
    });
    return () => subscription.remove();
  }, []);
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useOtaUpdateNotifier();
  
  const handleExit = () => {
    BackHandler.exitApp();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Image
        source={RADIO_CONFIG.ASSETS.BACKGROUND_IMAGE}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.helpIcon}
        onPress={() => router.push('/help')}
        accessibilityLabel="Ajuda"
        accessibilityRole="button"
      >
        <Ionicons name="help-circle-outline" size={28} color="#007AFF" />
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <RadioPlayer 
          currentStation={{
            id: 'radio-camara-sete-lagoas',
            name: RADIO_CONFIG.STATION_NAME,
            streamUrl: RADIO_CONFIG.STREAM_URL,
            description: RADIO_CONFIG.STATION_DESCRIPTION,
          }}
          onExit={handleExit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  helpIcon: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    backgroundColor: '#E6F0FF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});