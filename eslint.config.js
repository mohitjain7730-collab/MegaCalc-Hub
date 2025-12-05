// ESLint flat config for Next.js (ESLint 9.x compatible)
module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
  ...require('eslint-config-next/core-web-vitals'),
  ...require('eslint-config-next/typescript'),
];
