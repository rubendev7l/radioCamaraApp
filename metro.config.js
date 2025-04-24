// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adiciona suporte para .mjs
config.resolver.sourceExts.push('mjs');

// Configuração do cache
config.cacheStores = [];

// Configuração do transformer
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true
    }
  }
};

// Configuração do resolver
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts,
  sourceExts: [...config.resolver.sourceExts]
};

module.exports = config;
