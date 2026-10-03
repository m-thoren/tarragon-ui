import { Component, NativeEvent, fail, ok, tuiAttribute } from '@/utils/constants'
import { ComponentBase } from '../component-base'

class TUIExclusiveCheckbox extends ComponentBase {
	static readonly componentName = Component.ExclusiveCheckbox.Name

	private targetName: string | null = null
	private exclusiveCheckbox: HTMLInputElement | null = null
	private checkboxes: Array<HTMLInputElement> | null = null

	protected setup() {
		this.targetName = this.getAttribute(tuiAttribute('target-name'))
		this.exclusiveCheckbox = this.querySelector('input')

		if (!this.targetName || !this.exclusiveCheckbox || !this.parentElement) {
			return fail('Missing required attributes or elements')
		}

		this.checkboxes = [
			...this.parentElement.querySelectorAll<HTMLInputElement>(`[name="${this.targetName}"]`),
		]
		if (this.checkboxes.length === 0) {
			return fail('No checkboxes found with the specified target name')
		}
		this.addEvents()
		return ok()
	}

	private addEvents() {
		if (
			!this.exclusiveCheckbox ||
			!this.targetName ||
			!this.parentElement ||
			!this.checkboxes
		) {
			return
		}

		this.listeners.add(this.exclusiveCheckbox, NativeEvent.Change, this.handleExclusiveChange)
		for (const checkbox of this.checkboxes) {
			if (checkbox.disabled) continue
			this.listeners.add(checkbox, NativeEvent.Change, this.handleCheckboxChange)
		}
	}

	private handleExclusiveChange = () => {
		if (!this.exclusiveCheckbox || !this.checkboxes || this.checkboxes.length === 0) return
		const isChecked = this.exclusiveCheckbox.checked

		for (const checkbox of this.checkboxes) {
			if (checkbox.disabled) continue
			if (!isChecked) continue
			checkbox.checked = false
		}
		this.exclusiveCheckbox.indeterminate = false
		this.emit(Component.ExclusiveCheckbox.Event.Toggle)
	}

	private handleCheckboxChange = () => {
		if (!this.exclusiveCheckbox || !this.checkboxes || this.checkboxes.length === 0) return
		if (!this.exclusiveCheckbox.checked) return

		const someChecked = this.checkboxes.some(
			(checkbox) => !checkbox.disabled && checkbox.checked,
		)
		this.exclusiveCheckbox.checked = !someChecked
		this.emit(Component.ExclusiveCheckbox.Event.Toggle)
	}
}

TUIExclusiveCheckbox.define()
