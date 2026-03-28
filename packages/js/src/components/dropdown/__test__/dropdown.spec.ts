import { expect, test } from '@playwright/test'

const componentName = 'tui-dropdown'
const testPath = '/src/components/dropdown/__test__'

test.describe(componentName, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)

		const dropdownWrapper = page.locator(componentName)
		await expect(dropdownWrapper).toHaveAttribute('data-tui-ready')
	})

	test('should open and close the dropdown with keyboard', async ({ page }) => {
		const dropdownWrapper = page.locator(componentName)
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(dropdown).toBeVisible()

		await page.keyboard.press('Escape')
		await expect(dropdown).toBeHidden()
	})

	test('should close the dropdown when clicking outside the dropdown area', async ({ page }) => {
		const dropdownWrapper = page.locator(componentName)
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')

		await trigger.click()
		await expect(dropdown).toBeVisible()

		await page.mouse.click(1, 1)
		await expect(dropdown).toBeHidden()
	})

	test('should add open data attribute to trigger', async ({ page }) => {
		const dropdownWrapper = page.locator(componentName)
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

	// TODO these fail when not using ui for some reason
	test.fixme('should close with tab', async ({ page }) => {
		const dropdownWrapper = page.locator(componentName)
		const trigger = dropdownWrapper.getByRole('button', { name: 'Open Dropdown' })
		const dropdown = dropdownWrapper.locator('[popover]')
		const firstDropdownButton = dropdown.locator('button').first()

		await trigger.focus()
		await page.keyboard.press('Enter')
		await expect(dropdown).toBeVisible()

		await expect(firstDropdownButton).toBeFocused()

		await page.keyboard.press('Tab')
		await expect(async () => {
			const openAttribute = await dropdown.getAttribute('data-tui-state')
			expect(openAttribute).toBe('closed')
		}).toPass()
		await expect(dropdown).toBeHidden()
	})

	test.fixme('should close with shift + tab', async ({ page }) => {
		const dropdownWrapper = page.locator(componentName)
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
		await expect(async () => {
			const openAttribute = await dropdown.getAttribute('data-tui-state')
			expect(openAttribute).toBe('closed')
		}).toPass()
		await expect(dropdown).toBeHidden()
	})

	test.fixme('should navigate down with ArrowDown key', async ({ page }) => {
		const dropdownWrapper = page.locator(componentName)
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

	test.fixme('should navigate up with ArrowUp key', async ({ page }) => {
		const dropdownWrapper = page.locator(componentName)
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

test.describe(`${componentName} - no-js`, () => {
	test('should not initialize', async ({ page }) => {
		await page.goto(`${testPath}/no-js.html`)

		const component = page.locator(componentName)
		await expect(component).not.toHaveAttribute('data-tui-ready')
		await expect(component).toBeVisible()
	})
})
