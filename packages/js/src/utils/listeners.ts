export type EventMapOf<T extends EventTarget> = T extends Window
	? WindowEventMap
	: T extends Document
		? DocumentEventMap
		: T extends HTMLElement
			? HTMLElementEventMap
			: Record<string, Event>

export class ListenerGroup {
	private abortController = new AbortController()
	private children = new Set<ListenerGroup>()
	private parent: ListenerGroup | null

	constructor(parent: ListenerGroup | null = null) {
		this.parent = parent
	}

	get signal(): AbortSignal {
		this.attach()
		return this.abortController.signal
	}

	add<T extends EventTarget, K extends keyof EventMapOf<T> & string>(
		target: T,
		type: K,
		listener: (event: EventMapOf<T>[K]) => void,
		options?: AddEventListenerOptions,
	): () => void
	add(
		target: EventTarget,
		type: string,
		listener: (event: Event) => void,
		options?: AddEventListenerOptions,
	): () => void
	add(
		target: EventTarget,
		type: string,
		listener: (event: Event) => void,
		options: AddEventListenerOptions = {},
	): () => void {
		target.addEventListener(type, listener, { ...options, signal: this.signal })
		return () => {
			target.removeEventListener(type, listener, options)
		}
	}

	group(): ListenerGroup {
		return new ListenerGroup(this)
	}

	clear(): void {
		this.abortController.abort()
		this.abortController = new AbortController()
		for (const child of this.children) {
			child.clear()
		}
		this.children.clear()
		this.parent?.children.delete(this)
	}

	private attach(): void {
		if (!this.parent) return
		this.parent.attach()
		this.parent.children.add(this)
	}
}
