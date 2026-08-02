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
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='router'][callee.property.name=/^(push|replace|navigate)$/] > Literal",
          message:
            'Usa Routes.* de constants/routes.ts en lugar de strings/números literales como argumento de router.push|replace|navigate.',
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='router'][callee.property.name=/^(push|replace|navigate)$/] TemplateLiteral",
          message:
            'Usa Routes.* de constants/routes.ts en lugar de template literals como argumento de router.push|replace|navigate.',
        },
        {
          // The theme system (constants/Colors.ts, hooks/useColorScheme.ts) reads
          // the palettes by computed key, so it is not matched by this selector.
          // Anywhere else a hardcoded `Colors.light.*` silently breaks dark mode.
          selector:
            "MemberExpression[object.name='Colors'][property.name=/^(light|dark)$/]",
          message:
            'No uses Colors.light/Colors.dark directamente: resuelve el color con useThemeColor() para que el modo oscuro funcione.',
        },
      ],
    },
  },
]);
