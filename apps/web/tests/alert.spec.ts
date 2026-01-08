import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Alert', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/alert'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('should render all alert variants', async ({ page }) => {
		const alerts = page.locator('.alert')

		await expect(alerts).toHaveCount(5)

		const variants = ['success', 'danger', 'warning']

		for (const variant of variants) {
			await expect(page.locator(`.alert-${variant}`)).toBeVisible()
		}
	})
})
