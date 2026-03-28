import { buildUrl, testPageAccessibility } from './utils'
import test, { expect } from '@playwright/test'

test.describe('Exclusive Checkbox', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/exclusive-checkbox'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render exclusive checkbox', async ({ page }) => {
		await expect(page.locator('tui-exclusive-checkbox')).toBeVisible()
	})
})
