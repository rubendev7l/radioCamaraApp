# 📄 Documentação Técnica - Rádio Câmara Sete Lagoas

## 🛠️ Requisitos do Ambiente de Desenvolvimento

### Versões Necessárias dos Aplicativos

1. **Node.js**
   - Versão: 18.x ou superior
   - Download: [nodejs.org](https://nodejs.org)
   - Verificar instalação: `node --version`

2. **npm (Node Package Manager)**
   - Versão: 9.x ou superior
   - Vem com Node.js
   - Verificar instalação: `npm --version`

3. **Expo CLI**
   - Versão: 6.x ou superior
   - Instalar: `npm install -g expo-cli`
   - Verificar instalação: `expo --version`

4. **Android Studio**
   - Versão: 2022.3.1 ou superior
   - Download: [developer.android.com](https://developer.android.com/studio)
   - Componentes necessários:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device

5. **Java Development Kit (JDK)**
   - Versão: 17 LTS (Long Term Support)
   - Download: [adoptium.net](https://adoptium.net/temurin/releases/?version=17)
   - Recomendado: Eclipse Temurin JDK 17 LTS
   - Verificar instalação: `java --version`
   - Importante: Usar especificamente a versão LTS para compatibilidade

6. **Git**
   - Versão: 2.x ou superior
   - Download: [git-scm.com](https://git-scm.com)
   - Verificar instalação: `git --version`

### Variáveis de Ambiente

1. **ANDROID_HOME**
   - Windows: `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`
   - Linux/Mac: `$HOME/Android/Sdk`

2. **JAVA_HOME**
   - Windows: `C:\Program Files\Java\jdk-17`
   - Linux/Mac: `/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home`

### Verificação do Ambiente

Execute os seguintes comandos para verificar se tudo está configurado corretamente:

```bash
# Verificar Node.js e npm
node --version
npm --version

# Verificar Expo CLI
expo --version

# Verificar Java
java --version

# Verificar Android SDK
adb --version

# Verificar variáveis de ambiente
echo %ANDROID_HOME%  # Windows
echo $ANDROID_HOME   # Linux/Mac
```

### Instalação do Projeto

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/seu-usuario/radio-camara-sete-lagoas.git
   cd radio-camara-sete-lagoas
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Iniciar o projeto**
   ```bash
   npx expo start
   ```

### Solução de Problemas Comuns

1. **Erro de SDK não encontrado**
   - Verifique se o Android Studio está instalado
   - Confirme se ANDROID_HOME está configurado
   - Execute `sdkmanager --list` para ver SDKs instalados

2. **Erro de Java não encontrado**
   - Verifique se o JDK está instalado
   - Confirme se JAVA_HOME está configurado
   - Verifique se o PATH inclui o bin do Java

3. **Erro de dependências**
   - Delete a pasta `node_modules`
   - Delete o arquivo `package-lock.json`
   - Execute `npm install` novamente

4. **Erro de build**
   - Limpe o cache: `npx expo start -c`
   - Verifique as versões das dependências
   - Execute `npx expo doctor`

## 🎨 Interface do Usuário (UI) e Layout

A identidade visual do aplicativo **Rádio Câmara Municipal de Sete Lagoas** foi projetada para oferecer uma experiência clara, acessível e institucional, mantendo consistência entre diferentes dispositivos e sistemas operacionais.

### 📱 Tela Inicial (Home)

- **Plano de Fundo (Background)**  
  Imagem institucional que cobre toda a tela, ajustando-se de forma responsiva a diferentes tamanhos de dispositivo, sem distorcer ou cortar o conteúdo.

- **Topo**  
  Logotipo oficial da Câmara Municipal de Sete Lagoas, com predominância das cores branco e azul, centralizado e com espaçamento proporcional.

- **Visualização de Ondas (AudioWave)**  
  Componente animado que exibe ondas de áudio abaixo do logotipo, proporcionando feedback visual da transmissão ao vivo. As ondas são animadas usando React Native Reanimated para uma experiência suave e responsiva.

- **Área do Player (Central)**  
  Conjunto de três botões com funcionalidades principais:
  1. **Mute On/Off**: Alterna entre som ativado e mudo.
  2. **Play/Pause**: Botão principal em destaque central; controla a reprodução do streaming.
  3. **Sair (X)**: Aciona uma confirmação antes de fechar o aplicativo.

- **Status da Transmissão (Live Status)**  
  Abaixo dos botões do player, há um indicador textual de status da transmissão ao vivo. Esse elemento mostra claramente se a rádio está online, fora do ar ou com problemas de conexão, fornecendo feedback em tempo real ao usuário.

- **Navegação Inferior (Footer)**  
  Barra fixa com três ícones de navegação:
  1. **Rádio** – Representa a tela principal (ativo por padrão).
  2. **Mensagens** – Redireciona para a área de notificações ou comunicados.
  3. **Configurações** – Tela para preferências e informações do aplicativo.

---

## 📱 Visão Geral do Aplicativo

O aplicativo Rádio Câmara Sete Lagoas é uma plataforma móvel voltada para a transmissão ao vivo das sessões legislativas e programas institucionais da Câmara Municipal.

### Principais Características
- 🎧 **Streaming de Áudio em Tempo Real**
- ▶️ **Reprodução em Segundo Plano**
- 🔔 **Notificações e Controles na Tela de Bloqueio**
- 🔉 **Controles de Áudio (Play, Pause, Mudo)**
- 📱 **Compatibilidade com Diversos Dispositivos**
- ✅ **Indicador de Status da Transmissão**
- 🎵 **Controles no Centro de Notificações**
- 🌊 **Visualização de Ondas de Áudio Animadas**

---

## 🛠️ Arquitetura e Tecnologias

### Stack Tecnológico
- **Expo (React Native)**  
- **TypeScript**
- **Expo AV**
- **React Navigation**
- **React Native Reanimated**
- **Expo Notifications**

### Estrutura de Arquivos
```bash
radio-camara-app/
├── app/                 # Rotas e telas
│   ├── (tabs)/         # Navegação por abas
│   └── _layout.tsx     # Layout principal
├── assets/             # Recursos estáticos
│   └── images/         # Imagens e ícones
├── components/         # Componentes UI
│   ├── AudioWave.tsx   # Visualização de ondas de áudio
│   └── RadioPlayer.tsx # Player principal
├── constants/          # Configurações
│   └── radio.ts        # Configurações da rádio
├── context/            # Contextos React
│   └── AudioContext.tsx # Contexto de áudio
├── hooks/              # Hooks personalizados
│   └── useRadioPlayer.ts # Hook de streaming
└── utils/              # Funções utilitárias
```

---

## 🔧 Configurações Técnicas

### Áudio (via `expo-av`)
```ts
await Audio.setAudioModeAsync({
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
  playsInSilentModeIOS: true,
});

const { sound } = await Audio.Sound.createAsync(
  { uri: streamUrl },
  { 
    shouldPlay: true,
    isLooping: true
  },
  onPlaybackStatusUpdate
);
```

### Visualização de Ondas (AudioWave)
```tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface AudioWaveProps {
  isPlaying: boolean;
}

export function AudioWave({ isPlaying }: AudioWaveProps) {
  const waveAnimations = useRef<Animated.Value[]>(
    Array(8).fill(0).map(() => new Animated.Value(0.5))
  ).current;
  const glowAnimations = useRef<Animated.Value[]>(
    Array(8).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = waveAnimations.map((anim, index) => {
        const duration = 400 + (index * 50);
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      });

      const glowEffects = glowAnimations.map((_, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnimations[index], {
              toValue: 1,
              duration: 800 + (index * 100),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnimations[index], {
              toValue: 0,
              duration: 800 + (index * 100),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      });

      animations.forEach(anim => anim.start());
      glowEffects.forEach(anim => anim.start());

      return () => {
        animations.forEach(anim => anim.stop());
        glowEffects.forEach(anim => anim.stop());
      };
    } else {
      waveAnimations.forEach(anim => anim.setValue(0.5));
      glowAnimations.forEach(anim => anim.setValue(0));
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {waveAnimations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.wave,
            {
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
              opacity: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
              shadowColor: '#FFFFFF',
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
              shadowRadius: glowAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 5],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginVertical: 20,
  },
  wave: {
    width: 4,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
});
```

### Notificações
```ts
const channelId = await Notifications.setNotificationChannelAsync('radio-channel', {
  name: 'Rádio Câmara',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
});
```

### Permissões Android
```json
"android": {
  "permissions": [
    "FOREGROUND_SERVICE",
    "WAKE_LOCK"
  ]
}
```

---

## 🚀 Processo de Build

### EAS Build Config
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Comandos
```bash
# Instalar dependências
npx expo install expo-av

# Configurar build nativo
npx expo prebuild

# Build de preview
npx expo run:android

# Build de produção
npx eas-cli build --platform android --profile production
```

---

## 🧩 Componentes-Chave

### `RadioPlayer.tsx`
- Controle do player
- Streaming
- Eventos de notificação
- UI dos botões principais

### `AudioWave.tsx`
- Visualização animada de ondas de áudio
- Feedback visual da transmissão
- Animações suaves com Reanimated

### `useRadioPlayer.ts`
- Inicializa e gerencia o stream
- Lida com reconexões e erros
- Gerencia notificações e controles

---

## 🔒 Segurança e Performance

- Cache de streaming
- Uso eficiente de memória
- Validação de URLs e erros de rede
- Gerenciamento de interrupções

---

## 📈 Monitoramento e Atualizações

- Atualizações OTA via EAS
- Logs automáticos
- Métricas de desempenho

---

## 🤝 Suporte

- 📧 E-mail: rodrigo.cpd@camarasete.mg.gov.br  
- 📱 WhatsApp: (31) 98634-0773  

---

Se quiser, posso gerar isso em PDF, Markdown ou outro formato para compartilhamento. Deseja exportar?

## 📦 Versões das Dependências

```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-navigation/native": "^7.0.14",
    "expo": "~52.0.46",
    "expo-av": "~15.0.2",
    "expo-constants": "~17.0.8",
    "expo-dev-client": "~5.0.20",
    "expo-linking": "~7.0.5",
    "expo-notifications": "~0.29.14",
    "expo-router": "~4.0.20",
    "expo-splash-screen": "~0.29.24",
    "expo-status-bar": "~2.0.1",
    "expo-system-ui": "~4.0.9",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native": "0.76.9",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-web": "~0.19.6"
  }
}
```

## 🔧 Configurações Importantes

### app.json
```json
{
  "expo": {
    "name": "Rádio Câmara Sete Lagoas",
    "slug": "radiocamarasetelagoas",
    "version": "1.0.0",
    "orientation": "portrait",
    "package": "com.cm7.radiocamara",
    "versionCode": 1,
    "android": {
      "permissions": [
        "FOREGROUND_SERVICE",
        "WAKE_LOCK",
        "MODIFY_AUDIO_SETTINGS",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "RECEIVE_BOOT_COMPLETED",
        "POST_NOTIFICATIONS"
      ],
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResources": true,
      "enableR8": true
    }
  }
}
```

## 🎯 Configurações de Áudio

### Configuração do Expo AV
```typescript
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
  shouldDuckAndroid: true,
  interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
  playThroughEarpieceAndroid: false
});
```

## 📱 Configurações de Notificações

### Permissões Necessárias
- `POST_NOTIFICATIONS` (Android 13+)
- `FOREGROUND_SERVICE`
- `WAKE_LOCK`

### Configuração do Canal de Notificação
```typescript
await Notifications.setNotificationChannelAsync('radio-status', {
  name: 'Status da Rádio',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
});
```

## 🔒 Configurações de Segurança

### Elementos que NUNCA devem ser alterados:
1. **Package Name**: `com.cm7.radiocamara`
2. **Chave de Assinatura**: Gerada pelo EAS
3. **Version Code**: Sempre incrementar

### Arquivos Sensíveis
- `credentials.json` (gerado pelo EAS)
- `keystore.jks` (se existir)
- `google-services.json` (se existir)

## 🛠️ Processo de Build

### Configuração do EAS
```bash
eas build:configure
```

### Build de Produção
```bash
eas build --platform android --profile production
```

### Submissão para Play Store
```bash
eas submit --platform android
```

## 📱 Configurações de UI/UX

### Tamanhos Mínimos de Toque
- Botões: 44x44 pixels
- Áreas clicáveis: 48x48 pixels

### Cores Principais
```typescript
const COLORS = {
  PRIMARY: '#1B4B8F',    // Azul da Câmara
  SECONDARY: '#FFFFFF',  // Branco
  ACCENT: '#FF0000',     // Vermelho
  TEXT: {
    LIGHT: '#FFFFFF',
    DARK: '#FFFFFF'
  }
};
```

## 🔍 Testes e Debug

### Comandos Úteis
```bash
# Verificar problemas de configuração
npx expo doctor

# Limpar cache
npx expo start -c

# Verificar dependências
npm audit
```

## 📱 Configurações de Performance

### Otimizações Implementadas
- R8/ProGuard habilitado
- ShrinkResources ativado
- Lazy loading de componentes
- Memoização de funções e componentes
- Limpeza adequada de recursos

### Monitoramento
- Logs de erro
- Status de reprodução
- Estado da conexão
- Uso de memória

## 🔄 Processo de Atualização

1. Incrementar `versionCode` no `app.json`
2. Atualizar `version` se necessário
3. Gerar novo build com EAS
4. Testar em ambiente de desenvolvimento
5. Publicar na Play Store

## ⚠️ Limitações Conhecidas

1. **Android**
   - Necessário Android 5.0 ou superior
   - Permissões de notificação em Android 13+

2. **iOS**
   - Requer iOS 13.0 ou superior
   - Necessário permissão de áudio em background

## 📞 Suporte Técnico

- E-mail: rodrigo.cpd@camarasete.mg.gov.br
- WhatsApp: (31) 98634-0773
- Horário: Segunda a Sexta, 8h às 17h