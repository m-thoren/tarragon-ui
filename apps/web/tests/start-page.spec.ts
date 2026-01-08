import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Start Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('link should navigate to the correct page', async ({ page }) => {
		await page.getByRole('link', { name: 'Get started' }).click()
		await expect(page).toHaveURL(/\/introduction/)
	})
})
