import { Component, NativeEvent, fail, ok, tuiAttribute } from '@/utils/constants'
import { clearServerValidationValue, setServerValidationValue } from '@/utils/server-validation'
import { ComponentBase } from '../component-base'
import { fetchClient } from '@/utils/fetch'
import { queryCache } from '@/utils/query-cache'

type ValidationControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

class TUIAjaxForm extends ComponentBase {
	static readonly componentName = Component.AjaxForm.Name

	private form: HTMLFormElement | null = null
	private announce: HTMLDivElement | null = null
	private spinner: HTMLDivElement | null = null
	private messageSubmitting = 'Submitting...'
	private messageSuccess = 'Data submitted successfully'
	private messageError = 'An error occurred'
	private actionOnSuccess: 'none' | 'remove-form' = 'none'
	private keepFields = false
	private queryKey: string | null = null
	private pendingMessageTimer: ReturnType<typeof setTimeout> | null = null
	private announcementTimer: ReturnType<typeof setTimeout> | null = null
	private readonly pendingMessageDelay = 500
	private readonly repeatedAnnouncementDelay = 100

	private readonly isSubmittingAttribute = 'is-submitting'

	setup() {
		const [formReason, form] = this.require<HTMLFormElement>('form')
		if (formReason) {
			return fail(formReason)
		}
		this.form = form

		if (!fetchClient.isMethod(this.form.method)) {
			return fail({ message: 'Method is not a valid value' })
		}

		const announceId = this.getAttribute(tuiAttribute('announce-id'))
		if (!announceId) {
			return fail('Missing announce-id attribute')
		}
		const existingAnnounce = document.getElementById(announceId)
		if (!existingAnnounce) {
			return fail('Announce element was not found')
		}
		this.announce = existingAnnounce as HTMLDivElement
		this.announce.setAttribute('role', 'status')

		// Define options
		this.messageSubmitting =
			this.getAttribute(tuiAttribute('message-submitting')) ?? this.messageSubmitting
		this.messageSuccess =
			this.getAttribute(tuiAttribute('message-success')) ?? this.messageSuccess
		this.messageError = this.getAttribute(tuiAttribute('message-error')) ?? this.messageError
		this.keepFields = this.hasAttribute(tuiAttribute('keep-fields'))
		this.queryKey = this.getAttribute(tuiAttribute('query-key'))

		const actionOnSuccess = this.getAttribute(tuiAttribute('action-on-success'))
		if (actionOnSuccess === 'remove-form') {
			this.actionOnSuccess = 'remove-form'
		}

		this.spinner = document.createElement('div')
		this.spinner.className = 'loading'
		this.spinner.innerHTML = `<div class="spinner"></div>`
		this.append(this.spinner)

		this.listeners.add(form, NativeEvent.Submit, this.handleEvent)
		return ok()
	}

	private handleEvent = (event: Event) => {
		if (event.type === 'submit') {
			void this.handleSubmit(event)
		}
	}

	private handleSubmit = async (event: Event) => {
		if (!this.form) return
		if (!this.announce) return

		event.preventDefault()

		if (this.isDisabled()) return
		this.disable()

		const { action, method } = this.form
		if (!fetchClient.isMethod(method)) {
			this.logError({ message: 'Method is not a valid value' })
			return
		}

		this.clearAnnouncementTimer()
		this.pendingMessageTimer = setTimeout(() => {
			this.setAnnouncement(this.messageSubmitting)
		}, this.pendingMessageDelay)

		let submittingElement: HTMLButtonElement | null = null
		if (this.spinner) {
			submittingElement = this.form.querySelector<HTMLButtonElement>(':focus')
		}

		const [error, response] = await fetchClient.send(action, method, {
			data: this.serialize(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest',
			},
		})

		this.clearPendingMessageTimer()
		this.enable()

		if (error) {
			if (error.data?.document && error.data.document instanceof Document) {
				const errorDocument = error.data.document
				const validationForm = errorDocument.querySelector<HTMLFormElement>(
					'form[data-tui-validation-form]',
				)
				if (validationForm) {
					const firstInvalidControl = this.applyServerValidation(validationForm)
					const newAnnounce = errorDocument.querySelector('[data-tui-announce]')
					this.setAnnouncement(newAnnounce?.innerHTML ?? this.messageError)
					firstInvalidControl?.focus()
					return
				}

				const newAnnounce = errorDocument.querySelector('[data-tui-announce]')
				if (newAnnounce) {
					submittingElement?.focus()
					this.setAnnouncement(newAnnounce.innerHTML)
					return
				}
			}

			submittingElement?.focus()
			this.setAnnouncement(this.messageError)
			return
		}

		submittingElement?.focus()
		if (this.actionOnSuccess === 'remove-form') {
			this.remove()
		}

		if (!this.keepFields) {
			this.reset()
		}

		if (this.queryKey) {
			queryCache.setQueryData(this.queryKey, response)
		}

		const newAnnounce = response.querySelector('[data-tui-announce]')
		this.setAnnouncement(newAnnounce?.innerHTML ?? this.messageSuccess)

		this.emit(Component.AjaxForm.Event.Form)
	}

	private disable() {
		this.setAttribute(tuiAttribute(this.isSubmittingAttribute), '')
	}

	private enable() {
		this.removeAttribute(tuiAttribute(this.isSubmittingAttribute))
	}

