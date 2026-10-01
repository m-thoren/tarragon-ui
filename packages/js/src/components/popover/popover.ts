import { Component, NativeEvent, fail, ok, tuiAttribute } from '@/utils/constants'
import { ComponentBase } from '../component-base'

const SELECTOR_POPOVER = '[popover]'
const SELECTOR_TRIGGER = (id: string) => `[popovertarget="${id}"]`

const state = {
	open: 'open',
	closed: 'closed',
} as const

class TUIPopover extends ComponentBase {
	static readonly componentName = Component.Popover.Name

	private popoverElement: HTMLDivElement | null = null
	private trigger: HTMLButtonElement | null = null
	private whileOpen = this.listeners.group()

	protected setup() {
		const [popoverReason, popover] = this.require<HTMLDivElement>(SELECTOR_POPOVER)
		if (popoverReason) {
			return fail(popoverReason)
		}
		this.popoverElement = popover

		const [triggerReason, trigger] = this.require<HTMLButtonElement>(
			SELECTOR_TRIGGER(CSS.escape(this.popoverElement.id)),
		)
		if (triggerReason) {
			return fail(triggerReason)
		}
		this.trigger = trigger

		this.listeners.add(this.popoverElement, NativeEvent.BeforeToggle, this.handleBeforeToggle)
		this.listeners.add(this.popoverElement, NativeEvent.Toggle, this.handleToggle)
		this.popoverElement.setAttribute(tuiAttribute('state'), state.closed)
		return ok()
	}

	private isOpen(): boolean {
		if (!this.popoverElement) return false
		try {
			return this.popoverElement.matches(':popover-open')
		} catch {
			return this.popoverElement.getAttribute(tuiAttribute('state')) === state.open
		}
	}

	private isManual(): boolean {
		return this.popoverElement?.getAttribute('popover') === 'manual'
	}

	private setState(newState: string): void {
		this.popoverElement?.setAttribute(tuiAttribute('state'), newState)
		this.syncListeners(newState === state.open)
	}

	private syncListeners(isOpen: boolean): void {
		if (!isOpen) {
			this.whileOpen.clear()
			return
		}
		this.whileOpen.add(this, NativeEvent.KeyDown, this.handleKeydown)
		this.whileOpen.add(this, NativeEvent.FocusOut, this.handleFocusOut)
	}

	private handleBeforeToggle = (event: ToggleEvent) => {
		this.syncListeners(event.newState === state.open)
	}

	private handleToggle = (event: ToggleEvent): void => {
		this.setState(event.newState)
	}

	private handleKeydown = (event: KeyboardEvent): void => {
		if (event.key !== 'Escape' || event.defaultPrevented) return
		if (!this.isManual() || !this.isOpen()) return

		event.preventDefault()
		const focusWasInside = this.popoverElement?.contains(document.activeElement) ?? false
		this.popoverElement?.hidePopover()
		if (focusWasInside) this.trigger?.focus()
	}

	private handleFocusOut = (event: FocusEvent): void => {
		if (!this.isOpen() || this.isManual()) return
		const next = event.relatedTarget
		if (!(next instanceof Node) || this.contains(next)) return
		this.popoverElement?.hidePopover()
	}
}

TUIPopover.define()
