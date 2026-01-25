import { buildUrl, testPageAccessibility } from './utils'
import test, { expect } from '@playwright/test'

test.describe('Exclusive Checkbox', () => {
	const exclusiveCheckboxId = 'checkbox-exclusive-4'

	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/exclusive-checkbox'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await testPageAccessibility(page)
	})

	test('exclusive is visible', async ({ page }) => {
		const exclusive = page.getByTestId('exclusive-checkbox').locator('tui-exclusive-checkbox')
		await expect(exclusive).toBeVisible()
	})

	test('exclusive unchecks all checkboxes', async ({ page }) => {
		const wrapper = page.getByTestId('exclusive-checkbox')

		const exclusiveCheckbox = wrapper.locator(`#${exclusiveCheckboxId}`)
		const checkboxes = wrapper.locator('input[name="exclusive"]')

		// Initially, all checkboxes should be checked
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await checkboxes.nth(i).check()
			await expect(checkboxes.nth(i)).toBeChecked()
		}

		// Click the exclusive checkbox
		await exclusiveCheckbox.click()

		// Now, all checkboxes should be unchecked
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await expect(checkboxes.nth(i)).not.toBeChecked()
		}
	})

	test('exclusive updates when individual checkboxes are toggled', async ({ page }) => {
		const wrapper = page.getByTestId('exclusive-checkbox')

		const exclusiveCheckbox = wrapper.locator(`#${exclusiveCheckboxId}`)
		const checkboxes = wrapper.locator('input[name="exclusive"]')

		await exclusiveCheckbox.check()

		// Check one individual checkbox
		await checkboxes.nth(0).check()

		await expect(exclusiveCheckbox).not.toBeChecked()
	})
})
