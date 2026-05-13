import { tuiAttribute } from './constants'

export function ready(component: HTMLElement) {
	console.debug('🚀 ~ ready ~ component:', component)
	component.setAttribute(tuiAttribute('state'), 'ready')
}
