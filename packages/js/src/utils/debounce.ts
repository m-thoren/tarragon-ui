export function debounce<T extends (...args: Array<unknown>) => void>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | undefined
	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			func.apply(this, args)
		}, delay)
	}
}
