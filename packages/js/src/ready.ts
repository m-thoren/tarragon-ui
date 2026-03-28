import { tuiAttribute } from './constants'

export function ready(component: HTMLElement) {
	component.setAttribute(tuiAttribute('ready'), '')
}
