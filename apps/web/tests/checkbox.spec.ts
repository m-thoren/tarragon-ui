import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Checkbox', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/checkbox'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('should toggle checkbox state on click', async ({ page }) => {
		const checkbox = page.locator('#checkbox-standard-1')
		await expect(checkbox).not.toBeChecked()
		await checkbox.click()
		await expect(checkbox).toBeChecked()
		await checkbox.click()
		await expect(checkbox).not.toBeChecked()
	})

	test('should toggle checkbox state on label click', async ({ page }) => {
		const checkbox = page.locator('#checkbox-standard-1')
		const label = page.locator('label[for="checkbox-standard-1"]')
		await expect(checkbox).not.toBeChecked()
		await label.click()
		await expect(checkbox).toBeChecked()
		await label.click()
		await expect(checkbox).not.toBeChecked()
	})
})
