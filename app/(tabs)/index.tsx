// app/tabs/index.tsx
import React from 'react';
import { View, StyleSheet, Image, StatusBar, SafeAreaView, BackHandler } from 'react-native';
import { RadioPlayer } from '../../components/RadioPlayer';
import { RADIO_CONFIG } from '../../constants/radio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
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
});