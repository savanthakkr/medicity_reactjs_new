import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		ignores: ['dist/**', 'node_modules/**']
	},
	js.configs.recommended,
	{
		files: ['**/*.{js,mjs,cjs,jsx}'],
		...pluginReact.configs.flat.recommended,
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			},
			globals: globals.browser
		},
		plugins: {
			react: pluginReact,
			'react-hooks': pluginReactHooks,
			'react-refresh': pluginReactRefresh
		},
		rules: {
			...pluginReact.configs.flat.recommended.rules,
			...pluginReactHooks.configs.recommended.rules,
			'react/react-in-jsx-scope': 'off',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
		},
		settings: {
			react: {
				version: 'detect'
			}
		}
	}
]);
