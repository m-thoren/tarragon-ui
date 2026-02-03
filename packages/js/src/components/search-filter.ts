import { Component, NativeEvent, hiddenAttribute, tuiAttribute } from '../constants'
import { debounce } from '../debounce'

type TargetElement = { element: HTMLElement; text: string }

customElements.define(
	Component.SearchFilter.Name,
	class extends HTMLElement {
		// TODO Add an aria-live region to announce number of results found
		// TODO handle focus management for accessibility
		private inputElement: HTMLInputElement | null = null
		private searchButton: HTMLInputElement | null = null
		private collections: Array<{ element: HTMLElement; targetElements: Array<TargetElement> }> =
			[]
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

			const collectionSelector = this.getAttribute(tuiAttribute('collection-selector'))
			if (!collectionSelector) {
				console.warn(
					`${Component.SearchFilter.Name} requires a "collection-selector" attribute.`,
					this,
				)
				return
			}

			const targetSelector = this.getAttribute(tuiAttribute('target-selector'))
			if (!targetSelector) {
				console.warn(
					`${Component.SearchFilter.Name} requires a "target-selector" attribute.`,
					this,
				)
				return
			}

			const collections = Array.from(
				document.querySelectorAll<HTMLElement>(collectionSelector),
			)
			if (collections.length === 0) return

			for (const collection of collections) {
				const targetElements = Array.from(
					collection.querySelectorAll<HTMLElement>(targetSelector),
				)
				this.collections.push({
					element: collection,
					targetElements: targetElements.map((element) => ({
						element,
						text: element.textContent.toLocaleLowerCase(),
					})),
				})
			}
			if (this.collections.length === 0) return

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
				for (const collection of this.collections) {
					collection.element.removeAttribute(hiddenAttribute)

					for (const element of collection.targetElements) {
						element.element.removeAttribute(hiddenAttribute)
					}
				}
				return
			}

			this.collections.forEach((collection) => {
				let hasMatch = false

				for (const element of collection.targetElements) {
					if (element.text.includes(query)) {
						element.element.removeAttribute(hiddenAttribute)
						hasMatch = true
					} else {
						element.element.setAttribute(hiddenAttribute, '')
					}
				}

				if (hasMatch) {
					collection.element.removeAttribute(hiddenAttribute)
				} else {
					collection.element.setAttribute(hiddenAttribute, '')
				}
			})
		}
	},
)
