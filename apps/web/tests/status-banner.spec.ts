import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Status Banner', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/status-banner'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render all status banner variants', async ({ page }) => {
		const statusBanners = page.locator('.status-banner')

		await expect(statusBanners).toHaveCount(6)
	})
})
