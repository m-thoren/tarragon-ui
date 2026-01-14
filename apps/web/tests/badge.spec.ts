import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Badge', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/badge'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render all default badge variants', async ({ page }) => {
		const badgeVariants = page.getByTestId('badge-variants-default')
		const badges = badgeVariants.locator('.badge')

		await expect(badges).toHaveCount(6)

		const variants = ['accent', 'info', 'success', 'warning', 'danger']

		for (const variant of variants) {
			const badge = badgeVariants.locator(`.${variant}`).first()
			await expect(badge).toBeVisible()
			await expect(badge).not.toContainClass('outline')
		}
	})

	test('should render all outline badge variants', async ({ page }) => {
		const badgeVariants = page.getByTestId('badge-variants-outline')
		const badges = badgeVariants.locator('.badge')

		await expect(badges).toHaveCount(6)

		const variants = ['accent', 'info', 'success', 'warning', 'danger']

		for (const variant of variants) {
			const badge = badgeVariants.locator(`.${variant}`).first()
			await expect(badge).toBeVisible()
			await expect(badge).toContainClass('outline')
		}
	})

	test('should render all pill badge variants', async ({ page }) => {
		const badgeVariants = page.getByTestId('badge-variants-pill')
		const badges = badgeVariants.locator('.badge')

		await expect(badges).toHaveCount(4)

		const variants = ['accent', 'info', 'danger']

		for (const variant of variants) {
			const badge = badgeVariants.locator(`.${variant}`).first()
			await expect(badge).toBeVisible()
		}
	})
})
