import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Button', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/button'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('should render all button variants', async ({ page }) => {
		const buttonVariants = page.getByTestId('button-variants')
		const buttons = buttonVariants.locator('button, a.btn')

		await expect(buttons).toHaveCount(7)

		const variants = ['accent', 'outline', 'danger', 'ghost', 'link', 'size-icon']

		for (const variant of variants) {
			await expect(page.getByTestId('button-variants').locator(`.${variant}`)).toBeVisible()
		}
	})
})
