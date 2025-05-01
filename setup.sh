#!/bin/bash

echo "🚀 Iniciando configuração do ambiente de desenvolvimento..."

# Verificar versão do Node.js
echo "📦 Verificando versão do Node.js..."
node_version=$(node -v)
if [[ ${node_version:1:2} -lt 18 ]]; then
    echo "❌ Node.js versão 18 ou superior é necessária. Versão atual: $node_version"
    echo "Por favor, atualize o Node.js: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js versão $node_version detectada"

# Verificar versão do npm
echo "📦 Verificando versão do npm..."
npm_version=$(npm -v)
echo "✅ npm versão $npm_version detectada"

# Limpar cache e instalações anteriores
echo "🧹 Limpando cache e instalações anteriores..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Instalar dependências
echo "📥 Instalando dependências..."
npm install

# Verificar instalação do Expo CLI
echo "📱 Verificando Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "📥 Instalando Expo CLI globalmente..."
    npm install -g expo-cli
fi

# Verificar instalação do EAS CLI
echo "🛠️ Verificando EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "📥 Instalando EAS CLI globalmente..."
    npm install -g eas-cli
fi

# Configurar ambiente Android
echo "🤖 Configurando ambiente Android..."
npx expo prebuild

# Verificar configuração
echo "🔍 Verificando configuração do projeto..."
npx expo doctor

echo "✨ Configuração concluída!"
echo "
📝 Próximos passos:
1. Certifique-se de ter o Android Studio instalado
2. Instale o Android SDK 34
3. Instale o Build Tools 34.0.0
4. Instale o NDK 26.1.10909125
5. Configure as variáveis de ambiente ANDROID_HOME e JAVA_HOME

Para iniciar o projeto:
- Desenvolvimento: npm start
- Android: npm run android
- iOS: npm run ios
" 