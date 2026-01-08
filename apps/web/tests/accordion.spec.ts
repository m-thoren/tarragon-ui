import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildUrl } from './utils'

test.describe('Accordion', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(buildUrl('/accordion'))
	})

	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('should toggle multiple accordion items on header click', async ({ page }) => {
		const firstAccordion = page.getByTestId('multi-accordion-1')
		const secondAccordion = page.getByTestId('multi-accordion-2')
		const thirdAccordion = page.getByTestId('multi-accordion-3')

		await firstAccordion.locator('summary').click()
		await expect(firstAccordion.locator('.accordion-content')).toBeVisible()

		await secondAccordion.locator('summary').click()
		await expect(secondAccordion.locator('.accordion-content')).toBeVisible()

		await thirdAccordion.locator('summary').click()
		await expect(thirdAccordion.locator('.accordion-content')).toBeVisible()

		await firstAccordion.locator('summary').click()
		await expect(firstAccordion.locator('.accordion-content')).toBeHidden()

		await secondAccordion.locator('summary').click()
		await expect(secondAccordion.locator('.accordion-content')).toBeHidden()

		await thirdAccordion.locator('summary').click()
		await expect(thirdAccordion.locator('.accordion-content')).toBeHidden()
	})

	test('should toggle single accordion item on header click', async ({ page }) => {
		await page.getByTestId('single-accordion').locator('summary').click()
		await expect(
			page.getByTestId('single-accordion').locator('.accordion-content'),
		).toBeVisible()

		await page.getByTestId('single-accordion').locator('summary').click()
		await expect(
			page.getByTestId('single-accordion').locator('.accordion-content'),
		).toBeHidden()
	})
})
