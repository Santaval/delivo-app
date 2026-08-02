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
      ],
    },
  },
]);
