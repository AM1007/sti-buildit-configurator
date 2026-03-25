import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: ['src/app/**'], mode: 'full' },
        { type: 'pages', pattern: ['src/pages/**'], mode: 'full' },
        { type: 'features', pattern: ['src/features/**'], mode: 'full' },
        { type: 'entities', pattern: ['src/entities/**'], mode: 'full' },
        { type: 'shared', pattern: ['src/shared/**'], mode: 'full' },
      ],
      'boundaries/dependency-nodes': ['import'],
      'boundaries/include': ['src/**/*.{ts,tsx}'],
    },
    rules: {
      'boundaries/element-types': [
        'warn',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['app', 'pages', 'features', 'entities', 'shared'] },
            { from: 'pages', allow: ['pages', 'features', 'entities', 'shared'] },
            { from: 'features', allow: ['features', 'entities', 'shared'] },
            { from: 'entities', allow: ['entities', 'shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/pages/**/*.{ts,tsx}',
      'src/app/**/*.{ts,tsx}',
      'src/shared/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: [
                '@features/*/store/*',
                '@features/*/components/*',
                '@features/*/hooks/*',
                '@features/*/lib/*',
              ],
              message:
                'Import from feature barrel (@features/auth, @features/projects, @features/configurator) instead of internal modules.',
            },
          ],
        },
      ],
    },
  },
])
