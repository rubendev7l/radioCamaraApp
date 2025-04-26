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

  /** Mensagens de erro do app */
  ERROR_MESSAGES: {
    SHARE_ERROR: 'Erro ao compartilhar',
    PLAYBACK_ERROR: 'Erro ao reproduzir o áudio',
    CONNECTION_ERROR: 'Erro de conexão',
    LOAD_ERROR: 'Erro ao carregar o áudio',
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