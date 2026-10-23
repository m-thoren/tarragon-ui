import { expect, test } from '@playwright/test'

const testPath = '/src/components/ajax-html/__test__'

test.describe('tui-ajax-html', () => {
	test('loads immediately with the initial strategy and renders the matching element', async ({
		page,
	}) => {
		let requestCount = 0
		await page.route('**/api/initial-html', async (route) => {
			requestCount += 1
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<main><section id="initial-results"><p>Initial response</p></section></main>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const component = document.createElement('tui-ajax-html')
			component.id = 'initial-results'
			component.setAttribute('data-tui-query-key', 'initial-results-key')
			component.setAttribute('data-tui-url', '/api/initial-html')
			component.setAttribute('data-tui-load-strategy', 'initial')
			document.querySelector('main')?.append(component)
		})

		await expect(page.locator('#initial-results')).toContainText('Initial response')
		expect(requestCount).toBe(1)
	})

	test('uses cache data that exists before the lazy load', async ({ page }) => {
		let lazyRequestCount = 0
		await page.route('**/api/lazy-html', async (route) => {
			lazyRequestCount += 1
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Lazy response</p>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const fetchComponent = document.createElement('tui-ajax-fetch')
			fetchComponent.setAttribute('data-tui-query-key', 'shared-results')
			fetchComponent.setAttribute('data-tui-announce-id', 'fetch-status')
			fetchComponent.innerHTML =
				'<form action="/api/cached-html" method="GET"><button type="submit">Fetch</button></form>'
			const status = document.createElement('div')
			status.id = 'fetch-status'
			document.querySelector('main')?.append(fetchComponent, status)
		})
		await page.route('**/api/cached-html', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Cached response</p>',
			})
		})
		await page.getByRole('button', { name: 'Fetch' }).click()
		await expect(page.getByRole('status')).toHaveText('Data fetched successfully')
		await page.evaluate(() => {
			const htmlComponent = document.createElement('tui-ajax-html')
			htmlComponent.id = 'lazy-results'
			htmlComponent.setAttribute('data-tui-query-key', 'shared-results')
			htmlComponent.setAttribute('data-tui-load-strategy', 'lazy')
			htmlComponent.setAttribute('data-tui-url', '/api/lazy-html')
			htmlComponent.style.position = 'absolute'
			htmlComponent.style.top = '100000px'
			document.querySelector('main')?.append(htmlComponent)
		})

		await expect(page.locator('#lazy-results')).toContainText('Cached response')
		await page.locator('#lazy-results').scrollIntoViewIfNeeded()
		await page.waitForTimeout(100)
		expect(lazyRequestCount).toBe(0)
	})

	test('keeps a cache update that arrives during the lazy fetch', async ({ page }) => {
		let releaseLazyRequest: (() => void) | undefined
		await page.route('**/api/lazy-html', async (route) => {
			await new Promise<void>((resolve) => {
				releaseLazyRequest = resolve
			})
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Lazy response</p>',
			})
		})
		await page.route('**/api/updated-html', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Updated response</p>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const fetchComponent = document.createElement('tui-ajax-fetch')
			fetchComponent.setAttribute('data-tui-query-key', 'shared-results')
			fetchComponent.setAttribute('data-tui-announce-id', 'fetch-status')
			fetchComponent.innerHTML =
				'<form action="/api/updated-html" method="GET"><button type="submit">Fetch</button></form>'
			const status = document.createElement('div')
			status.id = 'fetch-status'
			const htmlComponent = document.createElement('tui-ajax-html')
			htmlComponent.id = 'lazy-results'
			htmlComponent.setAttribute('data-tui-query-key', 'shared-results')
			htmlComponent.setAttribute('data-tui-load-strategy', 'lazy')
			htmlComponent.setAttribute('data-tui-url', '/api/lazy-html')
			htmlComponent.style.marginTop = '2000px'
			document.querySelector('main')?.append(fetchComponent, status, htmlComponent)
		})

		await page.locator('#lazy-results').scrollIntoViewIfNeeded()
		await expect.poll(() => releaseLazyRequest).toBeDefined()
		await page.getByRole('button', { name: 'Fetch' }).click()
		await expect(page.locator('#lazy-results')).toContainText('Updated response')

		const release = releaseLazyRequest
		if (!release) throw new Error('Expected the lazy request to be pending')
		release()
		await expect(page.locator('#lazy-results')).toContainText('Updated response')
	})

	test('keeps an ajax-form update that arrives during the lazy fetch', async ({ page }) => {
		let releaseLazyRequest: (() => void) | undefined
		await page.route('**/api/lazy-html', async (route) => {
			await new Promise<void>((resolve) => {
				releaseLazyRequest = resolve
			})
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Lazy response</p>',
			})
		})
		await page.route('**/api/form-update', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Form update</p>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const formComponent = document.createElement('tui-ajax-form')
			formComponent.setAttribute('data-tui-query-key', 'shared-results')
			formComponent.setAttribute('data-tui-announce-id', 'form-status')
			formComponent.innerHTML =
				'<form action="/api/form-update" method="POST"><button type="submit">Save</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			const htmlComponent = document.createElement('tui-ajax-html')
			htmlComponent.id = 'lazy-results'
			htmlComponent.setAttribute('data-tui-query-key', 'shared-results')
			htmlComponent.setAttribute('data-tui-load-strategy', 'lazy')
			htmlComponent.setAttribute('data-tui-url', '/api/lazy-html')
			htmlComponent.style.marginTop = '2000px'
			document.querySelector('main')?.append(formComponent, status, htmlComponent)
		})

		await page.locator('#lazy-results').scrollIntoViewIfNeeded()
		await expect.poll(() => releaseLazyRequest).toBeDefined()
		await page.getByRole('button', { name: 'Save' }).click()
		await expect(page.locator('#lazy-results')).toContainText('Form update')

		const release = releaseLazyRequest
		if (!release) throw new Error('Expected the lazy request to be pending')
		release()
		await expect(page.locator('#lazy-results')).toContainText('Form update')
	})
})
