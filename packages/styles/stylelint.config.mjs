import path from 'path' // Import the path module
import { fileURLToPath } from 'url' // Required for import.meta.url in some environments

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import("stylelint").Config} */
export default {
	extends: ['stylelint-config-standard', 'stylelint-config-clean-order/error'],
	ignoreFiles: ['dist/**', 'node_modules/**'],
	plugins: ['stylelint-value-no-unknown-custom-properties'],
	rules: {
		'csstools/value-no-unknown-custom-properties': [
			true,
			{
				importFrom: [
					path.resolve(__dirname, 'src/theme/colors.css'),
					path.resolve(__dirname, 'src/theme/rounded.css'),
					path.resolve(__dirname, 'src/theme/size.css'),
					path.resolve(__dirname, 'src/theme/typography.css'),
				],
			},
		],
		'custom-property-pattern':
			'^((color|shadow|outline|radius|text|line-height|size|font|maximum|minimum|breakpoint)-|_)[a-z0-9-]+$',
	},
}
