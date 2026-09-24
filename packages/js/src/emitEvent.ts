export function emitEvent(
	componentName: string,
	eventId: string,
	element: Element,
	cancelable = false,
	detail?: unknown,
) {
	const event = new CustomEvent(`${componentName}:${eventId}`, {
		bubbles: true,
		cancelable,
		detail,
	})
	return element.dispatchEvent(event)
}
