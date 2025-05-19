module.exports = {
  name: 'Rádio Câmara Sete Lagoas',
  slug: 'radio-camara-sete-lagoas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash.png',
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
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.camarasetelagoas.radio',
    googleServicesFile: './android/app/google-services/google-service-account-key.json'
  },
  web: {
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#ffffff'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  }
}; 