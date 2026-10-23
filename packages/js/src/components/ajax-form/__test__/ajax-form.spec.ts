import { expect, test } from '@playwright/test'

const testPath = '/src/components/ajax-form/__test__'

test.describe('tui-ajax-form', () => {
	test('submits encoded fields and updates matching ajax-html content', async ({ page }) => {
		let submittedBody = ''
		await page.route('**/api/messages', async (route) => {
			submittedBody = route.request().postData() ?? ''
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Saved message</p>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.setAttribute('data-tui-query-key', 'form-results')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.innerHTML =
				'<form action="/api/messages" method="POST"><label>Message <input name="message"></label><button type="submit">Send</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			const results = document.createElement('tui-ajax-html')
			results.id = 'form-results'
			results.setAttribute('data-tui-query-key', 'form-results')
			document.querySelector('main')?.append(wrapper, status, results)
		})
		await page.locator('input[name="message"]').fill('hello world')

		await page.getByRole('button', { name: 'Send' }).click()

		expect(submittedBody).toBe('message=hello+world')
		await expect(page.locator('#form-results')).toContainText('Saved message')
		await expect(page.locator('input[name="message"]')).toHaveValue('')
		await expect(page.getByRole('status')).toHaveText('Data submitted successfully')
	})

	test('preserves fields when requested and ignores duplicate submissions', async ({ page }) => {
		let requestCount = 0
		let releaseRequest: (() => void) | undefined
		await page.route('**/api/messages', async (route) => {
			requestCount += 1
			await new Promise<void>((resolve) => {
				releaseRequest = resolve
			})
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Saved</p>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.setAttribute('data-tui-query-key', 'form-results')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.setAttribute('data-tui-keep-fields', '')
			wrapper.innerHTML =
				'<form action="/api/messages" method="POST"><label>Message <input name="message" value="keep me"></label><button type="submit">Send</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(wrapper, status)
		})

		const button = page.getByRole('button', { name: 'Send' })
		await button.click()
		await expect.poll(() => releaseRequest).toBeDefined()
		await page.locator('form').dispatchEvent('submit')
		expect(requestCount).toBe(1)
		releaseRequest?.()

		await expect(page.locator('input[name="message"]')).toHaveValue('keep me')
		await expect(page.getByRole('status')).toHaveText('Data submitted successfully')
	})

	test('shows an error and restores the form after a failed request', async ({ page }) => {
		await page.route('**/api/messages', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Save failed' }),
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.setAttribute('data-tui-query-key', 'form-results')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.innerHTML =
				'<form action="/api/messages" method="POST"><button type="submit">Send</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(wrapper, status)
		})

		await page.getByRole('button', { name: 'Send' }).click()

		await expect(page.getByRole('status')).toHaveText('An error occurred')
		await expect(page.locator('tui-ajax-form')).not.toHaveAttribute('data-tui-is-submitting')
	})

	test('removes the component after a successful submission when requested', async ({ page }) => {
		await page.route('**/api/messages', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'text/html',
				body: '<p>Saved</p>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.id = 'one-time-form'
			wrapper.setAttribute('data-tui-query-key', 'form-results')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.setAttribute('data-tui-action-on-success', 'remove-form')
			wrapper.innerHTML =
				'<form action="/api/messages" method="POST"><button type="submit">Send once</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(wrapper, status)
		})

		await page.getByRole('button', { name: 'Send once' }).click()

		await expect(page.locator('#one-time-form')).toHaveCount(0)
	})

	test('announces response content or the success fallback without a query key', async ({
		page,
	}) => {
		let requestCount = 0
		await page.route('**/api/messages', async (route) => {
			requestCount += 1
			const body =
				requestCount === 1
					? '<template data-tui-announce><p>Message saved.</p></template><p>Saved</p>'
					: '<p>Saved</p>'
			await route.fulfill({ status: 200, contentType: 'text/html', body })
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.innerHTML =
				'<form action="/api/messages" method="POST"><button type="submit">Send</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(wrapper, status)
		})
		const submit = page.getByRole('button', { name: 'Send' })

		await submit.click()
		await expect(page.locator('#form-status')).toHaveText('Message saved.')

		await submit.click()
		await expect(page.locator('#form-status')).toHaveText('Data submitted successfully')

		await page.locator('#form-status').evaluate((element) => {
			const observer = new MutationObserver(() => {
				if (element.innerHTML === '') element.setAttribute('data-empty-seen', '')
			})
			observer.observe(element, { childList: true, subtree: true })
		})
		await submit.click()
		await expect(page.locator('#form-status')).toHaveAttribute('data-empty-seen', '')
		await expect(page.locator('#form-status')).toHaveText('Data submitted successfully')
	})

	test('announces pending text only when a request is slow', async ({ page }) => {
		let releaseRequest: (() => void) | undefined
		await page.route('**/api/messages', async (route) => {
			await new Promise<void>((resolve) => {
				releaseRequest = resolve
			})
			await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Saved</p>' })
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.innerHTML =
				'<form action="/api/messages" method="POST"><button type="submit">Send</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(wrapper, status)
		})
		await page.locator('#form-status').evaluate((element) => {
			element.textContent = 'Previous result'
		})
		await page.getByRole('button', { name: 'Send' }).click()

		await expect(page.locator('#form-status')).toHaveText('Previous result')
		await expect(page.locator('#form-status')).toHaveText('Submitting...', { timeout: 1000 })
		releaseRequest?.()
		await expect(page.locator('#form-status')).toHaveText('Data submitted successfully')
	})

	test('uses announce content from an HTML error response', async ({ page }) => {
		await page.route('**/api/messages', async (route) => {
			await route.fulfill({
				status: 422,
				contentType: 'text/html',
				body: '<template data-tui-announce><p>Please correct the message.</p></template>',
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.innerHTML =
				'<form action="/api/messages" method="POST"><button type="submit">Send</button></form>'
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(wrapper, status)
		})
		await page.getByRole('button', { name: 'Send' }).click()

		await expect(page.locator('#form-status')).toHaveText('Please correct the message.')
	})

	test('patches server validation errors without replacing controls or clearing values', async ({
		page,
	}) => {
		await page.route('**/api/messages', async (route) => {
			await route.fulfill({
				status: 422,
				contentType: 'text/html',
				body: `
					<template data-tui-announce>
						<p>There are two errors. Review the highlighted fields.</p>
					</template>
					<form data-tui-validation-form>
						<input id="validation-name" name="name" aria-invalid="true" aria-describedby="name-error">
						<p id="name-error" data-tui-validation-message>Name is already taken.</p>
						<textarea id="validation-note" name="note" aria-invalid="true" aria-describedby="note-error"></textarea>
						<p id="note-error" data-tui-validation-message>Note is required.</p>
						<select id="validation-category" name="category" aria-invalid="true" aria-describedby="category-error">
							<option value="">Choose one</option>
						</select>
						<p id="category-error" data-tui-validation-message>Choose a category.</p>
					</form>
				`,
			})
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const wrapper = document.createElement('tui-ajax-form')
			wrapper.setAttribute('data-tui-announce-id', 'form-status')
			wrapper.innerHTML = `
				<form action="/api/messages" method="POST">
					<label for="validation-name">Name</label>
					<input id="validation-name" name="name" value="My name" aria-describedby="name-help">
					<p id="name-help">Enter your display name.</p>
					<label for="validation-note">Note</label>
					<textarea id="validation-note" name="note">Keep this note</textarea>
					<label for="validation-category">Category</label>
					<select id="validation-category" name="category"><option value="">Choose one</option><option value="news" selected>News</option></select>
					<button type="submit">Send</button>
				</form>
			`
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(wrapper, status)
		})
		const nameInput = page.locator('#validation-name')
		const noteInput = page.locator('#validation-note')
		const categorySelect = page.locator('#validation-category')
		const originalNameInput = await nameInput.elementHandle()

		await page.getByRole('button', { name: 'Send' }).click()

		await expect(page.locator('#form-status')).toHaveText(
			'There are two errors. Review the highlighted fields.',
		)
		await expect(nameInput).toHaveValue('My name')
		await expect(noteInput).toHaveValue('Keep this note')
		await expect(categorySelect).toHaveValue('news')
		await expect(nameInput).toHaveAttribute('aria-invalid', 'true')
		await expect(nameInput).toHaveAttribute('aria-describedby', 'name-help name-error')
		await expect(page.locator('#name-error')).toHaveText('Name is already taken.')
		await expect(noteInput).toHaveAttribute('aria-invalid', 'true')
		await expect(page.locator('#note-error')).toHaveText('Note is required.')
		await expect(categorySelect).toHaveAttribute('aria-invalid', 'true')
		await expect(page.locator('#category-error')).toHaveText('Choose a category.')
		expect(
			await originalNameInput.evaluate(
				(element) => element === document.querySelector('#validation-name'),
			),
		).toBe(true)
		await expect(nameInput).toBeFocused()
	})

	test('works with tui-validate-form when a server error is corrected and resubmitted', async ({
		page,
	}) => {
		let requestCount = 0
		await page.route('**/api/messages', async (route) => {
			requestCount += 1
			if (requestCount === 1) {
				await route.fulfill({
					status: 422,
					contentType: 'text/html',
					body: `
						<template data-tui-announce><p>Email is already in use.</p></template>
						<form data-tui-validation-form>
							<input id="validated-email" name="email" type="email" aria-invalid="true" aria-describedby="email-help email-error">
							<p id="email-help">Use an address you can access.</p>
							<p id="email-error" data-tui-validation-message>This email is already registered.</p>
						</form>
					`,
				})
				return
			}
			await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Saved</p>' })
		})
		await page.goto(`${testPath}/default.html`)
		await page.evaluate(() => {
			const ajaxForm = document.createElement('tui-ajax-form')
			ajaxForm.setAttribute('data-tui-announce-id', 'form-status')
			ajaxForm.innerHTML = `
				<tui-validate-form>
					<form action="/api/messages" method="POST">
						<label for="validated-email">Email</label>
						<input id="validated-email" name="email" type="email" required aria-describedby="email-help">
						<p id="email-help">Use an address you can access.</p>
						<button type="submit">Send</button>
					</form>
				</tui-validate-form>
			`
			const status = document.createElement('div')
			status.id = 'form-status'
			document.querySelector('main')?.append(ajaxForm, status)
		})
		const email = page.locator('#validated-email')
		const originalEmail = await email.elementHandle()
		await email.fill('first@example.com')

		await page.getByRole('button', { name: 'Send' }).click()

		await expect(page.locator('#form-status')).toHaveText('Email is already in use.')
		await expect(email).toBeFocused()
		await expect(email).toHaveValue('first@example.com')
		await expect(email).toHaveAttribute('aria-describedby', 'email-help email-error')
		await expect(email).not.toHaveAttribute('data-tui-server-validation')
		await expect(page.locator('#email-error')).toHaveText('This email is already registered.')
		await email.dispatchEvent('input')
		await expect(email).toHaveAttribute('aria-invalid', 'true')
		await expect(page.locator('#email-error')).toHaveText('This email is already registered.')
		await page.getByRole('button', { name: 'Send' }).focus()
		await expect(email).toHaveAttribute('aria-invalid', 'true')
		await expect(page.locator('#email-error')).toHaveText('This email is already registered.')

		await email.fill('second@example.com')
		await expect(email).not.toHaveAttribute('aria-invalid', 'true')
		await expect(email).toHaveAttribute('aria-describedby', 'email-help')
		await expect(page.locator('#email-error')).toHaveCount(0)

		await page.getByRole('button', { name: 'Send' }).click()
		await expect(page.locator('#form-status')).toHaveText('Data submitted successfully')
		expect(requestCount).toBe(2)
		await expect(email).toHaveValue('')
		await expect(email).toHaveAttribute('aria-describedby', 'email-help')
		await expect(
			originalEmail.evaluate(
				(element) => element === document.querySelector('#validated-email'),
			),
		).resolves.toBe(true)
	})
})
