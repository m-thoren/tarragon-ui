// @ts-check
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
	base: '/tarragon-ui',
	site: 'https://m-thoren.github.io/tarragon-ui',
	integrations: [],
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'viewport',
	},
	experimental: {
		clientPrerender: true,
	},
})
