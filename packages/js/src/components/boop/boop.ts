import {
	Component,
	NativeEvent,
	focusableElementsSelector,
	ok,
	tuiAttribute,
} from '@/utils/constants'
import { ComponentBase } from '../component-base'
import { checkPrefersReducedMotion } from '@/utils/reducedMotion'

class TUIBoop extends ComponentBase {
	static readonly componentName = Component.Boop.Name
	private bindElement: HTMLElement | null = null

	protected setup() {
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

		if (this.bindElement) {
			this.listeners.add(this.bindElement, NativeEvent.MouseEnter, this.handleBoop)
		}
		return ok()
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
}

TUIBoop.define()
