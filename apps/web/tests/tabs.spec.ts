import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Tabs', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/tabs'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render tabs', async ({ page }) => {
		await expect(page.locator('tui-tabs')).toBeVisible()
	})
})
