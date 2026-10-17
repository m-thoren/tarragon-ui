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
		await expect(component.getByRole('status')).toHaveText('Data fetched successfully')
	})
})
