import test, { expect } from '@playwright/test'

const componentName = 'tooltip'
const testPath = `src/components/${componentName}/tests`

test.describe(componentName, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)
	})

	test('should match screenshot - dark', async ({ page }) => {
		await page.getByRole('button').hover()
		await expect(page).toHaveScreenshot()
	})

	test('should match screenshot - light', async ({ page }) => {
		const body = page.locator('body')
		await body.evaluate((el) => {
			el.classList.add('light')
		})
		await page.getByRole('button').hover()
		await expect(page).toHaveScreenshot()
	})
})
