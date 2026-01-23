import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Dropdown', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/dropdown'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should open and close the dropdown with keyboard', async ({ page }) => {
		const dropdownWrapper = page.locator('tui-dropdown')
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(dropdown).toBeVisible()

		await page.keyboard.press('Escape')
		await expect(dropdown).toBeHidden()
	})

	test('should close the dropdown when clicking outside the dropdown area', async ({ page }) => {
		const dropdownWrapper = page.locator('tui-dropdown')
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')

		await trigger.click()
		await expect(dropdown).toBeVisible()

		await page.mouse.click(1, 1)
		await expect(dropdown).toBeHidden()
	})

	test('should add open data attribute to trigger', async ({ page }) => {
		const dropdownWrapper = page.locator('tui-dropdown')
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')

		await trigger.click()
		await expect(dropdown).toBeVisible()
		const openAttribute = await trigger.getAttribute('data-tui-open')
		expect(openAttribute).toBe('')
	})

	test('should trap focus', async ({ page }) => {
		const dropdownWrapper = page.locator('tui-dropdown')
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')
		const firstDropdownButton = dropdown.locator('button').first()
		const lastDropdownButton = dropdown.locator('button').last()

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(dropdown).toBeVisible()

		await expect(firstDropdownButton).toBeFocused()
		await page.keyboard.down('Shift')
		await page.keyboard.press('Tab')
		await page.keyboard.up('Shift')
		await expect(lastDropdownButton).toBeFocused()

		await page.keyboard.press('Tab')
		await expect(firstDropdownButton).toBeFocused()
	})
})
