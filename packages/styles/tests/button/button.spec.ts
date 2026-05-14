import test, { expect } from '@playwright/test'

const componentName = 'button'
const testPath = '/tests/button'

test.describe(componentName, () => {
	test('should match screenshot - dark', async ({ page }) => {
		await page.goto(`${testPath}/dark.html`)
		await expect(page).toHaveScreenshot()
	})

	test('should match screenshot - light', async ({ page }) => {
		await page.goto(`${testPath}/light.html`)
		await expect(page).toHaveScreenshot()
	})
})
