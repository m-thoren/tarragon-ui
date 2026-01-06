import { Component, NativeEvent } from '../constants'
import { emitEvent } from '../emitEvent'

customElements.define(
	Component.SelectAll.Name,
	class extends HTMLElement {
		private targetName: string | null = null
		private selectAllCheckbox: HTMLInputElement | null = null
		private checkboxes: Array<HTMLInputElement> | null = null

		connectedCallback() {
			this.targetName = this.getAttribute('target-name')
			this.selectAllCheckbox = this.querySelector('input')

			if (!this.targetName || !this.selectAllCheckbox || !this.parentElement) {
				return
			}

			this.checkboxes = [
				...this.parentElement.querySelectorAll<HTMLInputElement>(
					`[name="${this.targetName}"]`,
				),
			]
			if (this.checkboxes.length === 0) return

			this.ready()
			this.addEvents()
		}

		disconnectedCallback() {
			if (this.selectAllCheckbox) {
				this.selectAllCheckbox.removeEventListener(
					NativeEvent.Change,
					this.handleSelectAllChange,
				)
			}
			if (this.checkboxes) {
				for (const checkbox of this.checkboxes) {
					checkbox.removeEventListener(NativeEvent.Change, this.handleCheckboxChange)
				}
			}
		}

		private ready() {
			this.setAttribute('data-state', 'ready')
		}

		private addEvents() {
			if (
				!this.selectAllCheckbox ||
				!this.targetName ||
				!this.parentElement ||
				!this.checkboxes
			)
				return

			this.selectAllCheckbox.addEventListener('change', this.handleSelectAllChange)
			for (const checkbox of this.checkboxes) {
				if (checkbox.disabled) continue
				checkbox.parentElement?.classList.add('padding-inline-start-lg')
				checkbox.addEventListener(NativeEvent.Change, this.handleCheckboxChange)
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
			emitEvent(
				Component.SelectAll.Name,
				Component.SelectAll.Event.Toggle,
				this.selectAllCheckbox,
			)
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
			emitEvent(
				Component.SelectAll.Name,
				Component.SelectAll.Event.Toggle,
				this.selectAllCheckbox,
			)
		}
	},
)
