import { Component, NativeEvent, fail, hiddenAttribute, ok, tuiAttribute } from '@/utils/constants'
import { ComponentBase } from '../component-base'

class TUIUntilSelected extends ComponentBase {
	static readonly componentName = Component.UntilSelected.Name
	private target: string | null = null
	private targetElement: HTMLInputElement | null = null
	private focusTargetElement: HTMLElement | null = null
	private events: Array<string> | null = null
	private showWhen: 'checked' | 'not-checked' = 'checked'

	setup() {
		this.target = this.getAttribute(tuiAttribute('target'))
		if (!this.target) return fail('Missing target attribute')

		try {
			const element = document.getElementById(this.target)
			if (!(element instanceof HTMLInputElement)) {
				return fail('Element was not found')
			}
			this.targetElement = element
			this.focusTargetElement = this.targetElement
		} catch (error) {
			return fail('Target element was not found', { error })
		}

		const focusTarget = this.getAttribute(tuiAttribute('focus-target'))
		if (focusTarget) {
			try {
				this.focusTargetElement = document.getElementById(focusTarget)
			} catch (error) {
				console.warn('Could not select focus target', error)
			}
		}

		const eventString = this.getAttribute(tuiAttribute('events'))
		if (eventString) {
			this.events = eventString.split(',').map((event) => event.trim())
		}

		this.showWhen =
			this.getAttribute(tuiAttribute('show-when')) === 'not-checked'
				? 'not-checked'
				: 'checked'

		const isChecked = this.targetElement.checked
		this.toggleAttribute(hiddenAttribute, this.showWhen === 'checked' ? !isChecked : isChecked)

		this.addEvents()
		return ok()
	}

	private addEvents() {
		this.listeners.add(
			document,
			Component.ExclusiveCheckbox.Event.Toggle,
			this.handleTargetChange,
		)
		this.listeners.add(document, Component.SelectAll.Event.Toggle, this.handleTargetChange)

		if (this.targetElement) {
			this.listeners.add(this.targetElement, NativeEvent.Change, this.handleTargetChange)
		}

		if (this.events && this.events.length > 0) {
			for (const event of this.events) {
				this.listeners.add(document, event, this.handleTargetChange)
			}
		}
	}

	private handleTargetChange = () => {
		if (!this.targetElement) return

		const shouldHideElement =
			this.showWhen === 'checked' ? !this.targetElement.checked : this.targetElement.checked

		this.toggleAttribute(hiddenAttribute, shouldHideElement)
		if (shouldHideElement && this.focusTargetElement && this.matches(':focus-within')) {
			this.focusTargetElement.focus()
		}
	}
}

TUIUntilSelected.define()
