import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Validate form', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/forms'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render error messages when submitting an empty required form', async ({
		page,
	}) => {
		await page.click('button[type="submit"]')

		const errorMessages = page.locator('.form-message')
		await expect(errorMessages).toHaveCount(3)

		for (let i = 0; i < (await errorMessages.count()); i++) {
			await expect(errorMessages.nth(i)).toBeVisible()
		}
	})

	test('should clear error messages when filling out the form correctly', async ({ page }) => {
		await page.click('button[type="submit"]')

		await page.fill('input[name="username"]', 'John')
		await page.fill('input[name="password"]', '12345678')
		await page.locator('#checkbox-1').click()
		await expect(page.locator('#checkbox-1')).toBeChecked()

		const errorMessages = page.locator('.form-message')
		await expect(errorMessages).toHaveCount(0)
	})

	test('should show error message for too short password', async ({ page }) => {
		await page.fill('input[name="username"]', 'John')
		await page.fill('input[name="password"]', '123')

		await page.click('button[type="submit"]')

		const passwordErrorMessage = page.locator('input[name="password"] ~ .form-message')
		await expect(passwordErrorMessage).toHaveCount(1)
		await expect(passwordErrorMessage).toBeVisible()

		await page.fill('input[name="password"]', '12345678')
		await expect(passwordErrorMessage).toHaveCount(0)
		await expect(passwordErrorMessage).toBeHidden()
	})

	test('should show error message if phone number is in wrong format', async ({ page }) => {
		await page.fill('input[name="telephone"]', 'invalid-phone-number')

		await page.click('button[type="submit"]')

		const phoneErrorMessage = page.locator('input[name="telephone"] ~ .form-message')
		await expect(phoneErrorMessage).toHaveCount(1)
		await expect(phoneErrorMessage).toBeVisible()

		await page.fill('input[name="telephone"]', '+1234567890')
		await expect(phoneErrorMessage).toHaveCount(0)
		await expect(phoneErrorMessage).toBeHidden()
	})
})
