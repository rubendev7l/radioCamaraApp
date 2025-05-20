module.exports = {
  name: 'Rádio Câmara Sete Lagoas',
  slug: 'radiocamarasetelagoas',
  version: '1.0.2',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'radiocamarasetelagoas',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cm7.radiocamara',
    infoPlist: {
      UIBackgroundModes: ['audio', 'fetch', 'remote-notification'],
      NSMicrophoneUsageDescription: 'Este app não requer acesso ao microfone',
      UIRequiresPersistentWiFi: true,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true
      }
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
      backgroundImage: './assets/images/icon-background.png'
    },
    package: 'com.cm7.radiocamara',
    versionCode: 7,
    permissions: [
      'FOREGROUND_SERVICE',
      'WAKE_LOCK',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'POST_NOTIFICATIONS',
      'BLUETOOTH_CONNECT',
      'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS'
    ],
    softwareKeyboardLayoutMode: 'resize',
    allowBackup: true
  },
  web: {
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-av',
      {
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone.'
      }
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#ffffff',
        sounds: []
      }
    ]
  ],
  extra: {
    eas: {
      projectId: 'bc1a10e4-534b-4c0f-94a8-c4928955237e'
    }
  },
  owner: 'cm7',
  runtimeVersion: {
    policy: 'appVersion'
  }
}; 