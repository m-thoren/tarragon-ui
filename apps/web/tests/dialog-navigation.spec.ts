import { expect, test } from '@playwright/test'
import { buildUrl } from './utils'

test.describe('Dialog Navigation', () => {
	test.use({ viewport: { width: 375, height: 812 } })

	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/'))
	})

	test('should open and close the dialog navigation on mobile', async ({ page }) => {
		const openButton = page.getByRole('button', { name: 'Open navigation' })
		const drawer = page.getByRole('dialog').first()

		await openButton.click()
		await expect(drawer).toBeVisible()

		const closeButton = drawer.getByRole('button', { name: 'Close navigation' })
		await closeButton.click()
		await expect(drawer).toBeHidden()
	})

	test('should navigate to a page from the dialog navigation', async ({ page }) => {
		const openButton = page.getByRole('button', { name: 'Open navigation' })
		await openButton.click()

		const drawer = page.getByRole('dialog').first()
		const accordion = drawer.locator('.accordion-group')
		await accordion.locator('details').nth(3).click()
		const link = drawer.getByRole('link', { name: 'Button' })
		await link.click()

		await expect(page).toHaveURL(/\/button/)
	})
})
