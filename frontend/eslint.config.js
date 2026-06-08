import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
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
    rules: {
      // Third-party libs (Cornerstone, API responses) don't have complete types
      '@typescript-eslint/no-explicit-any': 'warn',
      // Effects legitimately set state in error/cleanup handlers throughout this codebase
      'react-hooks/set-state-in-effect': 'warn',
      // Allow _-prefixed params that mark intentionally unused destructured props
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Allow empty catch blocks used to swallow expected parse/init errors
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
])
