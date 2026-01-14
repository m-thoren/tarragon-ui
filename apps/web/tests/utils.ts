import { type Page, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE_URL = 'tarragon-ui'
export const buildUrl = (path: string) => `${BASE_URL}${path}`

export const testPageAccessibility = async (page: Page) => {
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
	expect(accessibilityScanResults.violations).toEqual([])

	const themeButton = page.getByRole('button', { name: 'Toggle theme' })
	await themeButton.click()

	await expect(async () => {
		const darkModeScanResults = await new AxeBuilder({ page }).analyze()
		expect(darkModeScanResults.violations).toEqual([])
	}).toPass()
}
