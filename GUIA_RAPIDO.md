# Guia Rápido - Rádio Câmara App

## Otimização de Build Android

### Expo vs Código Nativo
- O Expo Managed Workflow simplifica o desenvolvimento, mas:
  - Não resolve problemas de build nativo quando:
    - Adicionamos módulos nativos personalizados (como nosso `BatteryOptimizationManager`)
    - Modificamos configurações do Android (`build.gradle`)
    - Alteramos arquivos Java/Kotlin
  - O Expo CLI lida com:
    - Build do JavaScript/TypeScript
    - Configuração do Metro bundler
    - Gerenciamento de dependências JS
  - Mas não interfere em:
    - Build do código nativo Android
    - Configurações do Gradle
    - Resolução de conflitos Java/Kotlin
- Por isso precisamos:
  - Entender o processo de build Android
  - Gerenciar manualmente o Gradle quando necessário
  - Resolver problemas de classpath e configuração

### Contexto e Problemas Comuns
- O Android Studio e o Gradle podem apresentar problemas de build após alterações no código nativo
- Erros comuns incluem:
  - "File is not on the classpath"
  - "Build file has been changed and may need reload"
  - Builds lentos ou travados
- Estes problemas geralmente ocorrem após:
  - Adição de novos módulos nativos
  - Alterações no `build.gradle`
  - Conflitos entre arquivos Java e Kotlin
  - Cache corrompido do Gradle

### Gradle Wrapper
- Use `gradlew` em vez de `gradlew.bat` no Windows para builds mais rápidos
- O wrapper detecta automaticamente o sistema operacional
- Comandos comuns e seus propósitos:
  ```bash
  # Parar todos os daemons do Gradle
  # Use quando o build estiver travado ou após alterações significativas
  .\gradlew --stop

  # Limpar o projeto
  # Remove todos os arquivos compilados e caches
  # Necessário após alterações no build.gradle ou problemas de classpath
  .\gradlew clean

  # Build do projeto
  # Compila o projeto com as novas configurações
  .\gradlew build
  ```

### Dicas de Performance
- A primeira build após `clean` é mais lenta (fase de CONFIGURING)
  - O Gradle precisa reconfigurar todo o projeto
  - É normal ver mensagens como "Starting a Gradle Daemon"
  - Pode levar alguns minutos na primeira vez
- O Gradle mantém um daemon para builds subsequentes mais rápidos
  - O daemon é um processo que mantém o projeto em memória
  - Evita recarregar todas as configurações a cada build
- Use `--stop` apenas quando necessário limpar completamente o cache
  - Útil quando o daemon está travado ou consumindo muita memória
  - Necessário após alterações significativas no projeto
- Evite `clean` frequente - use apenas quando houver problemas de build
  - O `clean` força uma recompilação completa
  - Aumenta significativamente o tempo de build

### Troubleshooting
- Se o build estiver lento, verifique o status do daemon:
  ```bash
  .\gradlew --status
  ```
- Para problemas de classpath, verifique o `build.gradle` e a estrutura de diretórios
  - Confirme se os arquivos estão nos diretórios corretos
  - Verifique se não há conflitos entre Java e Kotlin
  - Certifique-se que o `sourceSets` está configurado corretamente
- Mantenha o Android Studio fechado durante builds via linha de comando
  - Evita conflitos de recursos e memória
  - Previne problemas de lock de arquivos

### Fluxo de Resolução de Problemas
1. Se encontrar erros de classpath ou build:
   ```bash
   .\gradlew --stop        # Para todos os daemons
   .\gradlew clean        # Limpa o projeto
   .\gradlew build        # Rebuild com configurações limpas
   ```
2. Se o problema persistir:
   - Verifique o `build.gradle`
   - Confirme a estrutura de diretórios
   - Verifique conflitos entre Java e Kotlin
3. Se ainda houver problemas:
   - Feche o Android Studio
   - Limpe o cache do Gradle em `~/.gradle/caches`
   - Tente o processo novamente

### Mudança de Local do Projeto
Se encontrar erros de caminho longo como:
```
The object file directory has 181 characters. The maximum full path to an object file is 250 characters
```

#### Preparação para a Mudança
1. Pare todos os processos:
   ```bash
   # Parar o Gradle
   cd android
   .\gradlew --stop
   ```
2. Feche o editor (VS Code/Cursor)
3. Verifique se não há processos Node.js rodando

#### Movendo o Projeto
1. Recorte (não copie) a pasta do projeto para um caminho mais curto:
   - De: `C:\Users\ruben\radioCamaraApp\radioCamaraApp`
   - Para: `C:\Dev\radioCamaraApp`

2. Após a mudança:
   ```bash
   # Navegue até o novo local
   cd C:\Dev\radioCamaraApp

   # Reinstale as dependências
   npm install

   # Limpe o cache do Gradle
   cd android
   .\gradlew clean

   # Tente o build
   .\gradlew build
   ```

#### Observações Importantes
- Use recortar em vez de copiar (é mais rápido)
- Mantenha a pasta `.git` para preservar o histórico
- Não é necessário alterar variáveis de ambiente
- O novo caminho deve ser mais curto que o original
- Recomendado: use `C:\Dev\` ou `C:\Projects\` como base 