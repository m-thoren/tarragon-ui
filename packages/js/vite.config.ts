import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	build: {
		// Library entry points
		lib: {
			entry: {
				index: resolve(__dirname, 'src/tarragon.ts'),
				// Add more entries here for other components you want to expose directly
				// e.g., button: resolve(__dirname, 'src/button.ts'),
			},
			name: 'tarragon',
			formats: ['es'],
			fileName: () => 'tarragon.js',
		},
		rollupOptions: {
			// Externalize deps that shouldn't be bundled with your library
			external: [], // Add any external dependencies here, e.g., ['react', 'vue']
			output: {
				exports: 'named',
			},
		},
		// Output directory
		outDir: 'dist',
		emptyOutDir: true, // Clean the dist directory before building
	},
})
