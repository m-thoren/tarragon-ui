import { Component, NativeEvent, hiddenAttribute, tuiAttribute } from '../constants'
import { debounce } from '../debounce'

customElements.define(
	Component.SearchFilter.Name,
	class extends HTMLElement {
		// TODO Add an aria-live region to announce number of results found
		// TODO Display a "no results found" message when appropriate
		// TODO handle focus management for accessibility
		private inputElement: HTMLInputElement | null = null
		private searchButton: HTMLInputElement | null = null
		private targetElements: Array<{ element: HTMLElement; text: string }> = []
		private debouncedFilterTargets: () => void

		constructor() {
			super()
			this.debouncedFilterTargets = debounce(this.filterTargets, 300)
		}

		connectedCallback() {
			this.inputElement = this.querySelector('input[type="search"]')
			this.searchButton = this.querySelector('button[type="submit"]')

			if (!this.inputElement) return
			if (!this.searchButton) return

			const targetSelector = this.getAttribute(tuiAttribute('target-selector'))
			if (targetSelector) {
				const targetElements = Array.from(
					document.querySelectorAll<HTMLElement>(targetSelector),
				)
				this.targetElements = targetElements.map((element) => ({
					element,
					text: element.textContent.toLocaleLowerCase(),
				}))
			}
			if (this.targetElements.length === 0) return

			this.inputElement.addEventListener(NativeEvent.Input, this.debouncedFilterTargets)
			this.searchButton.addEventListener(NativeEvent.Click, this.onSearchClick)
		}

		disconnectedCallback() {
			this.inputElement?.removeEventListener(NativeEvent.Input, this.debouncedFilterTargets)
			this.searchButton?.removeEventListener(NativeEvent.Click, this.onSearchClick)
		}

		private onSearchClick = (event: Event) => {
			event.preventDefault()
			this.filterTargets()
		}

		private filterTargets = () => {
			if (!this.inputElement) return
			const query = this.inputElement.value.toLocaleLowerCase()

			if (!query) {
				for (const element of this.targetElements) {
					element.element.removeAttribute(hiddenAttribute)
				}
				return
			}

			this.targetElements.forEach((element) => {
				if (element.text.includes(query)) {
					element.element.removeAttribute(hiddenAttribute)
				} else {
					element.element.setAttribute(hiddenAttribute, '')
				}
			})
		}
	},
)
