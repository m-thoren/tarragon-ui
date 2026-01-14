import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Button', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/button'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should render all default button variants', async ({ page }) => {
		const buttonVariants = page.getByTestId('button-variants-default')
		const buttons = buttonVariants.locator('button, a.btn')

		await expect(buttons).toHaveCount(8)

		const variants = ['accent', 'info', 'success', 'warning', 'danger', 'size-icon']

		for (const variant of variants) {
			const button = buttonVariants.locator(`.${variant}`).first()
			await expect(button).toBeVisible()
			await expect(button).not.toContainClass('outline')
			await expect(button).not.toContainClass('ghost')
		}
	})

	test('should render all outline button variants', async ({ page }) => {
		const buttonVariants = page.getByTestId('button-variants-outline')
		const buttons = buttonVariants.locator('button, a.btn')

		await expect(buttons).toHaveCount(8)

		const variants = ['accent', 'info', 'success', 'warning', 'danger', 'size-icon']

		for (const variant of variants) {
			const button = buttonVariants.locator(`.${variant}`).first()
			await expect(button).toBeVisible()
			await expect(button).toContainClass('outline')
			await expect(button).not.toContainClass('ghost')
		}
	})

	test('should render all ghost button variants', async ({ page }) => {
		const buttonVariants = page.getByTestId('button-variants-ghost')
		const buttons = buttonVariants.locator('button, a.btn')

		await expect(buttons).toHaveCount(8)

		const variants = ['accent', 'info', 'success', 'warning', 'danger', 'size-icon']

		for (const variant of variants) {
			const button = buttonVariants.locator(`.${variant}`).first()
			await expect(button).toBeVisible()
			await expect(button).not.toContainClass('outline')
			await expect(button).toContainClass('ghost')
		}
	})

	test('should render all link button variants', async ({ page }) => {
		const buttonVariants = page.getByTestId('button-variants-link')
		const buttons = buttonVariants.locator('button, a.btn')

		await expect(buttons).toHaveCount(3)

		const variants = ['outline', 'ghost']

		for (const variant of variants) {
			await expect(buttonVariants.locator(`.${variant}`)).toBeVisible()
		}
	})
})
