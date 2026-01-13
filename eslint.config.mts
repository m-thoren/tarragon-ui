import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'

export default defineConfig([
	{
		ignores: [
			'**/dist',
			'**/*.js',
			'**/*.mjs',
			'**/*.mts',
			'**/*.cjs',
			'**/.astro',
			'**/*.astro/',
		],
	},
	js.configs.recommended,
	// Placing Prettier here ensures it applies to JS/TS files before Astro's configs.
	eslintConfigPrettier,

	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		files: ['**/*.ts', '**/*.astro'],
		rules: {
			'sort-imports': 'error',
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{
					allowNumber: true,
				},
			],
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: [
					'./tsconfig.scripts.json',
					'./packages/*/tsconfig.json',
					'./apps/*/tsconfig.json',
				],
				extraFileExtensions: ['.astro'],
				// You might need to specify the base directory if your tsconfig paths are relative
				// tsconfigRootDir: import.meta.dirname, // Or wherever your root tsconfig is located
			},
		},
	},
	{
		// Don't attempt to use typescript rules in astro files
		// <https://github.com/ota-meshi/eslint-plugin-astro/issues/447> 😔
		files: ['**/*.astro'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	...eslintPluginAstro.configs.recommended,
	...eslintPluginAstro.configs['jsx-a11y-strict'],
])
