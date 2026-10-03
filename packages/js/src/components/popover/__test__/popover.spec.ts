import { Component, libNamePrefix } from '@/utils/constants'
import { expect, test } from '@playwright/test'

const componentName = Component.Popover.Name
const componentTagName = `${libNamePrefix}${componentName}`
const testPath = `/src/components/${componentName}/__test__`

test.describe(componentName, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)

		const popoverWrapper = page.locator(componentTagName)
		await expect(popoverWrapper).toHaveAttribute('data-tui-state', 'ready')
	})

	test('should open and close the popover with keyboard', async ({ page }) => {
		const popoverWrapper = page.locator(componentTagName)
		const trigger = popoverWrapper.getByRole('button', { name: 'Open Popover' })
		const popover = popoverWrapper.locator('[popover]')

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(popover).toBeVisible()

		await page.keyboard.press('Escape')
		await expect(popover).toBeHidden()
	})

	test('should close the popover when clicking outside the popover area', async ({ page }) => {
		const popoverWrapper = page.locator(componentTagName)
		const trigger = popoverWrapper.getByRole('button', { name: 'Open Popover' })
		const popover = popoverWrapper.locator('[popover]')

		await trigger.click()
		await expect(popover).toBeVisible()

		await page.mouse.click(1, 1)
		await expect(popover).toBeHidden()
	})

	test('should add open data attribute to trigger', async ({ page }) => {
		const popoverWrapper = page.locator(componentTagName)
		const trigger = popoverWrapper.getByRole('button', { name: 'Open Popover' })
		const popover = popoverWrapper.locator('[popover]')

		await expect(async () => {
			const openAttribute = await popover.getAttribute('data-tui-state')
			expect(openAttribute).toBe('closed')
		}).toPass()

		await trigger.click()
		await expect(popover).toBeVisible()

		await expect(async () => {
			const openAttribute = await popover.getAttribute('data-tui-state')
			expect(openAttribute).toBe('open')
		}).toPass()
	})

	test('should close with tab', async ({ page }) => {
		const popoverWrapper = page.locator(componentTagName)
		const trigger = popoverWrapper.getByRole('button', { name: 'Open Popover' })
		const popover = popoverWrapper.locator('[popover]')

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(popover).toBeVisible()

		await page.keyboard.press('Tab')
		await expect(popover.locator('button').first()).toBeFocused()

		await page.keyboard.press('Tab')
		await expect(popover.locator('button').nth(1)).toBeFocused()

		await page.keyboard.press('Tab')
		await expect(async () => {
			const openAttribute = await popover.getAttribute('data-tui-state')
			expect(openAttribute).toBe('closed')
		}).toPass()
		await expect(popover).toBeHidden()
	})

	test('should close with shift + tab', async ({ page }) => {
		const popoverWrapper = page.locator(componentTagName)
		const trigger = popoverWrapper.getByRole('button', { name: 'Open Popover' })
		const popover = popoverWrapper.locator('[popover]')

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(popover).toBeVisible()

		await page.keyboard.down('Shift')
		await page.keyboard.press('Tab')
		await page.keyboard.up('Shift')
		await expect(async () => {
			const openAttribute = await popover.getAttribute('data-tui-state')
			expect(openAttribute).toBe('closed')
		}).toPass()
		await expect(popover).toBeHidden()
	})
})

test.describe(`${componentName} - no-js`, () => {
	test.use({ javaScriptEnabled: false })

	test('should not initialize', async ({ page }) => {
		await page.goto(`${testPath}/default.html`)

		const component = page.locator(componentTagName)
		await expect(component).not.toHaveAttribute('data-tui-state', 'ready')
		await expect(component).toBeVisible()
	})
})
