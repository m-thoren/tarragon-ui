export type Result<Error, Value> = [Error, undefined] | [undefined, Value]

export const libNamePrefix = 'tui-'
export const dataAttributePrefix = `data-${libNamePrefix}`
export const tuiAttribute = (name: string) => dataAttributePrefix + name
export const tuiAttributeSelector = (name: string, value?: string) =>
	`[${tuiAttribute(name)}${value ? `="${value}"` : ''}]`
export const hiddenAttribute = 'hidden'

export const focusableElementsSelector =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

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
	AjaxForm: {
		Name: `${libNamePrefix}ajax-form`,
		Event: { Form: 'form' },
	},
	AjaxHtml: {
		Name: `${libNamePrefix}ajax-html`,
	},
	Dropdown: {
		Name: `${libNamePrefix}dropdown`,
	},
	ExclusiveCheckbox: {
		Name: `${libNamePrefix}exclusive-checkbox`,
		Event: { Toggle: 'toggle' },
	},
	SelectAll: { Name: `${libNamePrefix}select-all`, Event: { Toggle: 'toggle' } },
	SearchFilter: { Name: `${libNamePrefix}search-filter` },
	UntilSelected: { Name: `${libNamePrefix}until-selected`, Event: { Toggle: 'toggle' } },
	ValidateForm: {
		Name: `${libNamePrefix}validate-form`,
		Event: { Validate: 'validate' },
	},
} as const
