import { expect, test } from '@playwright/test'

const componentName = 'tui-boop'
const testPath = '/src/components/boop/__test__'

test.describe(componentName, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)
	})

	test('should initialize', async ({ page }) => {
		const component = page.locator(componentName)
		await expect(component).toHaveAttribute('data-tui-state', 'ready')
	})

	test('should add boop class on mouse enter', async ({ page }) => {
		const divElement = page.locator('div')
		await divElement.hover()
		const boopElement = page.locator('tui-boop')
		await expect(boopElement).toHaveClass(/boop-active/)
	})
})

test.describe(`${componentName} - bind-element attribute`, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/bind-element.html`)
	})

	test('should add boop class on mouse enter', async ({ page }) => {
		const bindElement = page.locator('#test')
		await bindElement.hover()
		const boopElement = page.locator('tui-boop')
		await expect(boopElement).toHaveClass(/boop-active/)
	})
})

test.describe(`${componentName} - focusable elements`, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/focusable-element.html`)
	})

	test('should add boop class on mouse enter', async ({ page }) => {
		const focusableElement = page.locator('button')
		await focusableElement.hover()
		const boopElement = page.locator('tui-boop')
		await expect(boopElement).toHaveClass(/boop-active/)
	})
})

test.describe(`${componentName} - no-js`, () => {
	test('should not initialize', async ({ page }) => {
		await page.goto(`${testPath}/no-js.html`)

		const component = page.locator(componentName)
		await expect(component).not.toHaveAttribute('data-tui-state', 'ready')
	})
})
