export function checkPrefersReducedMotion() {
	return !window.matchMedia('(prefers-reduced-motion: no-preference)').matches
}
