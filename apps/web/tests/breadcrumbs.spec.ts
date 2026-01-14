import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Breadcrumbs', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/breadcrumbs'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render breadcrumbs variants', async ({ page }) => {
		await expect(page.locator('.breadcrumb')).toHaveCount(2)
		await expect(page.locator('.breadcrumb li[aria-current="page"]')).toHaveCount(2)
	})
})
