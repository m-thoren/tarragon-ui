import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Validate form', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/validate-form'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render validate form', async ({ page }) => {
		await expect(page.locator('tui-validate-form')).toBeVisible()
	})
})
