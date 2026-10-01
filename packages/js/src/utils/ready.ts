import { tuiAttribute } from '@/utils/constants'

export function ready(component: HTMLElement) {
	component.setAttribute(tuiAttribute('state'), 'ready')
}
