/**
 * RadioPlayer.tsx
 * 
 * Componente principal do player de rádio da Câmara Municipal de Sete Lagoas.
 * Responsável por gerenciar a reprodução do stream de áudio, controles de playback,
 * notificações e interações do usuário.
 * 
 * Funcionalidades Principais:
 * - Streaming de áudio em tempo real
 * - Reprodução em segundo plano
 * - Controles de playback (play/pause, mute)
 * - Notificações com controles
 * - Indicador visual de status
 * - Tratamento de erros e reconexão
 * - Compartilhamento
 * - Feedback tátil (haptics)
 * 
 * Dependências:
 * - expo-av: Para streaming de áudio
 * - expo-notifications: Para notificações
 * - expo-haptics: Para feedback tátil
 * - @react-native-async-storage/async-storage: Para persistência de configurações
 * 
 * @author Equipe de Desenvolvimento da Câmara Municipal
 * @version 1.0.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Share,
  UIManager,
  ActivityIndicator,
  Linking,
  NativeEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { AudioWave } from './AudioWave';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import ForegroundService from '../services/ForegroundService';
import { showBatteryOptimizationAlert } from './showBatteryOptimizationAlert';
import { RADIO_CONFIG } from '../constants/radio';
import { usePermissions } from '../hooks/usePermissions';
import PlayerControls from './player/PlayerControls';
import PlayerStatus from './player/PlayerStatus';
import PowerManager from '../utils/PowerManager';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { BatteryOptimizationStatus } from './BatteryOptimizationStatus';

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

// Estação padrão da Rádio Câmara
const defaultStation: RadioStation = {
  id: 'radio-camara',
  name: 'Rádio Câmara Sete Lagoas',
  streamUrl: RADIO_CONFIG.STREAM_URL,
  description: 'A voz do legislativo de Sete Lagoas'
};

/** Props do componente principal do player de rádio */
interface RadioPlayerProps {
  currentStation: RadioStation;
  onExit: () => void;
}

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying?: boolean;
  isBuffering?: boolean;
  error?: string;
}

