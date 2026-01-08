import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Dialog', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/dialog'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('should open and close the dialog with keyboard', async ({ page }) => {
		const dialogWrapper = page.getByTestId('default-dialog')
		const openDialogButton = dialogWrapper.getByRole('button', { name: 'Open dialog' })
		const dialog = dialogWrapper.locator('dialog')

		await openDialogButton.focus()
		await page.keyboard.press('Enter')
		await expect(dialog).toBeVisible()

		await page.keyboard.press('Tab')
		await page.keyboard.press('Enter')
		await expect(dialog).toBeHidden()

		await openDialogButton.focus()
		await page.keyboard.press('Enter')
		await expect(dialog).toBeVisible()

		await page.keyboard.press('Enter')
		await expect(dialog).toBeHidden()
	})

	test('should open and close the dialog with mouse', async ({ page }) => {
		const dialogWrapper = page.getByTestId('default-dialog')
		const openDialogButton = dialogWrapper.getByRole('button', { name: 'Open dialog' })
		const dialog = dialogWrapper.locator('dialog')

		await openDialogButton.click()
		await expect(dialog).toBeVisible()

		const closeButton = dialog.getByRole('button', { name: 'Close', exact: true })
		await closeButton.click()
		await expect(dialog).toBeHidden()

		await openDialogButton.click()
		await expect(dialog).toBeVisible()

		const xButton = dialog.getByRole('button', { name: 'Close dialog' })
		await xButton.click()
		await expect(dialog).toBeHidden()

		await openDialogButton.click()
		await expect(dialog).toBeVisible()

		await page.mouse.click(1, 1)
		await expect(dialog).toBeVisible()
	})

	test('should close the dialog when clicking outside the dialog area', async ({ page }) => {
		const dialogWrapper = page.getByTestId('light-dismiss-dialog')
		const openDialogButton = dialogWrapper.getByRole('button', { name: 'Open dialog' })
		const dialog = dialogWrapper.locator('dialog')

		await openDialogButton.click()
		await expect(dialog).toBeVisible()

		await page.mouse.click(1, 1)
		await expect(dialog).toBeHidden()
	})

	test('should open and close the full screen dialog with keyboard', async ({ page }) => {
		const dialogWrapper = page.getByTestId('full-screen-dialog')
		const openDialogButton = dialogWrapper.getByRole('button', {
			name: 'Open dialog',
		})
		const dialog = dialogWrapper.locator('dialog')

		await openDialogButton.focus()
		await page.keyboard.press('Enter')
		await expect(dialog).toBeVisible()

		await page.keyboard.press('Enter')
		await expect(dialog).toBeHidden()

		await openDialogButton.focus()
		await page.keyboard.press('Enter')
		await expect(dialog).toBeVisible()

		await page.keyboard.press('Enter')
		await expect(dialog).toBeHidden()
	})

	test('should open and close the full screen dialog with mouse', async ({ page }) => {
		const dialogWrapper = page.getByTestId('full-screen-dialog')
		const openDialogButton = dialogWrapper.getByRole('button', {
			name: 'Open dialog',
		})
		const dialog = dialogWrapper.locator('dialog')

		await openDialogButton.click()
		await expect(dialog).toBeVisible()

		const closeButton = dialog.getByRole('button', { name: 'Close', exact: true })
		await closeButton.click()
		await expect(dialog).toBeHidden()

		await openDialogButton.click()
		await expect(dialog).toBeVisible()
	})
})
