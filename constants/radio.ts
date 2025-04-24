export const RADIO_CONFIG = {
  STATION_NAME: 'Rádio Câmara',
  STATION_DESCRIPTION: 'A voz do legislativo de Sete Lagoas',
  STREAM_URL: 'https://camarasete.mg.gov.br/stream',
  SOCIAL_MEDIA: {
    FACEBOOK: 'https://www.facebook.com/camaramunicipaldesetelagoas/',
    INSTAGRAM: 'https://www.instagram.com/camaramunicipalsetelagoas/',
    YOUTUBE: 'https://www.youtube.com/@camaramunicipalsetelagoas',
    FLICKR: 'https://www.flickr.com/photos/camarasetelagoas/albums/',
  },
  ASSETS: {
    LOGO_WHITE: require('../assets/images/logo-white.png'),
    BACKGROUND_IMAGE: require('../assets/images/background.jpg'),
  },

  THEME: {
    TEXT: {
      LIGHT: '#FFFFFF',
      DARK: '#FFFFFF',
    },
    BACKGROUND: {
      LIGHT: '#FFFFFF',
      DARK: '#FFFFFF',
    },
  },

  SHARE: {
    TITLE: 'Rádio Câmara',
    MESSAGE: 'Ouça a Rádio Câmara de Sete Lagoas!',
    URL: 'https://www.camarasete.mg.gov.br/comunicacao/radio-camara',
  },

  ERROR_MESSAGES: {
    SHARE_ERROR: 'Erro ao compartilhar',
    PLAYBACK_ERROR: 'Erro ao reproduzir o áudio',
    CONNECTION_ERROR: 'Erro de conexão',
    LOAD_ERROR: 'Erro ao carregar o áudio',
  },
};

export const PLAYER_CONFIG = {
  MIN_SEEK_TIME: 0,
  MAX_SEEK_TIME: 0, // Transmissão ao vivo não precisa de seek
  UPDATE_INTERVAL: 1000, // Intervalo de atualização em milissegundos
  STREAM_URL: RADIO_CONFIG.STREAM_URL,
}; 