# Rádio Câmara Sete Lagoas

Aplicativo oficial da Rádio Câmara Sete Lagoas, desenvolvido para proporcionar acesso fácil e rápido às transmissões ao vivo da Câmara Municipal, além de oferecer uma plataforma de interação com os ouvintes.

## 🛠️ Desenvolvimento

Este projeto foi desenvolvido utilizando o [Cursor](https://cursor.sh/), um editor de código moderno com integração de IA, que proporcionou uma experiência de desenvolvimento mais eficiente e produtiva. A IA assistente foi fundamental para:

- Implementação de funcionalidades complexas
- Revisão e otimização de código
- Sugestões de melhores práticas
- Resolução de problemas técnicos
- Documentação do projeto

## 🚀 Funcionalidades

- **Transmissão Ao Vivo**: Acompanhe as sessões legislativas em tempo real
- **Controle de Áudio**: Play/Pause e controle de volume
- **Notificações**: Receba alertas sobre sessões e programas especiais
- **Interação**: Envie mensagens e solicite músicas via WhatsApp
- **Acessibilidade**: Interface adaptativa para modo claro/escuro
- **Suporte Técnico**: Canal direto para reportar problemas

## 📱 Tecnologias Utilizadas

- **Expo**: Framework para desenvolvimento mobile
- **React Native**: Biblioteca para construção de interfaces
- **TypeScript**: Linguagem para tipagem estática
- **Expo AV**: Para streaming de áudio
- **React Navigation**: Para navegação entre telas
- **React Native Reanimated**: Para animações

## 🛠️ Configuração do Ambiente

1. **Pré-requisitos**
   - Node.js (versão 14 ou superior)
   - npm ou yarn
   - Expo CLI

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
   # Inicie o servidor de desenvolvimento
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
├── hooks/             # Hooks personalizados
└── utils/             # Funções utilitárias
```

## 🔧 Configuração para Build

1. **Configuração do EAS**
   - Atualize o `eas.json` com suas configurações
   - Configure a conta de serviço do Google Play

2. **Build de Produção**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submissão para Play Store**
   ```bash
   eas submit --platform android
   ```

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um pull request.

## 📞 Suporte

Para suporte técnico, entre em contato:
- E-mail: rodrigo.cpd@camarasete.mg.gov.br
- WhatsApp: (31) 98634-0773

## 📱 Links Úteis

- [Site Oficial da Câmara](https://www.camarasete.mg.gov.br)
- [Play Store](link-para-play-store)
- [Documentação Expo](https://docs.expo.dev) 