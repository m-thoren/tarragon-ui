import { Component, NativeEvent, fail, ok, tuiAttribute } from '@/utils/constants'
import { ComponentBase } from '../component-base'

class TUISelectAll extends ComponentBase {
	static readonly componentName = Component.SelectAll.Name

	private targetName: string | null = null
	private selectAllCheckbox: HTMLInputElement | null = null
	private checkboxes: Array<HTMLInputElement> | null = null
	private checkboxClass: string | null = null

	protected setup() {
		this.targetName = this.getAttribute(tuiAttribute('target-name'))
		this.selectAllCheckbox = this.querySelector('input')

		if (!this.targetName || !this.selectAllCheckbox || !this.parentElement) {
			return fail('Missing required attributes or parent element')
		}

		this.checkboxes = [
			...this.parentElement.querySelectorAll<HTMLInputElement>(`[name="${this.targetName}"]`),
		]
		if (this.checkboxes.length === 0)
			return fail('No checkboxes found with the specified target name')

		this.checkboxClass = this.getAttribute(tuiAttribute('checkbox-class'))

		this.addEvents()
		return ok()
	}

	private addEvents() {
		if (
			!this.selectAllCheckbox ||
			!this.targetName ||
			!this.parentElement ||
			!this.checkboxes
		) {
			return
		}

		this.listeners.add(this.selectAllCheckbox, NativeEvent.Change, this.handleSelectAllChange)
		for (const checkbox of this.checkboxes) {
			if (checkbox.disabled) continue
			if (this.checkboxClass) {
				checkbox.parentElement?.classList.add(this.checkboxClass)
			}
			this.listeners.add(checkbox, NativeEvent.Change, this.handleCheckboxChange)
		}
	}

	private handleSelectAllChange = () => {
		if (!this.selectAllCheckbox || !this.checkboxes || this.checkboxes.length === 0) return
		const isChecked = this.selectAllCheckbox.checked

		for (const checkbox of this.checkboxes) {
			if (checkbox.disabled) continue
			checkbox.checked = isChecked
		}
		this.selectAllCheckbox.indeterminate = false
		this.emit(Component.SelectAll.Event.Toggle)
	}

	private handleCheckboxChange = () => {
		if (!this.selectAllCheckbox || !this.checkboxes || this.checkboxes.length === 0) return

		const checkedCount = this.checkboxes.filter(
			(checkbox) => !checkbox.disabled && checkbox.checked,
		).length
		const totalCheckBoxes = this.checkboxes.length
		const allChecked = checkedCount === totalCheckBoxes
		const noneChecked = checkedCount === 0

		this.selectAllCheckbox.indeterminate = !allChecked && !noneChecked
		this.selectAllCheckbox.checked = allChecked
		this.emit(Component.SelectAll.Event.Toggle)
	}
}

TUISelectAll.define()
