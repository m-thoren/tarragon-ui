const config = {
	'**/*.{js,jsx,ts,tsx,astro,scss,css}': ['prettier --write'],
	'**/*.{js,jsx,ts,tsx,astro}': ['eslint --fix --config ./eslint.config.mts'],
	'packages/styles/**/*.{scss,css}': [
		'pnpm --filter @tarragon-ui/styles exec stylelint --fix',
	],
}

export default config
