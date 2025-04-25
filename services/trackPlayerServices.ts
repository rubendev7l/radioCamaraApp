import TrackPlayer, { Capability, Event } from 'react-native-track-player';

export const setupPlayer = async () => {
    try {
        await TrackPlayer.setupPlayer({
            // Opções de áudio otimizadas para streaming de rádio
            maxBuffer: 1000, // Buffer máximo de 1000 segundos
            maxCacheSize: 1024 * 5, // Cache máximo de 5MB
        });

        await TrackPlayer.updateOptions({
            // Capacidades que aparecerão na notificação
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
            ],
            // Configurações da notificação
            android: {
                appKilledPlaybackBehavior: 'stopPlaybackAndRemoveNotification',
            },
            // Configurações de reprodução em segundo plano
            stopWithApp: false,
            // Ícones personalizados para a notificação (você precisará adicionar estes ícones)
            icon: require('../assets/notification-icon.png'),
            playIcon: require('../assets/play-icon.png'),
            pauseIcon: require('../assets/pause-icon.png'),
            stopIcon: require('../assets/stop-icon.png'),
            // Cor de fundo da notificação
            color: '#2596be',
            // Texto que aparece na notificação
            notificationCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
            ],
        });

        return true;
    } catch (error) {
        console.error('Erro ao configurar o player:', error);
        return false;
    }
};

// Função para adicionar e iniciar o stream da rádio
export const startRadioStream = async (streamUrl: string) => {
    try {
        // Limpa a fila atual
        await TrackPlayer.reset();

        // Adiciona o stream da rádio
        await TrackPlayer.add({
            id: 'radio_stream',
            url: streamUrl,
            title: 'Rádio Câmara Sete Lagoas',
            artist: 'Ao Vivo',
            artwork: require('../assets/radio-logo.png'),
            type: 'default',
            isLive: true,
        });

        // Inicia a reprodução
        await TrackPlayer.play();
        return true;
    } catch (error) {
        console.error('Erro ao iniciar o stream:', error);
        return false;
    }
};

// Função para lidar com eventos do player
export const playbackService = async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        TrackPlayer.reset();
    });
}; 