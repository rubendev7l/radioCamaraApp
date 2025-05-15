# 📄 Documentação Técnica - Rádio Câmara Sete Lagoas

## 🎯 Visão Geral do Projeto

O aplicativo Rádio Câmara Sete Lagoas é uma plataforma móvel desenvolvida com Expo (React Native) e TypeScript, focada na transmissão ao vivo das sessões legislativas e programas institucionais da Câmara Municipal.

### Versão Atual
- **Versão**: 1.0.2
- **Version Code**: 7
- **SDK Expo**: 52.0.0
- **Última Atualização**: 15/05/2025

## 🛠️ Stack Tecnológico

### Core
- **Expo SDK**: 52.0.46
- **React Native**: 0.76.9
- **TypeScript**: 5.3.0
- **React**: 18.3.1

### Principais Dependências
- **expo-av**: ~15.0.2 (Streaming de áudio)
- **expo-notifications**: ~0.29.14 (Notificações)
- **expo-router**: ~4.0.21 (Navegação)
- **react-native-reanimated**: ~3.16.1 (Animações)
- **react-native-safe-area-context**: 4.12.0 (Safe Area)

## 📁 Estrutura do Projeto

```
radio-camara-app/
├── app/                    # Rotas e telas (expo-router)
│   ├── (tabs)/            # Navegação por abas
│   ├── help.tsx           # Tela de ajuda
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes UI
│   ├── radio-player/      # Componentes do player
│   ├── ui/               # Componentes de UI reutilizáveis
│   ├── AudioWave.tsx     # Visualização de ondas
│   └── RadioPlayer.tsx   # Player principal
├── hooks/                # Hooks personalizados
├── context/             # Contextos React
├── constants/           # Configurações e constantes
├── types/              # Definições de tipos
└── assets/            # Recursos estáticos
```

## 🔧 Configurações Técnicas

### app.json
```json
{
  "expo": {
    "name": "Rádio Câmara Sete Lagoas",
    "slug": "radiocamarasetelagoas",
    "version": "1.0.2",
    "android": {
      "package": "com.cm7.radiocamara",
      "versionCode": 7,
      "permissions": [
        "FOREGROUND_SERVICE",
        "WAKE_LOCK",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "POST_NOTIFICATIONS",
        "BLUETOOTH_CONNECT",
        "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"
      ]
    }
  }
}
```

## 🎯 Melhorias Implementadas

### 1. Otimização de Performance
- Implementação de React.memo para componentes
- Uso de useCallback e useMemo
- Otimização de re-renders
- Gerenciamento eficiente de estado

### 2. Melhorias de UI/UX
- Interface responsiva para diferentes tamanhos de tela
- Suporte a modo escuro
- Animações suaves com Reanimated
- Feedback visual aprimorado

### 3. Gerenciamento de Áudio
- Streaming otimizado com expo-av
- Controles de mídia na tela de bloqueio
- Gerenciamento de interrupções
- Cache de streaming

### 4. Segurança e Estabilidade
- Validação de tipos com TypeScript
- Tratamento de erros robusto
- Gerenciamento de permissões
- Proteção contra crashes

## 📱 Preparação para Play Store

### Requisitos Atendidos
- [x] VersionCode e versionName atualizados
- [x] Permissões configuradas corretamente
- [x] Ícones e splash screen otimizados
- [x] Política de privacidade atualizada
- [x] Screenshots e descrições prontas

### Processo de Build
```bash
# Build de produção
eas build --platform android --profile production

# Submissão para Play Store
eas submit --platform android
```

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
   - Otimização de bateria pode afetar streaming

2. **iOS**
   - Requer iOS 13.0 ou superior
   - Necessário permissão de áudio em background

## 📈 Próximas Melhorias Planejadas

1. **Curto Prazo**
   - Refatoração do RadioPlayer.tsx
   - Implementação de testes unitários
   - Otimização de bundle size

2. **Médio Prazo**
   - Melhorias de acessibilidade
   - Analytics e monitoramento
   - Cache offline

3. **Longo Prazo**
   - Suporte a múltiplos streams
   - Integração com redes sociais
   - Recursos premium

## 📞 Suporte Técnico

- E-mail: rodrigo.cpd@camarasete.mg.gov.br
- WhatsApp: (31) 98634-0773
- Horário: Segunda a Sexta, 8h às 17h

## 🔒 Elementos Críticos

NUNCA altere estes elementos:
1. **Package Name**: `com.cm7.radiocamara`
2. **Chave de Assinatura**: Gerada pelo EAS
3. **Version Code**: Sempre incrementar

## 📚 Referências

- [Documentação Expo](https://docs.expo.dev)
- [Documentação React Native](https://reactnative.dev)
- [Google Play Console](https://play.google.com/console)
- [Expo EAS](https://docs.expo.dev/eas/)