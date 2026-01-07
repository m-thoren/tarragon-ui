import test, { type Locator, type Page, expect } from '@playwright/test'

test.describe('Dropdown', () => {
	const createDropdown = (root: Locator) => {
		const trigger = root.getByTestId('dropdown-trigger')
		const list = root.getByTestId('dropdown-list')
		const listItem = list.getByTestId('dropdown-list-item')
		const action = list.getByTestId('dropdown-action')
		return {
			trigger,
			root,
			list,
			listItem,
			action,
		}
	}

	const defaultDropdown = (page: Page) => createDropdown(page.locator('tui-dropdown'))

	test.beforeEach(async ({ page }) => {
		await page.goto('/tarragon-ui/dropdown')
	})

	test('dropdowns are visible', async ({ page }) => {
		const dropdowns = [defaultDropdown(page)]
		for (const dropdown of dropdowns) {
			await expect(dropdown.root).toBeVisible()
		}
	})

	test('dropdowns should open and close using clicks', async ({ page }) => {
		const dropdowns = [defaultDropdown(page)]
		for (const dropdown of dropdowns) {
			await dropdown.trigger.click()
			await expect(dropdown.list).toBeVisible()
			await dropdown.trigger.click()
			await expect(dropdown.list).toBeHidden()

			// Try twice
			await dropdown.trigger.click()
			await expect(dropdown.list).toBeVisible()
			await dropdown.trigger.click()
			await expect(dropdown.list).toBeHidden()
		}
	})

	test('dropdowns should open and close using keyboard', async ({ page }) => {
		const dropdowns = [defaultDropdown(page)]
		for (const dropdown of dropdowns) {
			await dropdown.trigger.focus()
			await page.keyboard.press('Enter')
			await expect(dropdown.list).toBeVisible()
			await page.keyboard.press('Escape')
			await expect(dropdown.list).toBeHidden()

			// Try twice
			await dropdown.trigger.focus()
			await page.keyboard.press('Enter')
			await expect(dropdown.list).toBeVisible()
			await page.keyboard.press('Escape')
			await expect(dropdown.list).toBeHidden()
		}
	})

	test('dropdowns should trap focus', async ({ page }) => {
		const dropdowns = [defaultDropdown(page)]
		for (const dropdown of dropdowns) {
			await dropdown.trigger.focus()
			await page.keyboard.press('Enter')
			await expect(dropdown.list).toBeVisible()
			await expect(dropdown.action.first()).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(dropdown.action.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(dropdown.action.last()).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(dropdown.action.first()).toBeFocused()

			await page.keyboard.press('ArrowUp')
			await expect(dropdown.action.last()).toBeFocused()
			await page.keyboard.press('ArrowRight')
			await expect(dropdown.action.first()).toBeFocused()
			await page.keyboard.press('ArrowLeft')
			await expect(dropdown.action.last()).toBeFocused()

			await page.keyboard.press('Tab')
			await expect(dropdown.action.first()).toBeFocused()
			await page.keyboard.press('Shift+Tab')
			await expect(dropdown.action.last()).toBeFocused()
		}
	})
})
