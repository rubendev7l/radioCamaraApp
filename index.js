import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import { playbackService } from './services/trackPlayerServices';
import App from './App';

// Registra o serviço de reprodução em segundo plano
TrackPlayer.registerPlaybackService(() => playbackService);

// Registra o componente raiz do app
registerRootComponent(App); 