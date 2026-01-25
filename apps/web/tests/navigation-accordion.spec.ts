import { expect, test } from '@playwright/test'
import { buildUrl } from './utils'

test.describe('Navigation Accordion', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/introduction'))
	})

	test('should show current section as expanded', async ({ page }) => {
		const accordion = page.locator('aside .accordion-group')
		await expect(accordion).toBeVisible()

		await expect(accordion.locator('details').first()).toHaveAttribute('open', '')
	})

	test('should show current page as active', async ({ page }) => {
		const accordion = page.locator('aside .accordion-group')

		await expect(accordion.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
			'aria-current',
			'page',
		)
	})

	test('should show update active page after navigation', async ({ page }) => {
		const accordion = page.locator('aside .accordion-group')

		await expect(accordion.locator('details').first()).toHaveAttribute('open', '')
		await expect(accordion.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
			'aria-current',
			'page',
		)

		await page.goto(buildUrl('/button'))

		await expect(accordion.locator('details').first()).not.toHaveAttribute('open', '')
		await expect(accordion.getByRole('link', { name: 'Introduction' })).toBeHidden()
		await expect(accordion.locator('details').nth(3)).toHaveAttribute('open', '')
		await expect(accordion.getByRole('link', { name: 'Button' })).toHaveAttribute(
			'aria-current',
			'page',
		)
	})
})
