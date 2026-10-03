export type Reason = {
	message: string
	data?: Readonly<Record<string, unknown>>
}

export type Result<Value> = [Reason, undefined] | [undefined, Value]

export function ok(): [undefined, true]
export function ok<Value>(value: Value): [undefined, Value]
export function ok(value?: unknown): [undefined, unknown] {
	return [undefined, value]
}

export function fail(reason: Reason): [Reason, undefined]
export function fail(message: string, data?: Reason['data']): [Reason, undefined]
export function fail(reasonOrMessage: Reason | string, data?: Reason['data']): [Reason, undefined] {
	const reason =
		typeof reasonOrMessage === 'string' ? { message: reasonOrMessage, data } : reasonOrMessage
	return [reason, undefined]
}

export const libName = 'tui'
export const libNamePrefix = `${libName}-`
export const dataAttributePrefix = `data-${libNamePrefix}`
export const tuiAttribute = (name: string) => dataAttributePrefix + name
export const tuiAttributeSelector = (name: string, value?: string) =>
	`[${tuiAttribute(name)}${value ? `="${value}"` : ''}]`
export const hiddenAttribute = 'hidden'

export const focusableElementsSelector =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary'

export const SECOND = 1000

export enum NativeEvent {
	Click = 'click',
	DoubleClick = 'dblclick',
	MouseUp = 'mouseup',
	MouseDown = 'mousedown',
	ContextMenu = 'contextmenu',
	MouseWheel = 'mousewheel',
	DOMMouseScroll = 'DOMMouseScroll',
	MouseOver = 'mouseover',
	MouseOut = 'mouseout',
	MouseMove = 'mousemove',
	MouseEnter = 'mouseenter',
	SelectStart = 'selectstart',
	SelectEnd = 'selectend',
	KeyDown = 'keydown',
	KeyPress = 'keypress',
	KeyUp = 'keyup',
	OrientationChange = 'orientationchange',
	TouchStart = 'touchstart',
	TouchMove = 'touchmove',
	TouchEnd = 'touchend',
	TouchCancel = 'touchcancel',
	PointerDown = 'pointerdown',
	PointerMove = 'pointermove',
	PointerUp = 'pointerup',
	PointerLeave = 'pointerleave',
	PointerCancel = 'pointercancel',
	GestureStart = 'gesturestart',
	GestureChange = 'gesturechange',
	GestureEnd = 'gestureend',
	Focus = 'focus',
	Blur = 'blur',
	Change = 'change',
	Reset = 'reset',
	Select = 'select',
	Submit = 'submit',
	FocusIn = 'focusin',
	FocusOut = 'focusout',
	Load = 'load',
	Unload = 'unload',
	BeforeUnload = 'beforeunload',
	BeforeToggle = 'beforetoggle',
	Resize = 'resize',
	Move = 'move',
	DOMContentLoaded = 'DOMContentLoaded',
	ReadyStateChange = 'readystatechange',
	Error = 'error',
	Abort = 'abort',
	Scroll = 'scroll',
	Input = 'input',
	Toggle = 'toggle',
	Close = 'close',
}

export const Component = {
	AjaxFetch: {
		Name: 'ajax-fetch',
	},
	AjaxForm: {
		Name: 'ajax-form',
		Event: { Form: `${libName}:ajax-form:form` },
	},
	AjaxHtml: {
		Name: 'ajax-html',
		Event: { Render: `${libName}:ajax-html:render` },
	},
	Boop: {
		Name: 'boop',
	},
	Dropdown: {
		Name: 'dropdown',
	},
	ExclusiveCheckbox: {
		Name: 'exclusive-checkbox',
		Event: { Toggle: `${libName}:exclusive-checkbox:toggle` },
	},
	Popover: { Name: 'popover' },
	SelectAll: { Name: 'select-all', Event: { Toggle: `${libName}:select-all:toggle` } },
	Tabs: { Name: 'tabs' },
	UntilSelected: {
		Name: 'until-selected',
		Event: { Toggle: `${libName}:until-selected:toggle` },
	},
	ValidateForm: {
		Name: 'validate-form',
		Event: { Validate: `${libName}:validate-form:validate` },
	},
} as const
