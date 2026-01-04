import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
	build: {
		// Library entry points
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				// Add more entries here for other components you want to expose directly
				// e.g., button: resolve(__dirname, 'src/button.ts'),
			},
			formats: ['es'],
		},
		rollupOptions: {
			// Externalize deps that shouldn't be bundled with your library
			external: [], // Add any external dependencies here, e.g., ['react', 'vue']
			output: {
				// Control where the output files go
				// e.g., output/dropdown.js, output/dialog.js etc.
				entryFileNames: '[name].js', // This keeps entry file names like 'index.js', 'dropdown.js'
			},
		},
		// Output directory
		outDir: 'dist',
		emptyOutDir: true, // Clean the dist directory before building
	},
	plugins: [
		dts({
			entryRoot: 'src', // Specifies the root directory of your source files
			outDir: 'dist', // Output directory for d.ts files
			tsconfigPath: './tsconfig.json', // Path to your tsconfig.json
		}),
	],
})
