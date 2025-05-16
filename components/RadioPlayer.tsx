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
  Share,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { AudioWave } from './AudioWave';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ForegroundService } from '../services/ForegroundService';
import { showBatteryOptimizationAlert } from './showBatteryOptimizationAlert';
import { RADIO_CONFIG } from '../constants/radio';
import { usePermissions } from '../hooks/usePermissions';

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

export function RadioPlayer({ currentStation, onExit }: RadioPlayerProps) {
  const { hasPermissions, requestPermissions } = usePermissions();
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
  const [isBuffering, setIsBuffering] = useState(false);

  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [isReconnecting, setIsReconnecting] = useState(false);

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
    let notificationCleanup: (() => void) | undefined;

    const setup = async () => {
      await setupAudio();
      notificationCleanup = await setupNotifications();
    };

    setup();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      subscription.remove();
      if (notificationCleanup) {
        notificationCleanup();
      }
    };
  }, []);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    if (!hasPermissions) {
      Alert.alert(
        'Permissões Necessárias',
        'Para que o aplicativo funcione corretamente, precisamos das seguintes permissões:\n\n' +
        '• Internet\n' +
        '• Notificações\n' +
        '• Serviço em primeiro plano\n\n' +
        'Por favor, conceda todas as permissões solicitadas.',
        [
          {
            text: 'OK',
            onPress: requestPermissions,
          },
        ],
        { cancelable: false }
      );
    }
  }, [hasPermissions]);

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
   * Configura o player de áudio
   * Habilita reprodução em background e monitora status
   */
  const setupAudio = async () => {
    if (!hasPermissions) {
      console.log('Permissões não concedidas, aguardando...');
      return;
    }

    try {
      console.log('Configurando modo de áudio...');
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      console.log('Modo de áudio configurado com sucesso');

      console.log('Criando instância do player...');
      const { sound } = await Audio.Sound.createAsync(
        { 
          uri: RADIO_CONFIG.STREAM_URL,
          headers: {
            'User-Agent': 'RadioCamaraApp/1.0',
          }
        },
        { 
          shouldPlay: false,
          progressUpdateIntervalMillis: 100,
          positionMillis: 0,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
        },
        (status) => {
          console.log('Status do player:', status);
        }
      );
      console.log('Instância do player criada com sucesso');
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        console.log('Atualização de status:', status);
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setHasError(false);
          setIsBuffering(status.isBuffering);
        } else if (status.error) {
          console.error('Erro no player:', status.error);
          setHasError(true);
          setIsPlaying(false);
        }
      });

    } catch (error) {
      console.error('Erro ao configurar áudio:', error);
      setHasError(true);
    }
  };

  /** 
   * Atualiza a notificação de acordo com o estado atual
   */
  const updateNotification = async () => {
    try {
      if (!notificationsEnabled) {
        await ForegroundService.stopService();
        return;
      }

      await ForegroundService.startService(isPlaying);
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
      showBatteryOptimizationAlert();
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
      await ForegroundService.stopService();

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
        // Força o fechamento imediato
        BackHandler.exitApp();
        
        // Se não fechar em 100ms, tenta novamente
        setTimeout(() => {
          BackHandler.exitApp();
        }, 100);
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
      showBatteryOptimizationAlert();
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

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não concedida');
        return () => {};
      }

      await ForegroundService.initialize();

      // Configurar o listener para os botões da notificação
      const subscription = ForegroundService.onButtonPress((response) => {
        const actionId = response.actionIdentifier;
        if (actionId === 'TOGGLE_PLAYBACK') {
          togglePlayback();
        } else if (actionId === 'STOP') {
          handleExit();
        }
      });

      return () => {
        ForegroundService.offButtonPress(subscription);
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
    if (hasError && isConnected && isInternetReachable) {
      setIsReconnecting(true);
      handleReload().finally(() => setIsReconnecting(false));
    }
  }, [hasError, isConnected, isInternetReachable]);

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
            A voz do legislativo de Sete Lagoas
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
            resizeMode="contain"
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
                { minWidth: 44, minHeight: 44 },
                isWeb && {
                  width: Math.min(width * 0.15, 80),
                  height: Math.min(width * 0.15, 80),
                  borderRadius: Math.min(width * 0.075, 40),
                }
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
                toggleMute();
              }}
              activeOpacity={0.7}
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
                { minWidth: 64, minHeight: 64 },
                isWeb && {
                  width: Math.min(width * 0.2, 120),
                  height: Math.min(width * 0.2, 120),
                  borderRadius: Math.min(width * 0.1, 60),
                }
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                togglePlayback();
              }}
              activeOpacity={0.7}
              accessibilityLabel={isPlaying ? "Pausar" : "Tocar"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={isWeb ? Math.min(width * 0.06, 48) : 32}
                color="white" 
              />
            </TouchableOpacity>

            {/** Botão de compartilhar com tamanho adaptativo */}
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
                  <Animated.View 
                    style={[
                      styles.liveDot,
                      {
                        transform: [{ scale: liveDotScale }],
                        opacity: liveDotOpacity,
                      }
                    ]} 
                  />
                  <Text style={styles.liveText}>AO VIVO</Text>
                </View>
              ) : (
                <Text style={styles.offlineText}>OFFLINE</Text>
              )}
            </View>
          </View>
          {/* Banner de status de rede */}
          {!isConnected && (
            <View style={styles.networkBanner} accessibilityRole="alert">
              <Text style={styles.networkBannerText}>Sem conexão com a internet</Text>
            </View>
          )}

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

          {/* Indicador de carregamento (Conectando...) */}
          {isBuffering && (
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={{ color: '#FFF', marginTop: 8, fontWeight: 'bold', fontSize: 16 }}>
                Conectando...
              </Text>
            </View>
          )}

          {/* Indicador de reconexão automática */}
          {isReconnecting && (
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={{ color: '#FFF', marginTop: 8, fontWeight: 'bold', fontSize: 16 }}>
                Reconectando...
              </Text>
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
    marginRight: 8,
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
  networkBanner: {
    marginTop: 12,
    backgroundColor: '#1B4B8F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 200,
  },
  networkBannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
}); 