	private isDisabled(): boolean {
		return this.hasAttribute(tuiAttribute(this.isSubmittingAttribute))
	}

	private serialize(): string {
		if (!this.form) return ''
		const data = new FormData(this.form)
		const params = new URLSearchParams()
		for (const [key, val] of data) {
			if (val instanceof File) continue
			params.append(key, val)
		}
		return params.toString()
	}

	private reset() {
		if (!this.form) return
		this.form.reset()
	}

	private applyServerValidation(responseForm: HTMLFormElement): ValidationControl | null {
		if (!this.form) return null

		const currentControls = this.getValidationControls(this.form)
		const oldErrorIds = new Set(
			Array.from(this.form.querySelectorAll<HTMLElement>('[data-tui-validation-message]'))
				.map((message) => message.id)
				.filter(Boolean),
		)

		for (const control of currentControls) {
			const originalDescriptions = (control.getAttribute('aria-describedby') ?? '').split(
				/\s+/,
			)
			const describedBy = originalDescriptions.filter((id) => id && !oldErrorIds.has(id))
			if (describedBy.length > 0) {
				control.setAttribute('aria-describedby', describedBy.join(' '))
			} else {
				control.removeAttribute('aria-describedby')
			}
			if (originalDescriptions.some((id) => oldErrorIds.has(id))) {
				control.removeAttribute('aria-invalid')
				clearServerValidationValue(control)
			}
		}
		this.form.querySelectorAll('[data-tui-validation-message]').forEach((message) => {
			message.remove()
		})

		const responseControls = this.getValidationControls(responseForm)
		let firstInvalidControl: ValidationControl | null = null
		const nameTypeOccurrences = new Map<string, number>()

		for (const responseControl of responseControls) {
			if (responseControl instanceof HTMLInputElement && responseControl.type === 'file')
				continue

			const nameTypeKey = `${responseControl.tagName}:${responseControl.name}:${'type' in responseControl ? responseControl.type : ''}`
			const occurrence = nameTypeOccurrences.get(nameTypeKey) ?? 0
			nameTypeOccurrences.set(nameTypeKey, occurrence + 1)

			const currentControl = this.findCurrentControl(
				responseControl,
				currentControls,
				nameTypeKey,
				occurrence,
			)
			if (!currentControl || responseControl.getAttribute('aria-invalid') !== 'true') continue

			const describedBy = (responseControl.getAttribute('aria-describedby') ?? '').split(
				/\s+/,
			)
			const validationMessageIds: Array<string> = []
			for (const id of describedBy) {
				if (!id) continue
				const responseMessage = responseForm.querySelector<HTMLElement>(
					`#${CSS.escape(id)}`,
				)
				if (!responseMessage?.hasAttribute('data-tui-validation-message')) continue

				let currentMessage = this.form.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
				if (!currentMessage) {
					currentMessage = responseMessage.cloneNode(true) as HTMLElement
					currentControl.insertAdjacentElement('afterend', currentMessage)
				} else {
					currentMessage.innerHTML = responseMessage.innerHTML
				}
				validationMessageIds.push(id)
			}

			currentControl.setAttribute('aria-invalid', 'true')
			setServerValidationValue(currentControl, currentControl.value)
			const currentDescriptions = (currentControl.getAttribute('aria-describedby') ?? '')
				.split(/\s+/)
				.filter(Boolean)
			const mergedDescriptions = [
				...new Set([...currentDescriptions, ...validationMessageIds]),
			]
			if (mergedDescriptions.length > 0) {
				currentControl.setAttribute('aria-describedby', mergedDescriptions.join(' '))
			}
			firstInvalidControl ??= currentControl
		}

		return firstInvalidControl
	}

	private getValidationControls(form: HTMLFormElement): Array<ValidationControl> {
		return Array.from(form.elements).filter(
			(element): element is ValidationControl =>
				element instanceof HTMLInputElement ||
				element instanceof HTMLSelectElement ||
				element instanceof HTMLTextAreaElement,
		)
	}

	private findCurrentControl(
		responseControl: ValidationControl,
		currentControls: Array<ValidationControl>,
		nameTypeKey: string,
		occurrence: number,
	): ValidationControl | null {
		if (responseControl.id) {
			const matchById = currentControls.find((control) => control.id === responseControl.id)
			if (matchById) return matchById
		}

		if (!responseControl.name) return null
		const matchingControls = currentControls.filter((control) => {
			const controlNameTypeKey = `${control.tagName}:${control.name}:${'type' in control ? control.type : ''}`
			return controlNameTypeKey === nameTypeKey
		})
		return matchingControls[occurrence] ?? null
	}

	private clearPendingMessageTimer() {
		if (this.pendingMessageTimer === null) return
		clearTimeout(this.pendingMessageTimer)
		this.pendingMessageTimer = null
	}

	private setAnnouncement(content: string) {
		if (!this.announce) return
		this.clearAnnouncementTimer()

		if (this.announce.innerHTML !== content) {
			this.announce.innerHTML = content
			return
		}

		this.announce.innerHTML = ''
		this.announcementTimer = setTimeout(() => {
			if (this.announce) this.announce.innerHTML = content
			this.announcementTimer = null
		}, this.repeatedAnnouncementDelay)
	}

	private clearAnnouncementTimer() {
		if (this.announcementTimer === null) return
		clearTimeout(this.announcementTimer)
		this.announcementTimer = null
	}
}

TUIAjaxForm.define()
