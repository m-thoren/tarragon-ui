export function emitEvent(
	componentName: string,
	eventId: string,
	element: Element,
	cancelable = false,
) {
	const event = new Event(`${componentName}:${eventId}`, {
		bubbles: true,
		cancelable,
	})
	return element.dispatchEvent(event)
}
