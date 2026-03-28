import test, { expect } from '@playwright/test'

const componentName = 'tui-exclusive-checkbox'
const testPath = '/src/components/exclusive-checkbox/__test__'

test.describe(componentName, () => {
	const exclusiveCheckboxId = 'checkbox-exclusive-4'

	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)
	})

	test('exclusive is visible', async ({ page }) => {
		const exclusive = page.getByRole('group').locator(componentName)
		await expect(exclusive).toBeVisible()
	})

	test('exclusive unchecks all checkboxes', async ({ page }) => {
		const wrapper = page.getByRole('group')

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
		const wrapper = page.getByRole('group')

		const exclusiveCheckbox = wrapper.locator(`#${exclusiveCheckboxId}`)
		const checkboxes = wrapper.locator('input[name="exclusive"]')

		await exclusiveCheckbox.check()

		// Check one individual checkbox
		await checkboxes.nth(0).check()

		await expect(exclusiveCheckbox).not.toBeChecked()
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
