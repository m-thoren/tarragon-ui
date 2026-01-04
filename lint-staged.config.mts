const config = {
	'**/*.{js,jsx,ts,tsx,astro,scss,css}': ['prettier --write'],
	'**/*.{js,jsx,ts,tsx,astro}': ['eslint --fix --config ./eslint.config.mts'],
	'packages/styles/**/*.{scss,css}': [
		'npx stylelint --fix --config packages/styles/stylelint.config.mjs',
	],
}

export default config
