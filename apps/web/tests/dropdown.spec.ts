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

		await expect(async () => {
			const openAttribute = await dropdown.getAttribute('data-tui-state')
			expect(openAttribute).toBe('closed')
		}).toPass()

		await trigger.click()
		await expect(dropdown).toBeVisible()

		await expect(async () => {
			const openAttribute = await dropdown.getAttribute('data-tui-state')
			expect(openAttribute).toBe('open')
		}).toPass()
	})

	test('should close with tab', async ({ page }) => {
		const dropdownWrapper = page.locator('tui-dropdown')
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')
		const firstDropdownButton = dropdown.locator('button').first()

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(dropdown).toBeVisible()

		await expect(firstDropdownButton).toBeFocused()
		await page.keyboard.down('Shift')
		await page.keyboard.press('Tab')
		await page.keyboard.up('Shift')
		await expect(dropdown).toBeHidden()

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(dropdown).toBeVisible()
		await expect(firstDropdownButton).toBeFocused()
		await page.keyboard.press('Tab')
		await expect(dropdown).toBeHidden()
	})

	test('should navigate down with ArrowDown key', async ({ page }) => {
		const dropdownWrapper = page.locator('tui-dropdown')
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')

		const option1 = dropdown.locator('a[href], button:not([disabled])').first()
		const option2 = dropdown.locator('a[href], button:not([disabled])').nth(1)
		const option3 = dropdown.locator('a[href], button:not([disabled])').nth(2)

		await trigger.focus()
		await page.keyboard.press('ArrowDown')
		await expect(dropdown).toBeVisible()

		await expect(option1).toBeFocused()

		await page.keyboard.press('ArrowDown')
		await expect(option2).toBeFocused()

		await page.keyboard.press('ArrowDown')
		await expect(option3).toBeFocused()

		await page.keyboard.press('ArrowDown')
		await expect(option1).toBeFocused()
	})

	test('should navigate up with ArrowUp key', async ({ page }) => {
		const dropdownWrapper = page.locator('tui-dropdown')
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')

		const option1 = dropdown.locator('a[href], button:not([disabled])').first()
		const option2 = dropdown.locator('a[href], button:not([disabled])').nth(1)
		const option3 = dropdown.locator('a[href], button:not([disabled])').nth(2)

		await trigger.focus()
		await page.keyboard.press('ArrowUp')
		await expect(dropdown).toBeVisible()

		await expect(option3).toBeFocused()

		await page.keyboard.press('ArrowUp')
		await expect(option2).toBeFocused()

		await page.keyboard.press('ArrowUp')
		await expect(option1).toBeFocused()

		await page.keyboard.press('ArrowUp')
		await expect(option3).toBeFocused()
	})
})
