import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  Text,
  Platform,
  AppState,
  AppStateStatus,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { RADIO_CONFIG } from '../constants/radio';
import { AudioWave } from './AudioWave';
import * as Notifications from 'expo-notifications';

interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  description?: string;
}

interface RadioPlayerProps {
  currentStation: RadioStation;
  onExit: () => void;
}

export function RadioPlayer({ currentStation, onExit }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState as AppStateStatus);

  useEffect(() => {
    setupAudio();
    setupNotifications();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const actionId = response.actionIdentifier;
        if (actionId === 'TOGGLE_PLAYBACK') {
          togglePlayback();
        } else if (actionId === 'STOP') {
          handleExit();
        }
      }
    );

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      subscription.remove();
      notificationSubscription.remove();
    };
  }, []);

  const setupNotifications = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('radio-playback', {
        name: 'Radio Playback',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        sound: null,
      });
    }

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to foreground
      await updateNotification();
    }
    appState.current = nextAppState;
  };

  const updateNotification = async () => {
    if (isPlaying) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rádio Câmara Sete Lagoas',
          body: 'Tocando agora',
          sound: false,
          data: { url: currentStation.streamUrl },
        },
        trigger: null,
      });

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            priority: Notifications.AndroidNotificationPriority.MAX,
            sticky: true,
            vibrate: false,
            android: {
              channelId: 'radio-playback',
              actions: [
                {
                  title: isPlaying ? 'Pausar' : 'Tocar',
                  icon: isPlaying ? 'ic_pause' : 'ic_play',
                  identifier: 'TOGGLE_PLAYBACK',
                  buttonType: 'default',
                },
                {
                  title: 'Fechar',
                  icon: 'ic_close',
                  identifier: 'STOP',
                  buttonType: 'cancel',
                },
              ],
            },
          }),
        });
      }
    } else {
      await Notifications.dismissAllNotificationsAsync();
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentStation.streamUrl },
        { shouldPlay: false }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setIsBuffering(status.isBuffering);
          setHasError(false);
          if (status.isPlaying) {
            updateNotification();
          }
        } else {
          setHasError(true);
        }
      });

      // Configurar análise de áudio
      if (Platform.OS === 'android') {
        await sound.setVolumeAsync(1.0);
        await sound.setIsMutedAsync(false);
        await sound.setProgressUpdateIntervalAsync(100); // Atualizar a cada 100ms
      }
    } catch (error) {
      console.error('Error setting up audio:', error);
      setHasError(true);
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setHasError(true);
    }
  };

  const toggleMute = async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleClosePress = () => {
    Alert.alert(
      'Sair do aplicativo',
      'Deseja realmente sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {},
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: handleExit,
        },
      ],
      { cancelable: true }
    );
  };

  const handleExit = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }
    onExit();
  };

  const handleReload = async () => {
    setHasError(false);
    setIsBuffering(true);
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      await setupAudio();
      if (soundRef.current) {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error reloading audio:', error);
      setHasError(true);
    } finally {
      setIsBuffering(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
    >
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/logo-white.png')}
          style={styles.logo}
        />
        
        <View style={styles.waveContainer}>
          <AudioWave isPlaying={isPlaying} />
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleMute}
            accessibilityLabel={isMuted ? "Ativar som" : "Desativar som"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={isMuted ? "volume-mute" : "volume-high"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayback}
            accessibilityLabel={isPlaying ? "Pausar" : "Tocar"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleClosePress}
            accessibilityLabel="Fechar"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          {isPlaying ? (
            <View style={styles.liveContainer}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AO VIVO</Text>
            </View>
          ) : (
            <Text style={styles.offlineText}>OFFLINE</Text>
          )}
        </View>

        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </View>
        )}

        {hasError && (
          <View style={styles.errorContainer}>
            <TouchableOpacity 
              style={styles.reloadButton}
              onPress={handleReload}
            >
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
              <Text style={styles.reloadText}>Recarregar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  logo: {
    width: 280,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  waveContainer: {
    width: '100%',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 15,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  bufferingContainer: {
    marginTop: 20,
  },
  errorContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reloadText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 