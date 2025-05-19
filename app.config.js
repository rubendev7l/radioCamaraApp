module.exports = {
  name: 'Rádio Câmara Sete Lagoas',
  slug: 'radio-camara-sete-lagoas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.camarasetelagoas.radio'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.camarasetelagoas.radio',
    googleServicesFile: './android/app/google-services/google-service-account-key.json'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
        sounds: ['./assets/notification-sound.wav']
      }
    ]
  ],
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  }
}; 