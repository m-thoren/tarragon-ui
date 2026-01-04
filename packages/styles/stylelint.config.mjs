/** @type {import("stylelint").Config} */
export default {
	extends: ['stylelint-config-standard', 'stylelint-config-clean-order/error'],
	ignoreFiles: ['dist/**', 'node_modules/**'],
	rules: {
		'custom-property-pattern':
			'^(color|shadow|outline|radius|text|line-height|size|font|maximum|minimum|breakpoint)-[a-z0-9-]+$',
	},
}
