import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Dropdown', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/dropdown'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render dropdown', async ({ page }) => {
		await expect(page.locator('tui-dropdown')).toBeVisible()
	})
})
