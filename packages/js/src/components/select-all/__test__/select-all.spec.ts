import test, { expect } from '@playwright/test'

const componentName = 'tui-select-all'
const testPath = '/src/components/select-all/__test__'

test.describe(componentName, () => {
	const selectAllCheckboxId = 'checkbox-select-all-1'

	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)
	})

	test('select-all is visible', async ({ page }) => {
		const selectAll = page.getByRole('group').locator(componentName)
		await expect(selectAll).toBeVisible()
	})

	test('select-all should initialize', async ({ page }) => {
		const selectAll = page.getByRole('group').locator(componentName)
		await expect(selectAll).toHaveAttribute('data-tui-ready', '')
	})

	test('select-all toggles all checkboxes', async ({ page }) => {
		const wrapper = page.getByRole('group')

		const selectAllCheckbox = wrapper.locator(`#${selectAllCheckboxId}`)
		const checkboxes = wrapper.locator('input[name="select-all"]')

		// Initially, no checkboxes should be checked
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await expect(checkboxes.nth(i)).not.toBeChecked()
		}

		// Click the select-all checkbox
		await selectAllCheckbox.click()

		// Now, all checkboxes should be checked
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await expect(checkboxes.nth(i)).toBeChecked()
		}

		// Click the select-all checkbox again to deselect
		await selectAllCheckbox.click()

		// Now, no checkboxes should be checked again
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await expect(checkboxes.nth(i)).not.toBeChecked()
		}
	})

	test('select-all toggles all checkboxes when indeterminate', async ({ page }) => {
		const wrapper = page.getByRole('group')

		const selectAllCheckbox = wrapper.locator(`#${selectAllCheckboxId}`)
		const checkboxes = wrapper.locator('input[name="select-all"]')
		const firstCheckbox = checkboxes.first()

		await firstCheckbox.check()
		await expect(firstCheckbox).toBeChecked()
		expect(await selectAllCheckbox.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(
			true,
		)

		// Initially, only the first checkbox should be checked
		for (let i = 1; i < (await checkboxes.count()); i++) {
			await expect(checkboxes.nth(i)).not.toBeChecked()
		}

		// Click the select-all checkbox
		await selectAllCheckbox.click()

		// Now, all checkboxes should be checked
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await expect(checkboxes.nth(i)).toBeChecked()
		}

		// Click the select-all checkbox again to deselect
		await selectAllCheckbox.click()

		// Now, no checkboxes should be checked again
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await expect(checkboxes.nth(i)).not.toBeChecked()
		}
	})

	test('select-all shows indeterminate state', async ({ page }) => {
		const wrapper = page.getByRole('group')

		const selectAllCheckbox = wrapper.locator(`#${selectAllCheckboxId}`)
		const firstCheckbox = wrapper.locator('input[name="select-all"]').first()

		// Check the first checkbox
		await firstCheckbox.check()

		// The select-all checkbox should be in indeterminate state
		expect(await selectAllCheckbox.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(
			true,
		)

		// Uncheck the first checkbox
		await firstCheckbox.uncheck()

		// The select-all checkbox should not be in indeterminate state
		expect(await selectAllCheckbox.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(
			false,
		)
	})

	test('select-all updates when individual checkboxes are toggled', async ({ page }) => {
		const wrapper = page.getByRole('group')

		const selectAllCheckbox = wrapper.locator(`#${selectAllCheckboxId}`)
		const checkboxes = wrapper.locator('input[name="select-all"]')

		// Check all individual checkboxes
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await checkboxes.nth(i).check()
		}

		// The select-all checkbox should be checked
		await expect(selectAllCheckbox).toBeChecked()

		// Uncheck one individual checkbox
		await checkboxes.nth(0).uncheck()

		// The select-all checkbox should be in indeterminate state
		expect(await selectAllCheckbox.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(
			true,
		)

		// Uncheck all individual checkboxes
		for (let i = 0; i < (await checkboxes.count()); i++) {
			await checkboxes.nth(i).uncheck()
		}

		// The select-all checkbox should not be checked
		await expect(selectAllCheckbox).not.toBeChecked()
	})

	test('checkboxes should have padding-inline-start-lg class', async ({ page }) => {
		const wrapper = page.getByRole('group')

		const checkboxes = wrapper.locator('input[name="select-all"]')

		for (let i = 0; i < (await checkboxes.count()); i++) {
			const parent = checkboxes.nth(i).locator('..')
			await expect(parent).toHaveClass(/padding-inline-start-lg/)
		}
	})
})

test.describe(`${componentName} - no-js`, () => {
	test('should not initialize', async ({ page }) => {
		await page.goto(`${testPath}/no-js.html`)

		const component = page.locator(componentName)
		await expect(component).not.toHaveAttribute('data-tui-ready')
		await expect(component).toBeHidden()
	})
})
