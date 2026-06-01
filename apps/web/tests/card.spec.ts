import { buildUrl, testPageAccessibility } from './utils'
import { test } from '@playwright/test'

test.describe('Card', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/card'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})
})
