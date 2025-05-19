# Guia do Desenvolvedor - Rádio Câmara Sete Lagoas

## 📁 Estrutura do Projeto

```
radio-camara-app/
├── app/                 # Telas do aplicativo (expo-router)
│   ├── (tabs)/         # Telas com menu inferior
│   │   ├── index.tsx   # Tela principal (Rádio)
│   │   ├── messages.tsx # Tela de mensagens
│   │   └── settings.tsx # Tela de configurações
│   └── _layout.tsx     # Configuração do menu
├── components/         # Componentes reutilizáveis
│   ├── RadioPlayer.tsx # Player principal
│   └── AudioWave.tsx   # Animação de onda
├── hooks/             # Funções reutilizáveis
│   ├── useAudioPlayer.ts # Controle de áudio
│   └── useNetworkStatus.ts # Status da rede
├── services/          # Serviços em background
│   └── ForegroundService.ts # Serviço de notificação
└── constants/         # Configurações
    ├── colors.ts      # Cores do app
    └── radio.ts       # Configurações da rádio
```

## 🔑 Arquivos Importantes

### 1. Player de Áudio (`components/RadioPlayer.tsx`)
- Controla a reprodução do áudio
- Gerencia os botões de play/pause
- Mostra o status da reprodução
- Exemplo de uso:
```typescript
<RadioPlayer 
  currentStation={{
    id: 'radio-camara',
    name: 'Rádio Câmara',
    streamUrl: 'https://...'
  }}
/>
```

### 2. Serviço em Background (`services/ForegroundService.ts`)
- Mantém a rádio tocando com a tela fechada
- Mostra notificação com controles
- Exemplo de uso:
```typescript
// Iniciar serviço
await ForegroundService.startService(true);

// Parar serviço
await ForegroundService.stopService();
```

### 3. Menu de Navegação (`app/(tabs)/_layout.tsx`)
- Define as telas do app
- Configura o menu inferior
- Exemplo de uso:
```typescript
<Tabs.Screen
  name="index"
  options={{
    title: 'Rádio',
    tabBarIcon: ({ color }) => (
      <Ionicons name="radio" size={24} color={color} />
    ),
  }}
/>
```

## 🎯 Como Implementar Novas Funcionalidades

### 1. Nova Tela
1. Crie um arquivo em `app/(tabs)/`
2. Adicione a rota em `_layout.tsx`
3. Use os componentes existentes

### 2. Novo Componente
1. Crie em `components/`
2. Use os hooks existentes
3. Siga o padrão de estilo

### 3. Nova Configuração
1. Adicione em `constants/`
2. Importe onde necessário
3. Mantenha o padrão

## ⚠️ Pontos de Atenção

### 1. Áudio
- Sempre use `useAudioPlayer` hook
- Não crie novas instâncias de áudio
- Mantenha o serviço em background

### 2. Notificações
- Use o `ForegroundService`
- Não crie novas notificações
- Mantenha o padrão visual

### 3. Estilo
- Use as cores de `constants/colors.ts`
- Siga o padrão de componentes
- Mantenha a consistência

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run android

# Build de produção
eas build --platform android

# Limpar cache
cd android && ./gradlew clean
```

## 📱 Testes

### 1. Teste Local
- Use `npm run android`
- Teste em diferentes dispositivos
- Verifique o consumo de bateria

### 2. Teste de Produção
- Use `eas build`
- Teste em vários celulares
- Verifique as notificações

## 🔍 Debugging

### 1. Logs
- Use `console.log` para debug
- Verifique o Metro bundler
- Monitore o consumo de memória

### 2. Erros Comuns
- Áudio não inicia: Verifique permissões
- Notificação não aparece: Verifique o serviço
- App trava: Verifique a memória

## 📚 Recursos

- [Documentação Expo](https://docs.expo.dev)
- [Documentação React Native](https://reactnative.dev)
- [Documentação TypeScript](https://www.typescriptlang.org)

## 🤝 Suporte

Para dúvidas técnicas:
- Email: rodrigo.cpd@camarasete.mg.gov.br
- WhatsApp: (31) 98634-0773

---

Desenvolvido com ❤️ pela equipe de TI da Câmara Municipal de Sete Lagoas

---

Feito pelo estagiário Ruben Neto.

Um agradecimento especial ao Rodrigão - Rodrigo do TI que me incentivou a desenvolver esse app. 