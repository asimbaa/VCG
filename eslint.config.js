import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'src/**/*', 'scripts/**/*', 'server.ts', '*.config.*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
