module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        // Χρήση συνάρτησης αντί για RegExp για να μην κρασάρει όταν το Metro δεν περνάει filename
        exclude: function (filename) {
          return filename && filename.includes('node_modules');
        },
        plugins: [
          ['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
          ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
        ],
      },
    ],
  };
};