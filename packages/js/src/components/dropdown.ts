import { Component, NativeEvent, focusableElementsSelector } from '../constants'

customElements.define(
	Component.Dropdown.Name,
	class extends HTMLElement {
		private dropdown: HTMLDetailsElement | null = null
		private trigger: HTMLButtonElement | null = null
		private content: HTMLUListElement | null = null

		connectedCallback() {
			this.dropdown = this.querySelector('details')
			this.trigger = this.querySelector<HTMLButtonElement>('summary')
			this.content = this.querySelector('ul')

			if (!this.dropdown || !this.trigger || !this.content) return

			this.trigger.addEventListener(NativeEvent.Click, this.handleOpen)
		}

		disconnectedCallback() {
			if (this.trigger) {
				this.trigger.removeEventListener(NativeEvent.Click, this.handleOpen)
			}

			this.removeEvents()
		}

		private focusFirstDropdownItem() {
			if (!this.content) return

			const focusableElements = Array.from(
				this.content.querySelectorAll<HTMLElement>(focusableElementsSelector),
			)

			if (focusableElements.length === 0) {
				this.content.focus()
				return
			}

			const firstFocusableElement = focusableElements[0]

			setTimeout(() => {
				if (!firstFocusableElement) return
				firstFocusableElement.focus()
			}, 1)
		}

		private handleTrapFocus = (event: Event) => {
			if (!this.content) return
			if (!(event instanceof KeyboardEvent)) return
			const focusableElements = Array.from(
				this.content.querySelectorAll<HTMLElement>(focusableElementsSelector),
			)
			if (focusableElements.length <= 0) return

			const firstFocusableElement = focusableElements[0]
			const lastFocusableElement = focusableElements[focusableElements.length - 1]

			const activeElement = document.activeElement
			if (!activeElement) return

			const currentFocusIndex = focusableElements.indexOf(activeElement as HTMLElement)

			if (event.key === 'Tab') {
				if (event.shiftKey) {
					// * Shift + Tab
					if (activeElement === firstFocusableElement) {
						if (!lastFocusableElement) return
						lastFocusableElement.focus()
						event.preventDefault()
						return
					}
					return
				}
				// * Tab
				if (activeElement === lastFocusableElement) {
					if (!firstFocusableElement) return
					firstFocusableElement.focus()
					event.preventDefault()
					return
				}
			}
			if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
				event.preventDefault()
				if (event.altKey) {
					if (!firstFocusableElement) return
					firstFocusableElement.focus()
					return
				}
				if (currentFocusIndex === 0 || currentFocusIndex === -1) {
					// -1 means the active element isn't in our focusableElements list,
					// so we'll treat it as if it's before the first.
					if (!lastFocusableElement) return
					lastFocusableElement.focus()
					return
				}
				focusableElements[currentFocusIndex - 1]?.focus()

				return
			}

			if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
				event.preventDefault()
				if (event.altKey) {
					if (!lastFocusableElement) return
					lastFocusableElement.focus()
					return
				}
				if (
					currentFocusIndex === focusableElements.length - 1 ||
					currentFocusIndex === -1
				) {
					if (!firstFocusableElement) return
					firstFocusableElement.focus()
					return
				}
				focusableElements[currentFocusIndex + 1]?.focus()
				return
			}
		}

		private addEvents() {
			if (!this.dropdown || !this.content) return
			console.log('lägger till')
			document.addEventListener(NativeEvent.Click, this.handleClickOutside)
			this.dropdown.addEventListener(NativeEvent.KeyDown, this.handleEscape)
			this.content.addEventListener(NativeEvent.KeyDown, this.handleTrapFocus, {
				capture: true,
			})
		}

		private removeEvents() {
			document.removeEventListener(NativeEvent.Click, this.handleClickOutside)

			if (this.dropdown) {
				this.dropdown.removeEventListener(NativeEvent.KeyDown, this.handleEscape)
			}

			if (this.content) {
				this.content.removeEventListener(NativeEvent.KeyDown, this.handleTrapFocus, {
					capture: true,
				})
			}
		}

		private handleClose() {
			if (!this.dropdown || !this.trigger) return

			this.dropdown.removeAttribute('open')
			this.trigger.focus()
			this.removeEvents()
		}

		private handleOpen = () => {
			if (this.dropdown?.open) return
			this.focusFirstDropdownItem()
			this.addEvents()
		}

		private handleClickOutside = (event: Event) => {
			if (!this.dropdown) return
			if (this.dropdown.contains(event.target as Node)) return
			this.handleClose()
		}

		private handleEscape = (event: Event) => {
			if (!(event instanceof KeyboardEvent)) return
			if (event.key !== 'Escape') return
			event.preventDefault()
			this.handleClose()
		}
	},
)
