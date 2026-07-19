import { Component, NativeEvent, focusableElementsSelector, tuiAttribute } from '../../constants'
import { checkPrefersReducedMotion } from '../../reducedMotion'
import { ready } from '../../ready'

customElements.define(
	Component.Boop.Name,
	class extends HTMLElement {
		private bindElement: HTMLElement | null = null

		connectedCallback() {
			const bindElementAttr = this.getAttribute(tuiAttribute('bind-element'))
			if (bindElementAttr) {
				const bindElement = document.querySelector<HTMLElement>(bindElementAttr)
				if (bindElement) {
					this.bindElement = bindElement
				}
			}
			if (!this.bindElement) {
				const bindElement = this.closest<HTMLElement>(focusableElementsSelector)
				if (bindElement) {
					this.bindElement = bindElement
				}
			}
			this.bindElement ??= this.parentElement

			this.bindElement?.addEventListener(NativeEvent.MouseEnter, this.handleBoop)
			ready(this)
		}

		disconnectedCallback() {
			this.bindElement?.removeEventListener(NativeEvent.MouseEnter, this.handleBoop)
		}

		private handleBoop = () => {
			const prefersReducedMotion = checkPrefersReducedMotion()
			if (prefersReducedMotion) {
				return
			}

			this.classList.add('boop-active')

			window.setTimeout(() => {
				this.classList.remove('boop-active')
			}, 150)
		}
	},
)
