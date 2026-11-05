module.exports = {
	plugins: [
		require('postcss-import'), // Inlines @import rules
		require('postcss-custom-media'),
		require('cssnano')({
			// Minifies CSS
			preset: ['default', { calc: false }],
		}),
	],
}
