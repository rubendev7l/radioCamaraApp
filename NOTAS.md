# Notas Importantes para Manutenção

## Configurações Críticas

### Android
- `compileSdkVersion`: 35
- `targetSdkVersion`: 34
- `minSdkVersion`: 24 (Android 7.0)
- `buildToolsVersion`: '35.0.0'
- Package Name: `com.cm7.radiocamara` (NÃO ALTERAR)

### Permissões Críticas
- `FOREGROUND_SERVICE`: Para serviço em background
- `WAKE_LOCK`: Para manter o serviço ativo
- `POST_NOTIFICATIONS`: Para notificações
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: Para evitar que o sistema mate o serviço

## Arquivos Críticos

### 1. ForegroundService.ts
- Gerencia o serviço em background
- Mantém a notificação persistente
- NÃO alterar o ID do canal de notificação ('radio-playback')
- Manter a prioridade MAX para notificações

### 2. useAudioPlayer.ts
- Gerencia o streaming de áudio
- Implementa reconexão automática
- Mantém o estado em background
- NÃO alterar os valores de:
  - `MAX_RETRY_ATTEMPTS`: 3
  - `RETRY_DELAY`: 2000ms
  - `BACKGROUND_UPDATE_INTERVAL`: 5000ms
  - `FOREGROUND_UPDATE_INTERVAL`: 1000ms

### 3. AndroidManifest.xml
- Contém todas as permissões necessárias
- Configura o serviço em background
- Define os canais de notificação
- Configura deep linking

### 4. build.gradle
- Define as versões do SDK
- Configura as dependências
- Gerencia os repositórios

## Processo de Build

### Local
```bash
# Limpar cache do Gradle
cd android
./gradlew clean

# Build de debug
./gradlew assembleDebug
```

### Produção
```bash
# Build de produção
eas build --platform android --profile production

# Submissão para Play Store
eas submit --platform android
```

## Troubleshooting

### Problemas Comuns

1. Serviço em background não inicia:
   - Verificar permissões no AndroidManifest.xml
   - Confirmar configuração do ForegroundService
   - Checar logs do Android

2. Áudio para em background:
   - Verificar configurações do expo-av
   - Confirmar se o serviço está ativo
   - Checar consumo de memória

3. Notificação não aparece:
   - Verificar permissões de notificação
   - Confirmar configuração do canal
   - Checar logs do sistema

### Logs Importantes
- `ForegroundService: ` - Logs do serviço em background
- `[timestamp] Error` - Erros de reprodução
- `Modo de áudio configurado` - Configuração de áudio

## Atualizações

### Versionamento
- Incrementar `versionCode` no `app.json`
- Atualizar `version` se necessário
- Manter compatibilidade com Android 7.0+

### Dependências
- Manter expo-av atualizado
- Atualizar expo-notifications
- Verificar compatibilidade do ForegroundService

## Recursos Adicionais
- [Documentação Expo](https://docs.expo.dev)
- [Documentação React Native](https://reactnative.dev)
- [Documentação do ForegroundService](https://github.com/voximplant/react-native-foreground-service)

## Contato
Para suporte técnico ou dúvidas sobre o projeto, entre em contato com a equipe de desenvolvimento. 