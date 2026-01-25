import { Component, NativeEvent, tuiAttribute } from '../constants'
import { emitEvent } from '../emitEvent'

customElements.define(
	Component.ExclusiveCheckbox.Name,
	class extends HTMLElement {
		private targetName: string | null = null
		private exclusiveCheckbox: HTMLInputElement | null = null
		private checkboxes: Array<HTMLInputElement> | null = null

		connectedCallback() {
			this.targetName = this.getAttribute(tuiAttribute('target-name'))
			this.exclusiveCheckbox = this.querySelector('input')

			if (!this.targetName || !this.exclusiveCheckbox || !this.parentElement) {
				return
			}

			this.checkboxes = [
				...this.parentElement.querySelectorAll<HTMLInputElement>(
					`[name="${this.targetName}"]`,
				),
			]
			if (this.checkboxes.length === 0) return

			this.addEvents()
		}

		disconnectedCallback() {
			if (this.exclusiveCheckbox) {
				this.exclusiveCheckbox.removeEventListener(
					NativeEvent.Change,
					this.handleExclusiveChange,
				)
			}
			if (this.checkboxes) {
				for (const checkbox of this.checkboxes) {
					checkbox.removeEventListener(NativeEvent.Change, this.handleCheckboxChange)
				}
			}
		}

		private addEvents() {
			if (
				!this.exclusiveCheckbox ||
				!this.targetName ||
				!this.parentElement ||
				!this.checkboxes
			)
				return

			this.exclusiveCheckbox.addEventListener('change', this.handleExclusiveChange)
			for (const checkbox of this.checkboxes) {
				if (checkbox.disabled) continue
				checkbox.addEventListener(NativeEvent.Change, this.handleCheckboxChange)
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
			emitEvent(
				Component.ExclusiveCheckbox.Name,
				Component.ExclusiveCheckbox.Event.Toggle,
				this.exclusiveCheckbox,
			)
		}

		private handleCheckboxChange = () => {
			if (!this.exclusiveCheckbox || !this.checkboxes || this.checkboxes.length === 0) return
			if (!this.exclusiveCheckbox.checked) return

			const someChecked = this.checkboxes.some(
				(checkbox) => !checkbox.disabled && checkbox.checked,
			)
			this.exclusiveCheckbox.checked = !someChecked
			emitEvent(
				Component.ExclusiveCheckbox.Name,
				Component.ExclusiveCheckbox.Event.Toggle,
				this.exclusiveCheckbox,
			)
		}
	},
)
