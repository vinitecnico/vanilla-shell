const { withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const path = require('path');

module.exports = withModuleFederationPlugin({

  name: 'release',

  filename: 'remoteEntry.js',

  exposes: {
    './Module': './src/app/release/release.module.ts',
  },

  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/router': { singleton: true, strictVersion: true },
  },

  output: {
    uniqueName: 'release',
    publicPath: 'auto', // 🔥 ESSENCIAL para resolver assets corretamente
  },

});