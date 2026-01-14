import { buildUrl, testPageAccessibility } from './utils'
import { expect, test } from '@playwright/test'

test.describe('Drawer', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/drawer'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('should open and close the drawer with keyboard', async ({ page }) => {
		const drawerWrapper = page.getByTestId('default-drawer')
		const openDrawerButton = drawerWrapper.getByRole('button', { name: 'Open drawer' })
		const drawer = drawerWrapper.locator('dialog')

		await openDrawerButton.focus()
		await page.keyboard.press('Enter')
		await expect(drawer).toBeVisible()

		await page.keyboard.press('Tab')
		await page.keyboard.press('Enter')
		await expect(drawer).toBeHidden()

		await openDrawerButton.focus()
		await page.keyboard.press('Enter')
		await expect(drawer).toBeVisible()

		await page.keyboard.press('Enter')
		await expect(drawer).toBeHidden()
	})

	test('should open and close the drawer with mouse', async ({ page }) => {
		const drawerWrapper = page.getByTestId('default-drawer')
		const openDrawerButton = drawerWrapper.getByRole('button', { name: 'Open drawer' })
		const drawer = drawerWrapper.locator('dialog')

		await openDrawerButton.click()
		await expect(drawer).toBeVisible()

		const closeButton = drawer.getByRole('button', { name: 'Close', exact: true })
		await closeButton.click()
		await expect(drawer).toBeHidden()

		await openDrawerButton.click()
		await expect(drawer).toBeVisible()

		const xButton = drawer.getByRole('button', { name: 'Close drawer' })
		await xButton.click()
		await expect(drawer).toBeHidden()

		await openDrawerButton.click()
		await expect(drawer).toBeVisible()

		await page.mouse.click(1, 1)
		await expect(drawer).toBeVisible()
	})

	test('should close the drawer when clicking outside the drawer area', async ({ page }) => {
		const drawerWrapper = page.getByTestId('light-dismiss-drawer')
		const openDrawerButton = drawerWrapper.getByRole('button', { name: 'Open drawer' })
		const drawer = drawerWrapper.locator('dialog')

		await openDrawerButton.click()
		await expect(drawer).toBeVisible()

		await page.mouse.click(1, 1)
		await expect(drawer).toBeHidden()
	})
})
