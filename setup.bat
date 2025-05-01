@echo off
echo 🚀 Iniciando configuracao do ambiente de desenvolvimento...

:: Verificar versão do Node.js
echo 📦 Verificando versao do Node.js...
for /f "tokens=* usebackq" %%F in (`node -v`) do (
    set NODE_VERSION=%%F
)
set NODE_VERSION=%NODE_VERSION:~1,2%
if %NODE_VERSION% LSS 18 (
    echo ❌ Node.js versao 18 ou superior e necessaria. Versao atual: %NODE_VERSION%
    echo Por favor, atualize o Node.js: https://nodejs.org/
    exit /b 1
)
echo ✅ Node.js versao detectada

:: Verificar versão do npm
echo 📦 Verificando versao do npm...
for /f "tokens=* usebackq" %%F in (`npm -v`) do (
    set NPM_VERSION=%%F
)
echo ✅ npm versao %NPM_VERSION% detectada

:: Limpar cache e instalações anteriores
echo 🧹 Limpando cache e instalacoes anteriores...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json
call npm cache clean --force

:: Instalar dependências
echo 📥 Instalando dependencias...
call npm install

:: Verificar instalação do Expo CLI
echo 📱 Verificando Expo CLI...
where expo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📥 Instalando Expo CLI globalmente...
    call npm install -g expo-cli
)

:: Verificar instalação do EAS CLI
echo 🛠️ Verificando EAS CLI...
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📥 Instalando EAS CLI globalmente...
    call npm install -g eas-cli
)

:: Configurar ambiente Android
echo 🤖 Configurando ambiente Android...
call npx expo prebuild

:: Verificar configuração
echo 🔍 Verificando configuracao do projeto...
call npx expo doctor

echo ✨ Configuracao concluida!
echo.
echo 📝 Proximos passos:
echo 1. Certifique-se de ter o Android Studio instalado
echo 2. Instale o Android SDK 34
echo 3. Instale o Build Tools 34.0.0
echo 4. Instale o NDK 26.1.10909125
echo 5. Configure as variaveis de ambiente ANDROID_HOME e JAVA_HOME
echo.
echo Para iniciar o projeto:
echo - Desenvolvimento: npm start
echo - Android: npm run android
echo - iOS: npm run ios

pause 