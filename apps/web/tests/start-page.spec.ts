import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Start Page', () => {
	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await page.goto(buildUrl('/'))

		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})
})
