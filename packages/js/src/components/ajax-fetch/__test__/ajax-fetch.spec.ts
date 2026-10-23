import { expect, test } from '@playwright/test'

const testPath = '/src/components/ajax-fetch/__test__'

test.describe('tui-ajax-fetch', () => {
	test('debounces control changes and submits successful values as query parameters', async ({
		page,
	}) => {
		const requests: Array<URL> = []
		await page.route('**/api/messages*', async (route) => {
			requests.push(new URL(route.request().url()))
			await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Results</p>' })
		})
		await page.goto(`${testPath}/default.html`)

		await page
			.locator('input[name="query"]')
			.first()
			.evaluate((input) => {
				const form = input.closest('form')
				if (!form) throw new Error('Expected the search input to be inside a form')
				const checkbox = form.querySelector<HTMLInputElement>('input[type="checkbox"]')
				const select = form.querySelector('select')
				if (!checkbox || !select) throw new Error('Expected checkbox and select controls')
				;(input as HTMLInputElement).value = 'tarragon'
				checkbox.checked = true
				select.value = 'oldest'
				input.dispatchEvent(new Event('input', { bubbles: true }))
				checkbox.dispatchEvent(new Event('change', { bubbles: true }))
				select.dispatchEvent(new Event('change', { bubbles: true }))
			})

		expect(requests).toHaveLength(0)
		await expect.poll(() => requests.length).toBe(1)
		expect(requests[0]?.searchParams.get('query')).toBe('tarragon')
		expect(requests[0]?.searchParams.get('category')).toBe('news')
		expect(requests[0]?.searchParams.get('sort')).toBe('oldest')
	})

	test('only fetches on submit by default', async ({ page }) => {
		const requests: Array<URL> = []
		await page.route('**/api/messages*', async (route) => {
			requests.push(new URL(route.request().url()))
			await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Results</p>' })
		})
		await page.goto(`${testPath}/default.html`)

		const component = page.locator('tui-ajax-fetch').nth(1)
		await component.locator('input[name="query"]').fill('submitted')
		await component.locator('input[name="query"]').dispatchEvent('change')
		expect(requests).toHaveLength(0)

		await component.getByRole('button', { name: 'Fetch' }).click()
		await expect.poll(() => requests.length).toBe(1)
		expect(requests[0]?.searchParams.get('query')).toBe('submitted')
	})

	test('keeps the form enabled and aborts an older request', async ({ page }) => {
		const requests: Array<URL> = []
		const failedRequests: Array<URL> = []
		let releaseFirstRequest: (() => void) | undefined
		page.on('requestfailed', (request) => {
			if (request.url().includes('/api/messages')) failedRequests.push(new URL(request.url()))
		})
		await page.route('**/api/messages*', async (route) => {
			requests.push(new URL(route.request().url()))
			if (requests.length === 1) {
				await new Promise<void>((resolve) => {
					releaseFirstRequest = resolve
				})
				if (route.request().failure()) return
			}
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Results</p>',
			})
		})
		await page.goto(`${testPath}/default.html`)

		const component = page.locator('tui-ajax-fetch').nth(1)
		const search = component.locator('input[name="query"]')
		const submit = component.getByRole('button', { name: 'Fetch' })
		await search.fill('first')
		await submit.click()
		await expect.poll(() => requests.length).toBe(1)
		await expect(submit).toBeEnabled()
		await search.fill('latest')
		await submit.click()
		await expect.poll(() => requests.length).toBe(2)
		await expect.poll(() => failedRequests.length).toBe(1)

		const release = releaseFirstRequest
		if (!release) throw new Error('Expected the first request to be pending')
		release()

		expect(requests[1]?.searchParams.get('query')).toBe('latest')
		await expect(page.locator('#ajax-fetch-status')).toHaveText('Data fetched successfully')
	})

	test('announces a failed request', async ({ page }) => {
		await page.route('**/api/messages*', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Fetch failed' }),
			})
		})
		await page.goto(`${testPath}/default.html`)
		const component = page.locator('tui-ajax-fetch').nth(1)
		await component.getByRole('button', { name: 'Fetch' }).click()

		await expect(page.locator('#ajax-fetch-status')).toHaveText('An error occurred')
	})

	test('announces response content or the success fallback', async ({ page }) => {
		let requestCount = 0
		await page.route('**/api/messages*', async (route) => {
			requestCount += 1
			const body =
				requestCount === 1
					? '<template data-tui-announce><p>12 messages found.</p></template><p>Results</p>'
					: '<p>Results</p>'
			await route.fulfill({ status: 200, contentType: 'text/html', body })
		})
		await page.goto(`${testPath}/default.html`)
		const component = page.locator('tui-ajax-fetch').nth(1)
		const submit = component.getByRole('button', { name: 'Fetch' })

		await submit.click()
		await expect(page.locator('#ajax-fetch-status')).toHaveText('12 messages found.')

		await submit.click()
		await expect(page.locator('#ajax-fetch-status')).toHaveText('Data fetched successfully')

		await page.locator('#ajax-fetch-status').evaluate((element) => {
			const observer = new MutationObserver(() => {
				if (element.innerHTML === '') element.setAttribute('data-empty-seen', '')
			})
			observer.observe(element, { childList: true, subtree: true })
		})
		await submit.click()
		await expect(page.locator('#ajax-fetch-status')).toHaveAttribute('data-empty-seen', '')
		await expect(page.locator('#ajax-fetch-status')).toHaveText('Data fetched successfully')
	})

	test('announces pending text only when a request is slow', async ({ page }) => {
		let releaseRequest: (() => void) | undefined
		await page.route('**/api/messages*', async (route) => {
			await new Promise<void>((resolve) => {
				releaseRequest = resolve
			})
			await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Results</p>' })
		})
		await page.goto(`${testPath}/default.html`)
		const component = page.locator('tui-ajax-fetch').nth(1)
		await page.locator('#ajax-fetch-status').evaluate((element) => {
			element.textContent = 'Previous result'
		})
		await component.getByRole('button', { name: 'Fetch' }).click()

		await expect(page.locator('#ajax-fetch-status')).toHaveText('Previous result')
		await expect(page.locator('#ajax-fetch-status')).toHaveText('Fetching...', {
			timeout: 1000,
		})
		releaseRequest?.()
		await expect(page.locator('#ajax-fetch-status')).toHaveText('Data fetched successfully')
	})

	test('uses announce content from an HTML error response', async ({ page }) => {
		await page.route('**/api/messages*', async (route) => {
			await route.fulfill({
				status: 422,
				contentType: 'text/html',
				body: '<template data-tui-announce><p>Search term is invalid.</p></template>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.locator('tui-ajax-fetch').nth(1).getByRole('button', { name: 'Fetch' }).click()

		await expect(page.locator('#ajax-fetch-status')).toHaveText('Search term is invalid.')
	})
})
