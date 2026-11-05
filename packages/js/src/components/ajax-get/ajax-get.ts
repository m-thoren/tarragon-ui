import { Component, NativeEvent, fail, ok, tuiAttribute } from '@/utils/constants'
import { Announcer } from '../announcer'
import { ComponentBase } from '../component-base'
import { debounce } from '@/utils/debounce'
import { fetchClient } from '@/utils/fetch'
import { queryCache } from '@/utils/query-cache'

class TUIAjaxFetch extends ComponentBase {
	static readonly componentName = Component.AjaxFetch.Name

	private trigger: HTMLButtonElement | null = null
	private announcer: Announcer | null = null
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
		this.announcer = new Announcer(existingAnnounce as HTMLDivElement)

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
		const announcer = this.announcer
		if (!announcer) return

		this.requestController?.abort()
		announcer.clear()
		const requestController = new AbortController()
		this.requestController = requestController

		announcer.announceAfterDelay(this.messageSubmitting)

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
		announcer.clear()
		if (shouldFocus) this.trigger?.focus()

		if (error) {
			if (error.data?.document && error.data.document instanceof Document) {
				const errorDocument = error.data.document
				const newAnnounce = errorDocument.querySelector('[data-tui-announce]')
				if (newAnnounce) {
					announcer.announce(newAnnounce.innerHTML)
					return
				}
			}

			announcer.announce(this.messageError)
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
		const newAnnounce = response.querySelector('[data-tui-announce]')
		announcer.announce(newAnnounce?.innerHTML ?? this.messageSuccess)
	}

	protected cleanup() {
		this.requestController?.abort()
		this.requestController = null
		this.announcer?.cleanup()
		this.announcer = null
	}
}

TUIAjaxFetch.define()
