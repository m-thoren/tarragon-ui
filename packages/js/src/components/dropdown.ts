import { Component, NativeEvent, focusableElementsSelector, tuiAttribute } from '../constants'

const SELECTOR_POPOVER = '[popover]'
const SELECTOR_TRIGGER = (id: string) => `[popovertarget="${id}"]`

const state = {
	open: 'open',
	closed: 'closed',
}

type ActionElement = HTMLElement

customElements.define(
	Component.Dropdown.Name,
	class extends HTMLElement {
		private popoverElement: HTMLDivElement | null = null
		private trigger: HTMLButtonElement | null = null
		private focusableElements: Array<ActionElement> = []

		private searchString = ''
		private searchTimeout = -1

		connectedCallback() {
			const popover = this.querySelector<HTMLDivElement>(SELECTOR_POPOVER)
			if (!popover) {
				console.error(
					`${Component.Dropdown.Name} component: Missing element with selector "${SELECTOR_POPOVER}"`,
				)
				return
			}
			this.popoverElement = popover

			const trigger = this.querySelector<HTMLButtonElement>(
				SELECTOR_TRIGGER(this.popoverElement.id),
			)
			if (!trigger) {
				console.error(
					`${Component.Dropdown.Name} component: Missing element with selector "${SELECTOR_TRIGGER(this.popoverElement.id)}"`,
				)
				return
			}
			this.trigger = trigger

			this.focusableElements = this.getFocusableElementsForTrap()

			this.popoverElement.setAttribute(tuiAttribute('state'), state.closed)

			this.addEventListener(NativeEvent.KeyDown, this.handleKeydown)
			this.popoverElement.addEventListener(NativeEvent.Toggle, this.handleToggle)
		}

		disconnectedCallback() {
			this.removeEventListener(NativeEvent.KeyDown, this.handleKeydown)
			this.popoverElement?.removeEventListener(NativeEvent.Toggle, this.handleToggle)
		}

		private getFocusableElementsForTrap(): Array<ActionElement> {
			if (!this.popoverElement) return []
			const focusableButtons: Array<HTMLElement> = Array.from(
				this.popoverElement.querySelectorAll(focusableElementsSelector),
			)

			return [...focusableButtons].filter(Boolean)
		}

		private handleToggle = (event: ToggleEvent): void => {
			if (event.newState === 'open') {
				this.onPopoverOpen()
				return
			}
			this.onPopoverClose()
		}

		private onPopoverOpen(): void {
			if (!this.popoverElement) return
			this.popoverElement.setAttribute(tuiAttribute('state'), state.open)
		}

		private onPopoverClose(): void {
			if (!this.popoverElement) return
			this.popoverElement.setAttribute(tuiAttribute('state'), state.closed)
		}

		private isOpen(): boolean {
			if (!this.popoverElement) return false
			return this.popoverElement.getAttribute(tuiAttribute('state')) === state.open
		}

		private handleKeydown = (e: KeyboardEvent): void => {
			if (this.isOpen()) {
				this.handleKeyboardWhenOpen(e)
				return
			}
			this.handleKeyboardWhenClosed(e)
		}

		private handleKeyboardWhenClosed = (e: KeyboardEvent): void => {
			if (this.isOpen()) return
			switch (e.key) {
				case 'Enter':
				case ' ':
				case 'ArrowDown':
					e.preventDefault()
					this.openSelect()
					this.focusOptionByIndex(0)
					break
				case 'ArrowUp':
					e.preventDefault()
					this.openSelect()
					this.focusOptionByIndex(this.focusableElements.length - 1)
					break
				default:
					if (/^[a-zA-Z0-9]$/.test(e.key)) {
						e.preventDefault()
						this.openSelect()
						this.handleSearchString(e.key)
					}
					break
			}
		}

		private handleKeyboardWhenOpen = (e: KeyboardEvent): void => {
			if (!this.isOpen()) return
			switch (e.key) {
				case ' ':
					e.preventDefault()
					this.triggerAction(e)
					break
				case 'Tab':
					this.closeSelect()
					break
				case 'ArrowDown':
					if (
						e.target &&
						(e.target instanceof HTMLAnchorElement ||
							e.target instanceof HTMLButtonElement)
					) {
						this.focusOptionByStep(e.target, 1, e)
					}
					break
				case 'ArrowUp':
					if (
						e.target &&
						(e.target instanceof HTMLAnchorElement ||
							e.target instanceof HTMLButtonElement)
					) {
						this.focusOptionByStep(e.target, -1, e)
					}
					break
				case 'Home':
					e.preventDefault()
					this.focusOptionByIndex(0)
					break
				case 'End':
					e.preventDefault()
					this.focusOptionByIndex(this.focusableElements.length - 1)
					break
				default:
					if (/^[a-zA-Z0-9]$/.test(e.key)) {
						e.preventDefault()
						this.handleSearchString(e.key)
					}
					break
			}
		}

		private openSelect = (): void => {
			if (!this.trigger) return
			if (this.isOpen()) return
			this.trigger.click()
		}

		private closeSelect = (): void => {
			if (!this.trigger) return
			if (!this.isOpen()) return
			this.trigger.click()
		}

		private triggerAction = (e: Event) => {
			if (e.target instanceof HTMLAnchorElement) {
				e.target.click()
			}
		}

		private focusOptionByStep = (
			option: ActionElement,
			step: number,
			e: KeyboardEvent,
		): void => {
			const focusable = this.focusableElements

			if (!focusable.length) return

			const current = option
			const index = focusable.indexOf(current)

			e.preventDefault()

			if (index === -1) {
				focusable[0]?.focus()
				return
			}

			const newIndex = (index + step + focusable.length) % focusable.length
			if (newIndex >= focusable.length || newIndex < 0) return

			focusable[newIndex]?.focus()
		}

		private focusOptionByIndex(index: number): void {
			if (!this.focusableElements.length) return
			const newIndex = Math.max(0, Math.min(index, this.focusableElements.length - 1))
			this.focusableElements[newIndex]?.focus()
		}

		private handleSearchString(char: string): void {
			clearTimeout(this.searchTimeout)
			this.searchString += char.toLowerCase()

			if (!this.focusableElements.length) return

			const activeOption = this.getActiveOption()

			const startIndex =
				this.searchString.length === 1 && activeOption
					? this.focusableElements.indexOf(activeOption) + 1
					: 0

			const foundOption =
				this.findOptionBySearchString(this.focusableElements, startIndex) ??
				this.findOptionBySearchString(this.focusableElements, 0)

			if (foundOption) {
				foundOption.focus()
			}

			this.searchTimeout = window.setTimeout(() => {
				this.searchString = ''
			}, 500)
		}

		private findOptionBySearchString(
			options: Array<ActionElement>,
			startIndex: number,
		): ActionElement | null {
			for (let i = 0; i < options.length; i++) {
				const optionIndex = (startIndex + i) % options.length
				const textContent = options[optionIndex]?.textContent.trim().toLowerCase()
				if (textContent?.startsWith(this.searchString)) {
					return options[optionIndex] ?? null
				}
			}
			return null
		}

		private getActiveOption(): ActionElement | null {
			const activeElement = document.activeElement

			if (
				!activeElement ||
				!(activeElement instanceof HTMLAnchorElement) ||
				!(activeElement instanceof HTMLButtonElement)
			)
				return null

			return this.focusableElements.find((el) => el === activeElement) ?? null
		}
	},
)