export function RadioPlayer({ currentStation, onExit }: RadioPlayerProps) {
  const { hasPermissions, requestPermissions } = usePermissions();
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  /** Estados principais para controle da reprodução */
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState as AppStateStatus);
  const isInitializedRef = useRef(false);

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

  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const [isMuted, setIsMuted] = useState(false);

  const { isOptimized, isChecking, requestIgnoreOptimization } = useBatteryOptimization();

  /** 
   * Efeito que controla a animação do indicador "AO VIVO"
   * Ativa quando está tocando e para quando está pausado
   */
  useEffect(() => {
    if (isPlaying) {
      const animationConfig = {
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      };

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(liveDotScale, {
              toValue: 1.2,
              ...animationConfig,
            }),
            Animated.timing(liveDotOpacity, {
              toValue: 0.7,
              ...animationConfig,
            }),
          ]),
          Animated.parallel([
            Animated.timing(liveDotScale, {
              toValue: 1,
              ...animationConfig,
            }),
            Animated.timing(liveDotOpacity, {
              toValue: 1,
              ...animationConfig,
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
   * Efeito de inicialização do player
   * Configura o áudio, notificações e listeners de estado do app
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Primeiro configura o áudio apenas uma vez
        if (!isInitializedRef.current) {
          console.log('Configurando modo de áudio...');
          await setupAudio();
          console.log('Modo de áudio configurado com sucesso');
        }

        // Depois verifica permissões
        if (!hasPermissions) {
          console.log('Solicitando permissões iniciais...');
          const granted = await requestPermissions();
          console.log('Resultado da solicitação inicial:', granted);
          
          if (granted) {
            setNotificationsEnabled(true);
            await AsyncStorage.setItem('notificationSettings', JSON.stringify({ playback: true }));
            await ForegroundService.initialize();
          }
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
      }
    };

    initializeApp();
  }, []);

  const setupAudio = useCallback(async () => {
    try {
      if (isInitializedRef.current) {
        return;
      }

      console.log('Configurando modo de áudio...');
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: 1,
        interruptionModeIOS: 1,
      });
      console.log('Modo de áudio configurado com sucesso');
      
      isInitializedRef.current = true;
    } catch (error) {
      console.error('Erro ao configurar áudio:', error);
      setError('Erro ao configurar áudio');
    }
  }, []);

  const loadAndPlayAudio = useCallback(async () => {
    try {
      if (!isInitializedRef.current) {
        await setupAudio();
      }

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          console.log('Player já está carregado, apenas iniciando...');
          await soundRef.current.playAsync();
          setIsPlaying(true);
          setIsBuffering(false);
          return;
        }
      }

      setIsBuffering(true);
      console.log('Criando nova instância do player...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: RADIO_CONFIG.STREAM_URL },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setIsBuffering(false);
      console.log('Stream iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao iniciar stream:', error);
      setError('Erro ao iniciar stream');
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [setupAudio]);

  const stopAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }
        soundRef.current = null;
      }
      setIsPlaying(false);
      setIsBuffering(false);
    } catch (error) {
      console.error('Erro ao parar stream:', error);
      setError('Erro ao parar stream');
    }
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: PlaybackStatus) => {
    if (status.isLoaded) {
      const wasPlaying = isPlaying;
      const isNowPlaying = status.isPlaying || false;
      
      setIsBuffering(status.isBuffering || false);
      setIsPlaying(isNowPlaying);
      
      // Verifica as configurações de notificação antes de atualizar
      AsyncStorage.getItem('notificationSettings').then(settings => {
        const notificationSettings = settings ? JSON.parse(settings) : { playback: true };
        // Só atualiza a notificação se:
        // 1. O estado de reprodução mudou
        // 2. As notificações estão habilitadas
        // 3. Tem permissões
        // 4. Não há erro
        // 5. Está realmente tocando
        if (wasPlaying !== isNowPlaying && 
            notificationSettings.playback && 
            hasPermissions && 
            !status.error && 
            isNowPlaying) {
          ForegroundService.updateNotification(true);
        }
      });
      
      if (status.error) {
        console.error('Erro no player:', status.error);
        setError('Erro na reprodução');
        setIsPlaying(false);
        setIsBuffering(false);
        // Remove a notificação em caso de erro
        AsyncStorage.getItem('notificationSettings').then(settings => {
          const notificationSettings = settings ? JSON.parse(settings) : { playback: true };
          if (notificationSettings.playback && hasPermissions) {
            ForegroundService.stopNotification();
            ForegroundService.updateNotification(false);
          }
        });
      }
    }
  }, [isPlaying, hasPermissions]);

  /** 
   * Verifica se o modo economia de bateria está ativo
   */
  const checkBatteryOptimization = useCallback(async () => {
    if (Platform.OS !== 'android') return false;
    
    try {
      const { PowerManager } = NativeModules;
      const isIgnoringBatteryOptimizations = await PowerManager.isIgnoringBatteryOptimizations();
      return !isIgnoringBatteryOptimizations;
    } catch (error) {
      console.error('Erro ao verificar otimização de bateria:', error);
      return false;
    }
  }, []);

  /** 
   * Listener para mudanças no modo economia de bateria
   */
  useEffect(() => {
    const subscription = PowerManager.addListener('batteryOptimizationChanged', (isOptimized) => {
      if (isOptimized && isPlaying) {
        Alert.alert(
          'Modo Economia de Bateria Ativado',
          'O modo economia de bateria foi ativado e pode interromper a reprodução da rádio. Deseja desativar?',
          [
            {
              text: 'Abrir Configurações',
              onPress: () => PowerManager.requestIgnoreBatteryOptimizations(),
            },
            {
              text: 'Cancelar',
              style: 'cancel',
            },
          ]
        );
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isPlaying]);

  const togglePlayback = async () => {
    try {
      if (!isPlaying) {
        // Verificar otimização de bateria antes de iniciar
        if (isOptimized) {
          Alert.alert(
            'Otimização de Bateria',
            'Para garantir que a rádio continue tocando em segundo plano, é necessário desativar a otimização de bateria para este aplicativo.',
            [
              {
                text: 'Abrir Configurações',
                onPress: requestIgnoreOptimization,
              },
              {
                text: 'Cancelar',
                style: 'cancel',
              },
            ]
          );
          return;
        }

        // Iniciar reprodução
        await loadAndPlayAudio();
      } else {
        await stopAudio();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Erro', 'Não foi possível controlar a reprodução. Tente novamente.');
    }
  };

  /** 
   * Gerencia mudanças de estado do app (background/foreground)
   * Atualiza notificações conforme necessário
   */
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Verifica as configurações de notificação antes de atualizar
    const settings = await AsyncStorage.getItem('notificationSettings');
    const notificationSettings = settings ? JSON.parse(settings) : { playback: true };
    const shouldShowNotification = notificationSettings.playback;

    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (isPlaying && shouldShowNotification && hasPermissions && !error) {
        await ForegroundService.updateNotification(true);
      }
    } else if (nextAppState.match(/inactive|background/)) {
      if (isPlaying && shouldShowNotification && hasPermissions && !error) {
        await ForegroundService.updateNotification(true);
      }
    }
    appState.current = nextAppState;
  };

  /** 
   * Controla o mudo/desmudo do áudio
   * Mantém a reprodução mas sem som
   */
  const toggleMute = async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const newMuteState = !status.isMuted;
        await soundRef.current.setIsMutedAsync(newMuteState);
        setIsMuted(newMuteState);
      }
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

      // Remove a notificação
      await ForegroundService.stopNotification();

      // Libera recursos de áudio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1,
        interruptionModeIOS: 1,
      });

      // Força o fechamento do app
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        onExit();
      }
    } catch (error) {
      console.error('Erro ao fechar o app:', error);
      // Garante que o app será fechado mesmo em caso de erro
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        onExit();
      }
    }
  };

  /** 
   * Efeito de limpeza ao desmontar o componente
   */
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      // Garante que a notificação é removida ao desmontar
      ForegroundService.stopNotification();
    };
  }, []);

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
    setError(null);
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
      setError('Erro ao recarregar');
    }
  };

  /** 
   * Efeito que controla a animação da descrição
   * Inicia quando o componente é montado
   */
  useEffect(() => {
    const animationConfig = {
      duration: 1000,
      useNativeDriver: Platform.OS !== 'web',
    };

    Animated.parallel([
      Animated.timing(descriptionOpacity, {
        toValue: 1,
        ...animationConfig,
      }),
      Animated.timing(descriptionTranslateY, {
        toValue: 0,
        ...animationConfig,
      }),
    ]).start();
  }, []);

  /** 
   * Configura o canal de notificações no Android
   * Permite controle de reprodução pela notificação
   */
  const setupNotifications = async (): Promise<() => void> => {
    try {
      if (Platform.OS === 'web') {
        return () => {};
      }

      await ForegroundService.initialize();

      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        if (response.notification.request.content.data.type === 'playback') {
          togglePlayback();
        }
      });

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error('Erro ao configurar notificações:', error);
      return () => {};
    }
  };

  /** 
   * Compartilha o status atual da rádio
   */
  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await Share.share({
        message: `📻 Estou ouvindo a Rádio Câmara Sete Lagoas!\n\nAcompanhe também a transmissão ao vivo e fique por dentro das notícias do Legislativo.\n\nOuça agora: https://www.camarasete.mg.gov.br/comunicacao/radio-camara`,
        url: 'https://www.camarasete.mg.gov.br/comunicacao/radio-camara',
        title: 'Rádio Câmara Sete Lagoas',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Reconexão automática quando a internet volta
  useEffect(() => {
    if (error && isConnected && isInternetReachable) {
      setIsReconnecting(true);
      handleReload().finally(() => setIsReconnecting(false));
    }
  }, [error, isConnected, isInternetReachable]);

  useEffect(() => {
    setupAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      ForegroundService.stopNotification();
    };
  }, [setupAudio]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isOptimized && isPlaying) {
      Alert.alert(
        'Modo Economia de Bateria Ativado',
        'O modo economia de bateria foi ativado e pode interromper a reprodução da rádio. Deseja desativar?',
        [
          {
            text: 'Abrir Configurações',
            onPress: requestIgnoreOptimization,
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );
    }
  }, [isOptimized, isPlaying]);

  /** 
   * Renderiza o player de rádio com layout responsivo
   * Adapta-se para web e mobile com diferentes tamanhos
   */
  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.content}>
        <View style={styles.innerContent}>
          <Image
            source={require('../assets/images/logo-white.png')}
            style={[
              styles.logo,
              isWeb && {
                width: Math.min(width * 0.4, 280),
                height: Math.min(width * 0.3, 200),
              }
            ]}
            resizeMode="contain"
          />

          <View style={styles.waveContainer}>
            <AudioWave isPlaying={isPlaying} />
          </View>

          <View style={[
            styles.controls,
            isWeb && {
              marginTop: Math.min(height * 0.04, 32),
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { minWidth: 44, minHeight: 44, backgroundColor: '#E6F0FF' },
                isWeb && {
                  width: Math.min(width * 0.15, 80),
                  height: Math.min(width * 0.15, 80),
                  borderRadius: Math.min(width * 0.075, 40),
                }
              ]}
              onPress={handleExit}
              activeOpacity={0.7}
              accessibilityLabel="Fechar player"
              accessibilityRole="button"
            >
              <Ionicons 
                name="close" 
                size={isWeb ? Math.min(width * 0.04, 32) : 24}
                color="#1B4B8F"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.playButton,
                { minWidth: 44, minHeight: 44, backgroundColor: '#E6F0FF' },
                isWeb && {
                  width: Math.min(width * 0.2, 90),
                  height: Math.min(width * 0.2, 90),
                  borderRadius: Math.min(width * 0.1, 45),
                }
              ]}
              onPress={togglePlayback}
              activeOpacity={0.7}
              accessibilityLabel={isPlaying ? "Pausar rádio" : "Tocar rádio"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={isWeb ? Math.min(width * 0.06, 48) : 36}
                color="#1B4B8F"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { minWidth: 44, minHeight: 44, backgroundColor: '#E6F0FF' },
                isWeb && {
                  width: Math.min(width * 0.15, 80),
                  height: Math.min(width * 0.15, 80),
                  borderRadius: Math.min(width * 0.075, 40),
                }
              ]}
              onPress={toggleMute}
              activeOpacity={0.7}
              accessibilityLabel={isMuted ? "Ativar som" : "Desativar som"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={isMuted ? "volume-mute" : "volume-high"} 
                size={isWeb ? Math.min(width * 0.04, 32) : 24}
                color="#1B4B8F"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { minWidth: 44, minHeight: 44, backgroundColor: '#E6F0FF' },
                isWeb && {
                  width: Math.min(width * 0.15, 80),
                  height: Math.min(width * 0.15, 80),
                  borderRadius: Math.min(width * 0.075, 40),
                }
              ]}
              onPress={handleShare}
              activeOpacity={0.7}
              accessibilityLabel="Compartilhar a rádio"
              accessibilityRole="button"
            >
              <Ionicons 
                name="share-social" 
                size={isWeb ? Math.min(width * 0.04, 32) : 24}
                color="#1B4B8F"
              />
            </TouchableOpacity>
          </View>

          <View style={[
            styles.statusWrapper,
            isWeb && {
              marginTop: Math.min(height * 0.04, 40),
              marginBottom: Math.min(height * 0.04, 40),
            }
          ]}>
            <View style={styles.statusContainer}>
              <PlayerStatus 
                isPlaying={isPlaying} 
                isBuffering={isBuffering} 
                error={error}
              />
            </View>
          </View>

          {/* Indicador de status de rede */}
          {!isConnected && (
            <View style={[
              styles.networkStatusContainer,
              isWeb && {
                marginTop: Math.min(height * 0.03, 30),
                marginBottom: Math.min(height * 0.03, 30),
              }
            ]}>
              <Animated.View 
                style={[
                  styles.networkStatus,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]} 
                accessibilityRole="alert"
              >
                <Ionicons name="cloud-offline" size={isWeb ? Math.min(width * 0.04, 32) : 20} color="#FFFFFF" />
                <Text style={[
                  styles.networkStatusText,
                  isWeb && {
                    fontSize: Math.min(width * 0.02, 16),
                  }
                ]}>
                  Sem Conexão com a Internet
                </Text>
              </Animated.View>
              <Text style={[
                styles.networkHelpText,
                isWeb && {
                  fontSize: Math.min(width * 0.015, 14),
                  marginTop: Math.min(height * 0.01, 8),
                }
              ]}>
                Verifique sua conexão e tente novamente
              </Text>
            </View>
          )}

          {error && (
            <View style={[
              styles.errorContainer,
              isWeb && {
                marginTop: Math.min(height * 0.03, 30),
                marginBottom: Math.min(height * 0.03, 30),
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
                ]}>
                  Recarregar
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isReconnecting && (
            <View style={[
              styles.reconnectingContainer,
              isWeb && {
                marginTop: Math.min(height * 0.03, 30),
                marginBottom: Math.min(height * 0.03, 30),
              }
            ]}>
              <ActivityIndicator size={isWeb ? "large" : "small"} color="#FFFFFF" />
              <Text style={[
                styles.reconnectingText,
                isWeb && {
                  fontSize: Math.min(width * 0.02, 16),
                  marginTop: Math.min(height * 0.01, 8),
                }
              ]}>
                Reconectando...
              </Text>
            </View>
          )}

          <BatteryOptimizationStatus />
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
    ...(Platform.OS === 'web' ? {
      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.75)',
    } : {
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    }),
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  descriptionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    ...(Platform.OS === 'web' ? {
      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.75)',
    } : {
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    }),
  },
  offlineMessage: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
  },
  wave: {
    width: 4,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 2,
    borderRadius: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 0px 5px rgba(255, 255, 255, 0.5)',
    } : {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 5,
    }),
  },
  networkStatusContainer: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 12,
  },
  networkStatusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  networkHelpText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  reconnectingContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  reconnectingText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 