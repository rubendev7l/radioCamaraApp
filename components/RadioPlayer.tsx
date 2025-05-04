import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  ImageBackground,
  Image,
  Text,
  Platform,
  AppState,
  AppStateStatus,
  Alert,
  Animated,
  useWindowDimensions,
  BackHandler,
  NativeModules,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { AudioWave } from './AudioWave';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 
 * Interface que define a estrutura de uma estação de rádio
 * Contém as informações necessárias para reprodução do stream
 */
interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  description?: string;
}

/** Props do componente principal do player de rádio */
interface RadioPlayerProps {
  currentStation: RadioStation;
  onExit: () => void;
}

export function RadioPlayer({ currentStation, onExit }: RadioPlayerProps) {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  /** Estados principais para controle da reprodução */
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState as AppStateStatus);

  /** 
   * Animação do indicador "AO VIVO"
   * Controla a escala e opacidade do ponto vermelho
   */
  const liveDotScale = useRef(new Animated.Value(1)).current;
  const liveDotOpacity = useRef(new Animated.Value(1)).current;

  /** 
   * Animação da descrição
   * Controla o fade-in e movimento suave
   */
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const descriptionTranslateY = useRef(new Animated.Value(20)).current;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  /** 
   * Efeito que controla a animação do indicador "AO VIVO"
   * Ativa quando está tocando e para quando está pausado
   */
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(liveDotScale, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(liveDotOpacity, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(liveDotScale, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(liveDotOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      liveDotScale.setValue(1);
      liveDotOpacity.setValue(1);
    }
  }, [isPlaying]);

  /** 
   * Efeito que controla as notificações
   * Atualiza a notificação quando o estado de reprodução muda
   */
  useEffect(() => {
    if (notificationsEnabled) {
      updateNotification();
    }
  }, [isPlaying, notificationsEnabled]);

  /** 
   * Efeito de inicialização do player
   * Configura o áudio, notificações e listeners de estado do app
   */
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

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationsEnabled(parsedSettings.playback);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  /** 
   * Configura o canal de notificações no Android
   * Permite controle de reprodução pela notificação
   */
  const setupNotifications = async () => {
    try {
      // Solicita permissão para notificações
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não concedida');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('radio-playback', {
          name: 'Radio Playback',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0],
          lightColor: '#FF231F7C',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
          sound: null,
          enableLights: true,
          enableVibrate: false,
        });
      }

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
            priority: 'max',
            sticky: true,
            icon: './assets/images/notification-icon.png',
            color: '#FF231F7C',
          },
        }),
      });
    } catch (error) {
      console.error('Erro ao configurar notificações:', error);
    }
  };

  /** 
   * Atualiza a notificação de acordo com o estado atual
   */
  const updateNotification = async () => {
    try {
      // Remove todas as notificações existentes
      await Notifications.dismissAllNotificationsAsync();

      const notificationContent = {
        title: 'Rádio Câmara Sete Lagoas',
        body: isPlaying ? 'Tocando agora' : 'Pausado',
        sound: false,
        data: { url: currentStation.streamUrl },
        android: {
          channelId: 'radio-playback',
          priority: 'max',
          sticky: true,
          icon: './assets/images/notification-icon.png',
          color: '#FF231F7C',
          actions: [
            {
              title: isPlaying ? 'Pausar' : 'Tocar',
              pressAction: {
                id: 'TOGGLE_PLAYBACK',
              },
            },
            {
              title: 'Fechar',
              pressAction: {
                id: 'STOP',
              },
            },
          ],
        },
      };

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null,
      });
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
    }
  };

  /** 
   * Gerencia mudanças de estado do app (background/foreground)
   * Atualiza notificações conforme necessário
   */
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (isPlaying && notificationsEnabled) {
        await updateNotification();
      }
    }
    appState.current = nextAppState;
  };

  /** 
   * Configura o player de áudio
   * Habilita reprodução em background e monitora status
   */
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
      setHasError(false);
        } else {
      setHasError(true);
        }
      });

      if (Platform.OS === 'android') {
        await sound.setVolumeAsync(1.0);
        await sound.setIsMutedAsync(false);
        await sound.setProgressUpdateIntervalAsync(100);
      }
        } catch (error) {
      console.error('Error setting up audio:', error);
      setHasError(true);
    }
  };

  /** 
   * Alterna entre reprodução e pausa
   * Atualiza notificações e estado do player
   */
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

  /** 
   * Controla o mudo/desmudo do áudio
   * Mantém a reprodução mas sem som
   */
  const toggleMute = async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  /** 
   * Limpa recursos e fecha o app
   * Para a reprodução e remove notificações
   */
  const handleExit = async () => {
    try {
      // Para a reprodução e libera recursos
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Remove todas as notificações
      await Notifications.dismissAllNotificationsAsync();

      // Libera recursos de áudio
      await Audio.setAudioModeAsync({
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
      });

      // Força o fechamento do app
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        onExit();
      }
    } catch (error) {
      console.error('Erro ao fechar o app:', error);
      // Tenta fechar mesmo se houver erro
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        onExit();
      }
    }
  };

  /** 
   * Gerencia o processo de saída do app
   * Confirma com o usuário antes de fechar
   */
  const handleClosePress = () => {
    Alert.alert(
      'Sair do aplicativo',
      'Deseja realmente sair? O app será fechado completamente.',
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

  /** 
   * Tenta reconectar em caso de erro
   * Reinicia o player e a reprodução
   */
  const handleReload = async () => {
    setHasError(false);
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      await setupAudio();
      if (soundRef.current) {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error reloading:', error);
      setHasError(true);
    }
  };

  /** 
   * Efeito que controla a animação da descrição
   * Inicia quando o componente é montado
   */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(descriptionOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(descriptionTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /** 
   * Renderiza o player de rádio com layout responsivo
   * Adapta-se para web e mobile com diferentes tamanhos
   */
  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {/** Container principal com layout responsivo */}
      <View style={[
        styles.content,
        isWeb && {
          flex: 1,
          width: '100%',
          height: height,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Math.min(width * 0.05, 20),
        }
      ]}>
        {/** Container interno com largura máxima para melhor legibilidade */}
        <View style={[
          styles.innerContent,
          isWeb && {
            width: '100%',
            maxWidth: Math.min(width * 0.9, 800),
            alignItems: 'center',
            justifyContent: 'center',
          }
        ]}>
          {/** Descrição da estação com animação */}
          <Animated.Text 
            style={[
              styles.description,
              isWeb && {
                fontSize: Math.min(width * 0.02, 16),
                marginBottom: Math.min(height * 0.02, 20),
              },
              {
                opacity: descriptionOpacity,
                transform: [{ translateY: descriptionTranslateY }],
              }
            ]}
          >
            {currentStation.description}
          </Animated.Text>

          {/** Logo da rádio com tamanho responsivo */}
          <Image 
            source={require('../assets/images/logo-white.png')}
            style={[
              styles.logo,
              isWeb && {
                width: Math.min(width * 0.4, 400),
                height: Math.min(height * 0.3, 300),
                marginBottom: 5,
              }
            ]}
          />
          
          {/** Container da onda de áudio com largura responsiva */}
          <View style={[
            styles.waveContainer,
            isWeb && {
              width: '100%',
              maxWidth: Math.min(width * 0.9, 800),
            }
          ]}>
            <AudioWave isPlaying={isPlaying} />
          </View>
        
          {/** Controles de reprodução com layout responsivo */}
          <View style={[
            styles.controls,
            isWeb && {
              width: '100%',
              maxWidth: Math.min(width * 0.6, 600),
              justifyContent: 'center',
            }
          ]}>
            {/** Botão de mudo com tamanho adaptativo */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isWeb && {
                  width: Math.min(width * 0.15, 80),
                  height: Math.min(width * 0.15, 80),
                  borderRadius: Math.min(width * 0.075, 40),
                }
              ]}
              onPress={toggleMute}
              accessibilityLabel={isMuted ? "Ativar som" : "Desativar som"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={isMuted ? "volume-mute" : "volume-high"} 
                size={isWeb ? Math.min(width * 0.04, 32) : 24}
                color="white" 
              />
            </TouchableOpacity>

            {/** Botão principal de play/pause com tamanho adaptativo */}
            <TouchableOpacity
              style={[
                styles.playButton,
                isWeb && {
                  width: Math.min(width * 0.2, 120),
                  height: Math.min(width * 0.2, 120),
                  borderRadius: Math.min(width * 0.1, 60),
                }
              ]}
              onPress={togglePlayback}
              accessibilityLabel={isPlaying ? "Pausar" : "Tocar"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={isWeb ? Math.min(width * 0.06, 48) : 32}
                color="white" 
              />
            </TouchableOpacity>

            {/** Botão de fechar com tamanho adaptativo */}
              <TouchableOpacity
              style={[
                styles.controlButton,
                isWeb && {
                  width: Math.min(width * 0.15, 80),
                  height: Math.min(width * 0.15, 80),
                  borderRadius: Math.min(width * 0.075, 40),
                }
              ]}
              onPress={handleClosePress}
              accessibilityLabel="Fechar"
              accessibilityRole="button"
            >
              <Ionicons 
                name="close" 
                size={isWeb ? Math.min(width * 0.04, 32) : 24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>

          {/** Container do status de transmissão */}
          <View style={[
            styles.statusWrapper,
            isWeb && {
              marginTop: Math.min(height * 0.09, 60),
            }
          ]}>
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
          </View>

          {/** Botão de recarregar em caso de erro */}
          {hasError && (
            <View style={[
              styles.errorContainer,
              isWeb && {
                marginTop: Math.min(height * 0.05, 40),
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.reloadButton,
                  isWeb && {
                    paddingHorizontal: Math.min(width * 0.03, 24),
                    paddingVertical: Math.min(height * 0.015, 12),
                  }
                ]}
                onPress={handleReload}
              >
                <Ionicons 
                  name="refresh" 
                  size={isWeb ? Math.min(width * 0.04, 32) : 24} 
                  color="#FFFFFF" 
                />
                <Text style={[
                  styles.reloadText,
                  isWeb && {
                    fontSize: Math.min(width * 0.02, 16),
                    marginLeft: Math.min(width * 0.015, 12),
                  }
                ]}>Recarregar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

/** 
 * Estilos do componente
 * Usa valores responsivos para web e fixos para mobile
 */
const styles = StyleSheet.create({
  /** Estilo do background que cobre toda a tela */
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  /** Estilo da imagem de fundo */
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  /** Container principal com flex para centralização */
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    height: '100%',
  },
  /** Container interno para controle de largura máxima */
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  /** Logo com tamanho fixo para mobile */
  logo: {
    width: 280,
    height: 200,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  /** Container da onda de áudio */
  waveContainer: {
    width: '100%',
    alignItems: 'center',
  },
  /** Container dos controles de reprodução */
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  /** Estilo dos botões de controle (mudo e fechar) */
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  /** Estilo do botão principal de play/pause */
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  /** Container do status de transmissão */
  statusWrapper: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Container interno do status */
  statusContainer: {
    alignItems: 'center',
  },
  /** Container do indicador "AO VIVO" */
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  /** Ponto vermelho do indicador "AO VIVO" */
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 15,
  },
  /** Texto do indicador "AO VIVO" */
  liveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  /** Texto do status "OFFLINE" */
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  /** Container do botão de recarregar */
  errorContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  /** Estilo do botão de recarregar */
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  /** Texto do botão de recarregar */
  reloadText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  description: {
    color: '#E6F0FF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.95,
    marginTop: 20,
    fontWeight: '500',
  },
}); 