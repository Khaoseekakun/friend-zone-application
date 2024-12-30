module.exports = function async (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', '@babel/preset-typescript'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining'
    ],
  };
};
