import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Badge', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/badge'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('should render all badge variants', async ({ page }) => {
		const badgeVariants = page.getByTestId('badge-variants')
		const badges = badgeVariants.locator('.badge')

		await expect(badges).toHaveCount(8)

		const variants = ['accent', 'outline', 'danger']

		for (const variant of variants) {
			await expect(
				page.getByTestId('badge-variants').locator(`.badge-${variant}`).first(),
			).toBeVisible()
		}
	})
})
