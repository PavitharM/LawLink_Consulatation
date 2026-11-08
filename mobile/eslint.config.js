// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // React Native <Text> renders apostrophes/quotes literally — the HTML-escaping rule doesn't apply.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
