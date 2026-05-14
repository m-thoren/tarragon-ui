import test, { expect } from '@playwright/test'

const componentName = 'wc-dropdown'
const testPath = '/tests/wc-dropdown'

test.describe(componentName, () => {
	test('should match screenshot - dark', async ({ page }) => {
		await page.goto(`${testPath}/dark.html`)
		await page.getByRole('button', { name: 'Open' }).click()
		await expect(page).toHaveScreenshot()
	})

	test('should match screenshot - light', async ({ page }) => {
		await page.goto(`${testPath}/light.html`)
		await page.getByRole('button', { name: 'Open' }).click()
		await expect(page).toHaveScreenshot()
	})
})
