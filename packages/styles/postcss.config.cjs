module.exports = {
	plugins: [
		require('postcss-import'), // Inlines @import rules
		require('cssnano')({
			// Minifies CSS
			preset: 'default',
		}),
	],
}
