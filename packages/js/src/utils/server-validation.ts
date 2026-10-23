const rejectedValues = new WeakMap<Element, string>()

export function setServerValidationValue(control: Element, value: string) {
	rejectedValues.set(control, value)
}

export function clearServerValidationValue(control: Element) {
	rejectedValues.delete(control)
}

export function hasUnchangedServerValidationValue(control: Element): boolean {
	const rejectedValue = rejectedValues.get(control)
	if (rejectedValue === undefined) return false

	if (
		'value' in control &&
		typeof control.value === 'string' &&
		control.value === rejectedValue
	) {
		return true
	}

	rejectedValues.delete(control)
	return false
}
