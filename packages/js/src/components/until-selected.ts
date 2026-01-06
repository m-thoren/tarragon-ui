import { Component, NativeEvent } from '../constants'

customElements.define(
	Component.UntilSelected.Name,
	class extends HTMLElement {
		private target: string | null = null
		private targetElement: HTMLInputElement | null = null
		private focusTargetElement: HTMLElement | null = null
		private events: Array<string> | null = null
		private hideWhenChecked = false

		connectedCallback() {
			this.target = this.getAttribute('target')
			if (!this.target) return

			try {
				const element = document.getElementById(this.target)
				if (!(element instanceof HTMLInputElement)) {
					console.warn('Element was not found')
					return
				}
				this.targetElement = element
			} catch (error) {
				console.warn('Could not select element', error)
			}
			if (!this.targetElement) return

			const focusTarget = this.getAttribute('focus-target')
			if (focusTarget) {
				try {
					this.focusTargetElement = document.getElementById(focusTarget)
				} catch (error) {
					console.warn('Could not select focus target', error)
				}
			}

			const eventString = this.getAttribute('events')
			if (eventString) {
				this.events = eventString.split(',').map((event) => event.trim())
			}

			this.hideWhenChecked = this.getAttribute('hide-when-checked') === 'true'

			const isChecked = this.targetElement.checked
			this.toggleAttribute('hidden', this.hideWhenChecked ? isChecked : !isChecked)

			this.addEvents()
		}

		disconnectedCallback() {
			document.removeEventListener(
				`${Component.ExclusiveCheckbox.Name}:${Component.ExclusiveCheckbox.Event.Toggle}`,
				this.handleTargetChange,
			)
			document.removeEventListener(
				`${Component.SelectAll.Name}:${Component.ExclusiveCheckbox.Event.Toggle}`,
				this.handleTargetChange,
			)

			if (this.targetElement) {
				this.targetElement.removeEventListener(NativeEvent.Change, this.handleTargetChange)
			}

			if (this.events && this.events.length > 0) {
				for (const event of this.events) {
					document.removeEventListener(event, this.handleTargetChange)
				}
			}
		}

		private addEvents() {
			document.addEventListener(
				`${Component.ExclusiveCheckbox.Name}:${Component.ExclusiveCheckbox.Event.Toggle}`,
				this.handleTargetChange,
			)
			document.addEventListener(
				`${Component.SelectAll.Name}:${Component.ExclusiveCheckbox.Event.Toggle}`,
				this.handleTargetChange,
			)

			if (this.targetElement) {
				this.targetElement.addEventListener(NativeEvent.Change, this.handleTargetChange)
			}

			if (this.events && this.events.length > 0) {
				for (const event of this.events) {
					document.addEventListener(event, this.handleTargetChange)
				}
			}
		}

		private handleTargetChange = () => {
			if (!this.targetElement) return

			const shouldHideElement = this.hideWhenChecked
				? this.targetElement.checked
				: !this.targetElement.checked

			this.toggleAttribute('hidden', shouldHideElement)
			if (shouldHideElement && this.focusTargetElement && this.matches(':focus-within')) {
				this.focusTargetElement.focus()
			}
		}
	},
)
