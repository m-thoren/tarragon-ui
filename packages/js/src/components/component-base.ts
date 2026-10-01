import { type Reason, Result, fail, libNamePrefix, ok, tuiAttribute } from '@/utils/constants'
import { ListenerGroup } from '@/utils/listeners'

type ElementType<T extends Element> = abstract new (...args: Array<never>) => T

export abstract class ComponentBase extends HTMLElement {
	static readonly componentName: string = ''

	static get tag(): string {
		return `${libNamePrefix}${this.componentName}`
	}

	static define(): void {
		if (!this.componentName) throw new Error('ComponentBase: componentName is not set')
		if (customElements.get(this.tag)) return
		customElements.define(this.tag, this as unknown as CustomElementConstructor)
	}

	protected readonly listeners = new ListenerGroup()
	private connected = false

	protected abstract setup(): Result<true>

	protected cleanup(): void {
		// Nothing to clean up by default
	}

	protected get signal(): AbortSignal {
		return this.listeners.signal
	}

	protected get componentName(): string {
		return this.statics.componentName
	}

	connectedCallback() {
		this.teardown()
		this.connected = true

		const [reason] = this.setup()
		if (reason) {
			this.logError(reason)
			this.teardown()
			return
		}
		this.setAttribute(tuiAttribute('state'), 'ready')
	}

	disconnectedCallback() {
		this.teardown()
	}

	protected logError(reason: Reason): void {
		console.error(...this.logArguments(reason))
	}

	protected logWarning(reason: Reason): void {
		console.warn(...this.logArguments(reason))
	}

	protected require<T extends Element = HTMLElement>(
		selector: string,
		type?: ElementType<T>,
	): Result<T> {
		const expected = type ?? (HTMLElement as unknown as ElementType<T>)
		const element = this.querySelector(selector)
		if (!element) return fail(`Missing element with selector "${selector}"`)
		if (!(element instanceof expected)) {
			return fail(`"${selector}" must be a ${expected.name}`, { element })
		}
		return ok(element)
	}

	protected emit(name: string, detail?: unknown, cancelable = false): boolean {
		return this.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable, detail }))
	}

	private get statics(): typeof ComponentBase {
		return this.constructor as typeof ComponentBase
	}

	private logArguments({ message, data }: Reason): Array<unknown> {
		const text = `${libNamePrefix}${this.componentName}: ${message}`
		return data ? [text, this, data] : [text, this]
	}

	private teardown(): void {
		if (!this.connected) return
		this.connected = false
		this.listeners.clear()
		this.cleanup()
		this.removeAttribute(tuiAttribute('state'))
	}
}
