/**
 * radio.ts
 * 
 * Arquivo de configurações e constantes do aplicativo da Rádio Câmara.
 * Contém todas as configurações necessárias para o funcionamento do app.
 * 
 * Configurações Principais:
 * - Informações da estação
 * - URLs de stream
 * - Redes sociais
 * - Recursos visuais
 * - Temas e cores
 * - Mensagens de erro
 * - Configurações do player
 * 
 * Estrutura:
 * - RADIO_CONFIG: Configurações gerais da rádio
 * - PLAYER_CONFIG: Configurações específicas do player
 * 
 * Uso:
 * Importe as constantes necessárias em seus componentes:
 * ```typescript
 * import { RADIO_CONFIG, PLAYER_CONFIG } from '../constants/radio';
 * ```
 * 
 * @author Equipe de Desenvolvimento da Câmara Municipal
 * @version 1.0.0
 */

/** 
 * Configurações principais da rádio
 * Contém todas as informações necessárias para o funcionamento do app
 */
export const RADIO_CONFIG = {
  /** Nome da estação de rádio */
  STATION_NAME: 'Rádio Câmara',
  /** Descrição da estação */
  STATION_DESCRIPTION: 'A voz do legislativo de Sete Lagoas',
  /** URL do stream de áudio */
  STREAM_URL: 'https://camarasete.mg.gov.br/stream',
  /** Links para redes sociais */
  SOCIAL_MEDIA: {
    FACEBOOK: 'https://www.facebook.com/camaramunicipaldesetelagoas/',
    INSTAGRAM: 'https://www.instagram.com/camaramunicipalsetelagoas/',
    YOUTUBE: 'https://www.youtube.com/@camaramunicipalsetelagoas',
    FLICKR: 'https://www.flickr.com/photos/camarasetelagoas/albums/',
  },
  /** Recursos visuais do app */
  ASSETS: {
    LOGO_WHITE: require('../assets/images/logo-white.png'),
    BACKGROUND_IMAGE: require('../assets/images/background.jpg'),
  },

  /** Configurações de tema */
  THEME: {
    TEXT: {
      LIGHT: '#FFFFFF',
      DARK: '#FFFFFF',
    },
    BACKGROUND: {
      LIGHT: '#FFFFFF',
      DARK: '#FFFFFF',
    },
    /** Cores da identidade visual */
    COLORS: {
      PRIMARY: '#1B4B8F', // Azul da Câmara
      SECONDARY: '#FFFFFF',
      ACCENT: '#FF0000',
    },
  },

  /** Configurações de compartilhamento */
  SHARE: {
    TITLE: 'Rádio Câmara',
    MESSAGE: 'Ouça a Rádio Câmara de Sete Lagoas!',
    URL: 'https://www.camarasete.mg.gov.br/comunicacao/radio-camara',
  },

  /** Mensagens de erro e status do app */
  ERROR_MESSAGES: {
    SHARE_ERROR: 'Erro ao compartilhar',
    PLAYBACK_ERROR: 'Erro ao reproduzir o áudio',
    CONNECTION_ERROR: 'Erro de conexão',
    LOAD_ERROR: 'Erro ao carregar o áudio',
    NO_INTERNET: 'Sem conexão com a internet',
    RECONNECTING: 'Reconectando...',
    PAUSED: 'Ao vivo (pausado)',
    PLAYING: 'Ao vivo',
    OFFLINE: 'Transmissão fora do ar',
    STREAM_OFFLINE: 'Transmissão fora do ar',
    BUFFERING: 'Carregando...',
    READY: 'Pronto para ouvir',
    NETWORK_UNSTABLE: 'Conexão de rede instável. Aguarde uma conexão melhor para ouvir a rádio.',
    ERROR_LOADING_STREAM: 'Erro ao carregar o áudio',
  },
};

/** 
 * Configurações do player de áudio
 * Define parâmetros de reprodução e controle
 */
export const PLAYER_CONFIG = {
  MIN_SEEK_TIME: 0,
  MAX_SEEK_TIME: 0, // Transmissão ao vivo não precisa de seek
  UPDATE_INTERVAL: 1000, // Intervalo de atualização em milissegundos
  STREAM_URL: RADIO_CONFIG.STREAM_URL,
}; 