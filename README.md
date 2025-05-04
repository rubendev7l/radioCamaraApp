# Rádio Câmara Sete Lagoas

Aplicativo oficial da Rádio Câmara Sete Lagoas, desenvolvido para proporcionar acesso fácil e rápido às transmissões ao vivo da Câmara Municipal.

## 🚀 Funcionalidades

- **Transmissão Ao Vivo**: Acompanhe as sessões legislativas em tempo real
- **Controle de Áudio**: Play/Pause e controle de volume
- **Notificações**: Receba alertas sobre status da rádio
- **Controles na Tela de Bloqueio**: Controle a reprodução sem abrir o app
- **Interação**: Envie mensagens e solicite músicas via WhatsApp
- **Acessibilidade**: Interface adaptativa para modo claro/escuro
- **Suporte Técnico**: Canal direto para reportar problemas

## 📱 Tecnologias Utilizadas

- **Expo**: Framework para desenvolvimento mobile
- **React Native**: Biblioteca para construção de interfaces
- **TypeScript**: Linguagem para tipagem estática
- **Expo AV**: Para streaming e controles de mídia
- **React Navigation**: Para navegação entre telas
- **React Native Reanimated**: Para animações

## 🛠️ Configuração do Ambiente

1. **Pré-requisitos**
   - Node.js (versão 14 ou superior)
   - npm ou yarn
   - Expo CLI
   - Android Studio (para build nativo)

2. **Instalação**
   ```bash
   # Clone o repositório
   git clone https://github.com/seu-usuario/radio-camara-sete-lagoas.git

   # Instale as dependências
   npm install
   # ou
   yarn install
   ```

3. **Executando o Projeto**
   ```bash
   # Inicie o app
   npx expo start
   ```

## 📦 Estrutura do Projeto

```
radio-camara-app/
├── app/                 # Rotas e telas do aplicativo
├── assets/             # Recursos estáticos (imagens, fontes)
├── components/         # Componentes reutilizáveis
├── constants/          # Constantes e configurações
├── context/           # Contextos do React
└── utils/             # Funções utilitárias
```

## 📚 Documentação

Para informações técnicas detalhadas, consulte o arquivo [DOCUMENTACAO.md](./DOCUMENTACAO.md) que contém:

- Versões das dependências
- Configurações técnicas
- Processos de build
- Configurações de áudio
- Configurações de notificações
- Otimizações de performance
- Limitações conhecidas
- E muito mais!

## ⚠️ Importante

NUNCA altere estes elementos, pois podem causar conflitos sérios:

1. **Package Name** (`com.cm7.radiocamara`):
   - É o identificador único do app
   - Se mudar, será considerado um app novo
   - Perderá todas as avaliações e downloads

2. **Chave de Assinatura** (Keystore):
   - A chave que o EAS gerou
   - Se perder, não poderá mais atualizar o app
   - Guarde o `credentials.json` gerado pelo EAS

3. **Version Code** (no `app.json`):
   - Sempre deve ser maior que o anterior
   - Nunca deve ser menor
   - Nunca deve repetir

## 📞 Suporte

Para suporte técnico, entre em contato:
- E-mail: rodrigo.cpd@camarasete.mg.gov.br
- WhatsApp: (31) 98634-0773 (Rádio)
- Horário: Segunda a Sexta, 8h às 17h

## 📱 Links Úteis

- [Site Oficial da Câmara](https://www.camarasete.mg.gov.br)
- [Play Store](link-para-play-store)
- [Documentação Expo](https://docs.expo.dev)
- [Documentação Expo AV](https://docs.expo.dev/versions/latest/sdk/audio/)

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um pull request. 