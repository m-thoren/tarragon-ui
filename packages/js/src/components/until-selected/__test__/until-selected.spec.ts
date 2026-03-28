import { expect, test } from '@playwright/test'

const componentName = 'tui-until-selected'
const testPath = '/src/components/until-selected/__test__'

test.describe(componentName, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)
	})

	test('should initialize', async ({ page }) => {
		const component = page.locator(componentName)
		await expect(component).toHaveAttribute('data-tui-ready')
		await expect(component).toBeHidden()
	})

	test('should show content when toggled on', async ({ page }) => {
		const component = page.locator(componentName)
		const switchElement = page.getByRole('switch')

		await expect(component).toBeHidden()
		await switchElement.click()
		await expect(component).toBeVisible()
		await switchElement.click()
		await expect(component).toBeHidden()
	})
})

test.describe(`${componentName} - show when not checked`, () => {
	test('should initialize', async ({ page }) => {
		await page.goto(`${testPath}/show-when-not-checked.html`)

		const component = page.locator(componentName)
		await expect(component).toHaveAttribute('data-tui-ready')
		await expect(component).toBeVisible()
	})
})

test.describe(`${componentName} - no-js`, () => {
	test('should not initialize', async ({ page }) => {
		await page.goto(`${testPath}/no-js.html`)

		const component = page.locator(componentName)
		await expect(component).not.toHaveAttribute('data-tui-ready')
		await expect(component).toBeVisible()
	})
})
