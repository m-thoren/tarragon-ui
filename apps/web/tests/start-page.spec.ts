import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Start Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('link should navigate to the correct page', async ({ page }) => {
		await page.getByRole('link', { name: 'Get started' }).click()
		await expect(page).toHaveURL(/\/installation/)
	})
})
