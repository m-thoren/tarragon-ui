const SELECTOR_POPOVER = '[popover]'

import { Component, NativeEvent, focusableElementsSelector } from '../constants'

customElements.define(
	Component.Dropdown.Name,
	class extends HTMLElement {
		private popoverElement: HTMLDivElement | null = null
		private triggers: Array<HTMLButtonElement> = []

		connectedCallback() {
			const popover = this.querySelector<HTMLDivElement>(SELECTOR_POPOVER)
			if (!popover) {
				console.error(
					`${Component.Dropdown.Name} component: Missing element with selector "${SELECTOR_POPOVER}"`,
				)
				return
			}
			this.popoverElement = popover
			this.popoverElement.addEventListener(NativeEvent.Toggle, this.handleToggle)
			this.popoverElement.addEventListener(NativeEvent.BeforeToggle, this.handleBeforeToggle)

			this.triggers = [
				...document.querySelectorAll<HTMLButtonElement>(
					`[popovertarget="${this.popoverElement.id}"]`,
				),
			]
		}

		disconnectedCallback() {
			this.popoverElement?.removeEventListener(
				NativeEvent.BeforeToggle,
				this.handleBeforeToggle,
			)
			this.popoverElement?.removeEventListener(NativeEvent.KeyDown, this.handlePopoverKeydown)
		}

		private handleBeforeToggle = (event: ToggleEvent): void => {
			if (!this.popoverElement) return
			if (event.newState !== 'open') return
			this.popoverElement.addEventListener(NativeEvent.KeyDown, this.handlePopoverKeydown)
		}

		private handleToggle = (event: ToggleEvent): void => {
			if (event.newState === 'open') {
				this.onPopoverOpen()
				return
			}
			this.onPopoverClose()
		}

		private onPopoverOpen(): void {
			for (const trigger of this.triggers) {
				trigger.setAttribute('data-tui-open', '')
			}

			const focusableElements = this.getFocusableElementsForTrap()
			if (focusableElements.length === 0) return
			const first = focusableElements[0]
			if (!first) return
			first.focus()
		}

		private onPopoverClose(): void {
			for (const trigger of this.triggers) {
				trigger.removeAttribute('data-tui-open')
			}
			this.popoverElement?.removeEventListener(NativeEvent.KeyDown, this.handlePopoverKeydown)
		}

		private getFocusableElementsForTrap(): Array<HTMLElement> {
			if (!this.popoverElement) return []
			const focusableButtons: Array<HTMLElement> = Array.from(
				this.popoverElement.querySelectorAll(focusableElementsSelector),
			)

			return [...focusableButtons].filter(Boolean)
		}

		private handlePopoverKeydown = (event: KeyboardEvent): void => {
			if (event.key !== 'Tab') return

			const focusableElements = this.getFocusableElementsForTrap()
			if (focusableElements.length === 0) return

			const first = focusableElements[0]
			const last = focusableElements[focusableElements.length - 1]
			const currentFocusedElement = document.activeElement

			if (!first || !last) return

			if (event.shiftKey) {
				if (
					currentFocusedElement === first ||
					currentFocusedElement === this.popoverElement
				) {
					event.preventDefault()
					last.focus()
				}
				return
			}

			if (currentFocusedElement === last) {
				event.preventDefault()
				first.focus()
			}
		}
	},
)
