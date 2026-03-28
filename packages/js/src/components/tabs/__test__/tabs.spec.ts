import { expect, test } from '@playwright/test'

const componentName = 'tui-tabs'
const testPath = '/src/components/tabs/__test__'

test.describe(componentName, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${testPath}/default.html`)
	})

	test('should have correct aria attributes', async ({ page }) => {
		const tabElement = page.locator(componentName)
		const tabsTitle = tabElement.locator('h2')
		const tabList = tabElement.getByRole('tablist')
		const tabListItems = await tabList.getByRole('presentation').all()
		const tabs = await tabList.getByRole('tab').all()
		const tabPanels = await tabElement.locator('.tabpanel').all()

		await expect(tabElement).toHaveAttribute('data-tui-ready', '')
		expect(await tabList.getAttribute('aria-labelledby')).toBe(
			await tabsTitle.getAttribute('id'),
		)
		expect(await tabList.getAttribute('role')).toBe('tablist')

		expect(tabListItems.length).toBe(3)
		expect(tabs.length).toBe(3)
		expect(tabPanels.length).toBe(3)

		for (let index = 0; index < tabs.length; index++) {
			const tab = tabs[index]
			const tabPanel = tabPanels[index]

			if (!tab || !tabPanel) {
				continue
			}

			expect(await tab.getAttribute('id')).toBe(`tab-${index + 1}`)
			expect(await tab.getAttribute('role')).toBe('tab')
			expect(await tab.getAttribute('aria-controls')).toBe(await tabPanel.getAttribute('id'))
			expect(await tab.getAttribute('aria-selected')).toBe(index === 0 ? 'true' : 'false')
			expect(await tab.getAttribute('tabindex')).toBe(index === 0 ? null : '-1')

			expect(await tabPanel.getAttribute('aria-labelledby')).toBe(
				await tab.getAttribute('id'),
			)
			expect(await tabPanel.getAttribute('id')).toBe(`tabpanel-${index + 1}`)
			expect(await tabPanel.getAttribute('role')).toBe('tabpanel')
			expect(await tabPanel.getAttribute('tabindex')).toBe(index === 1 ? null : '0')
			expect(await tabPanel.getAttribute('hidden')).toBe(index === 0 ? null : '')
		}
	})

	test('should change tab with arrow keys', async ({ page }) => {
		const tabElement = page.locator(componentName)
		const tabList = tabElement.getByRole('tablist')
		const tab1 = tabList.getByRole('tab').first()
		const tab2 = tabList.getByRole('tab').nth(1)
		const tab3 = tabList.getByRole('tab').last()
		const tabPanel1 = tabElement.locator('.tabpanel').first()
		const tabPanel2 = tabElement.locator('.tabpanel').nth(1)
		const tabPanel3 = tabElement.locator('.tabpanel').last()

		await tab1.click()
		await expect(tab1).toBeFocused()
		expect(await tab1.getAttribute('aria-selected')).toBe('true')
		expect(await tab2.getAttribute('aria-selected')).toBe('false')
		expect(await tab3.getAttribute('aria-selected')).toBe('false')
		await expect(tabPanel1).toBeVisible()
		await expect(tabPanel2).toBeHidden()
		await expect(tabPanel3).toBeHidden()

		await page.keyboard.press('ArrowLeft')
		await expect(tab3).toBeFocused()
		expect(await tab1.getAttribute('aria-selected')).toBe('false')
		expect(await tab2.getAttribute('aria-selected')).toBe('false')
		expect(await tab3.getAttribute('aria-selected')).toBe('true')
		await expect(tabPanel1).toBeHidden()
		await expect(tabPanel2).toBeHidden()
		await expect(tabPanel3).toBeVisible()

		await page.keyboard.press('ArrowRight')
		expect(await tab1.getAttribute('aria-selected')).toBe('true')
		expect(await tab2.getAttribute('aria-selected')).toBe('false')
		expect(await tab3.getAttribute('aria-selected')).toBe('false')
		await expect(tabPanel1).toBeVisible()
		await expect(tabPanel2).toBeHidden()
		await expect(tabPanel3).toBeHidden()
	})

	test('should move with Home and End keys', async ({ page }) => {
		const tabElement = page.locator(componentName)
		const tabList = tabElement.getByRole('tablist')
		const tab1 = tabList.getByRole('tab').first()
		const tab2 = tabList.getByRole('tab').nth(1)
		const tab3 = tabList.getByRole('tab').last()
		const tabPanel1 = tabElement.locator('.tabpanel').first()
		const tabPanel2 = tabElement.locator('.tabpanel').nth(1)
		const tabPanel3 = tabElement.locator('.tabpanel').last()

		await tab1.click()
		await expect(tab1).toBeFocused()
		expect(await tab1.getAttribute('aria-selected')).toBe('true')
		expect(await tab2.getAttribute('aria-selected')).toBe('false')
		expect(await tab3.getAttribute('aria-selected')).toBe('false')
		await expect(tabPanel1).toBeVisible()
		await expect(tabPanel2).toBeHidden()
		await expect(tabPanel3).toBeHidden()

		await page.keyboard.press('End')
		await expect(tab3).toBeFocused()
		expect(await tab1.getAttribute('aria-selected')).toBe('false')
		expect(await tab2.getAttribute('aria-selected')).toBe('false')
		expect(await tab3.getAttribute('aria-selected')).toBe('true')
		await expect(tabPanel1).toBeHidden()
		await expect(tabPanel2).toBeHidden()
		await expect(tabPanel3).toBeVisible()

		await page.keyboard.press('Home')
		expect(await tab1.getAttribute('aria-selected')).toBe('true')
		expect(await tab2.getAttribute('aria-selected')).toBe('false')
		expect(await tab3.getAttribute('aria-selected')).toBe('false')
		await expect(tabPanel1).toBeVisible()
		await expect(tabPanel2).toBeHidden()
		await expect(tabPanel3).toBeHidden()
	})

	test('should focus tabpanel if not containing focusable element', async ({ page }) => {
		const tabElement = page.locator(componentName)
		const tabList = tabElement.getByRole('tablist')
		const tab1 = tabList.getByRole('tab').first()
		const tab2 = tabList.getByRole('tab').nth(1)
		const tabPanel1 = tabElement.locator('.tabpanel').first()
		const tabPanel2 = tabElement.locator('.tabpanel').nth(1)
		const tabPanel2Button = tabPanel2.getByRole('button')

		await tab1.click()
		await expect(tab1).toBeFocused()
		await expect(tabPanel1).toBeVisible()
		await page.keyboard.press('Tab')
		await expect(tabPanel1).toBeFocused()

		await tab2.click()
		await expect(tab2).toBeFocused()
		await expect(tabPanel2).toBeVisible()
		await page.keyboard.press('Tab')
		await expect(tabPanel2Button).toBeFocused()
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
