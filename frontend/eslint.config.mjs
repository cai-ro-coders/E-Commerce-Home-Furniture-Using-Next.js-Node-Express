import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // The API serves generated SVG placeholders that Next's image optimiser
      // will not rasterise, so a plain <img> is deliberate throughout.
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Every module here is a client component that loads its own data. The
      // rule's remedy is a framework data layer (loader + Suspense), which the
      // spec's REST-API-plus-SPA shape does not have, so a fetch-on-mount effect
      // is the intended pattern rather than an oversight.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default eslintConfig;
