import { buildUrl, sections } from '@/scripts/constants'

export function GET() {
	const origin = import.meta.env.SITE

	const urls: Array<string> = [buildUrl('/')]
	for (const section of sections) {
		for (const page of section.pages) {
			urls.push(page.href)
		}
	}

	const xmlUrls = urls
		.map((path) => {
			const loc = origin ? `${origin}${path}` : path
			return `  <url><loc>${loc}</loc></url>`
		})
		.join('\n')

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
		},
	})
}
