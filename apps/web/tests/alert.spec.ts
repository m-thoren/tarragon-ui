import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Alert', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/alert'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render all alert variants', async ({ page }) => {
		const alerts = page.locator('.alert')

		await expect(alerts).toHaveCount(12)
	})
})
