import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Breadcrumbs', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/breadcrumbs'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('should render breadcrumbs variants', async ({ page }) => {
		await expect(page.locator('.breadcrumb')).toHaveCount(2)
		await expect(page.locator('.breadcrumb li[aria-current="page"]')).toHaveCount(2)
	})
})
