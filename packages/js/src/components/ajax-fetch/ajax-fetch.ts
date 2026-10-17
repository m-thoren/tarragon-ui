import {
	Component,
	NativeEvent,
	fail,
	ok,
	tuiAttribute,
	tuiAttributeSelector,
} from '@/utils/constants'
import { ComponentBase } from '../component-base'
import { debounce } from '@/utils/debounce'
import { fetchClient } from '@/utils/fetch'
import { queryCache } from '@/utils/query-cache'

class TUIAjaxFetch extends ComponentBase {
	static readonly componentName = Component.AjaxFetch.Name

	private trigger: HTMLButtonElement | null = null
	private announce: HTMLDivElement | null = null
	private announceTitle: HTMLElement | null = null
	private messageSubmitting = 'Fetching...'
	private messageSuccess = 'Data fetched successfully'
	private messageError = 'An error occurred'
	private queryKey: string | null = null
	private url: string | null = null
	private form: HTMLFormElement | null = null
	private triggerMode = 'submit'
	private debounceDelay = 300
	private debouncedSubmit: (() => void) | null = null
	private requestController: AbortController | null = null

	setup() {
		const [formReason, form] = this.require<HTMLFormElement>('form')
		if (formReason) {
			return fail(formReason)
		}
		this.form = form
		this.url = form.action

		this.trigger = form.querySelector('button')

		const announceId = this.getAttribute(tuiAttribute('announce-id'))
		if (!announceId) {
			return fail('Missing announce-id attribute')
		}
		const existingAnnounce = document.getElementById(announceId)
		if (!existingAnnounce) {
			return fail('Announce element was not found')
		}
		this.announce = existingAnnounce as HTMLDivElement
		const announceTitle = existingAnnounce.querySelector<HTMLElement>(
			tuiAttributeSelector('announce-title'),
		)
		this.announceTitle = announceTitle ?? this.announce
		this.announce.setAttribute('role', 'status')

		// Define options
		this.messageSubmitting =
			this.getAttribute(tuiAttribute('message-submitting')) ?? this.messageSubmitting
		this.messageSuccess =
			this.getAttribute(tuiAttribute('message-success')) ?? this.messageSuccess
		this.messageError = this.getAttribute(tuiAttribute('message-error')) ?? this.messageError
		this.queryKey = this.getAttribute(tuiAttribute('query-key'))
		this.triggerMode = this.getAttribute(tuiAttribute('trigger')) ?? this.triggerMode
		const debounceAttribute = this.getAttribute(tuiAttribute('debounce'))
		if (debounceAttribute !== null) {
			const debounceDelay = Number(debounceAttribute)
			if (Number.isFinite(debounceDelay) && debounceDelay >= 0) {
				this.debounceDelay = debounceDelay
			}
		}

		this.listeners.add(form, NativeEvent.Submit, this.handleEvent)
		if (this.triggerMode === 'change') {
			this.debouncedSubmit = debounce(() => void this.handleSubmit(false), this.debounceDelay)
			this.listeners.add(form, NativeEvent.Input, this.handleChange)
			this.listeners.add(form, NativeEvent.Change, this.handleChange)
		}

		return ok()
	}

	private handleEvent = (event: Event) => {
		if (event.type === 'submit') {
			event.preventDefault()
			void this.handleSubmit()
		}
	}

	private handleChange = () => {
		this.debouncedSubmit?.()
	}

	private async handleSubmit(shouldFocus = true) {
		if (!this.queryKey) return
		if (!this.url) return
		if (!this.form) return

		this.requestController?.abort()
		const requestController = new AbortController()
		this.requestController = requestController

		this.showStatus('pending')

		const queryParameters = new URLSearchParams()
		new FormData(this.form).forEach((value, key) => {
			if (typeof value === 'string' && value.trim() !== '') {
				queryParameters.append(key, value)
			}
		})
		const [error, response] = await fetchClient.get(this.url, {
			queryParameters,
			signal: requestController.signal,
		})

		if (requestController.signal.aborted || this.requestController !== requestController) return
		if (shouldFocus) this.trigger?.focus()

		if (error) {
			console.error('An error occurred', error)
			this.showStatus('error')
			return
		}

		if (response.type !== 'html') {
			console.error('An error occurred', 'Response was not html')
			this.showStatus('error')
			return
		}

		if (this.getAttribute(tuiAttribute('update-url')) === 'true') {
			history.replaceState(
				null,
				'',
				`${window.location.pathname}?${queryParameters.toString()}`,
			)
		}
		queryCache.setQueryData(this.queryKey, response)
		const announceText = response.document.querySelector(
			tuiAttributeSelector('announce-text'),
		)?.textContent
		this.showStatus('success', announceText)
	}

	protected cleanup() {
		this.requestController?.abort()
		this.requestController = null
	}

	private showStatus(status: 'success' | 'error' | 'pending', message?: string) {
		if (!this.announce || !this.announceTitle) return

		switch (status) {
			case 'error':
				this.announceTitle.textContent = message ?? this.messageError
				break
			case 'pending':
				this.announceTitle.textContent = message ?? this.messageSubmitting
				break
			case 'success':
				this.announceTitle.textContent = message ?? this.messageSuccess
				break
		}
	}
}

TUIAjaxFetch.define()
