import { buildUrl, testPageAccessibility } from './utils'
import test, { expect } from '@playwright/test'

test.describe('Select All', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/select-all'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('select-all is visible', async ({ page }) => {
		const selectAll = page
			.getByRole('group', { name: 'Select all', exact: true })
			.locator('tui-select-all')
		await expect(selectAll).toBeVisible()
	})
})
