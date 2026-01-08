import { expect, test } from '@playwright/test'
import { buildUrl } from './utils'

test.describe('Theme Toggle', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/'))
	})

	test('should start in light theme', async ({ page }) => {
		await expect(page.evaluate(() => document.body.classList.contains('light'))).resolves.toBe(
			true,
		)
		const backgroundColor = await page.evaluate(() => {
			return window.getComputedStyle(document.body).backgroundColor
		})
		expect(backgroundColor).toBe('oklch(0.97 0.004 56.38)')
	})

	test('should toggle to dark theme', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle theme' }).click()
		await expect(page.evaluate(() => document.body.classList.contains('light'))).resolves.toBe(
			false,
		)
		const backgroundColor = await page.evaluate(() => {
			return window.getComputedStyle(document.body).backgroundColor
		})
		expect(backgroundColor).toBe('oklch(0.14 0.006 286)')
	})
})
