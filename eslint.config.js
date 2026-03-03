const nextConfig = require('eslint-config-next');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const i18next = require('eslint-plugin-i18next');

module.exports = [
  ...nextConfig,
  i18next.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: [
      'next.config.js',
      'next-i18next.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'jest.config.js',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
    ],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
