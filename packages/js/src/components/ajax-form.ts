import { Component, SECOND } from '../constants'
import { emitEvent } from '../emitEvent'
import { fetchClient } from '../fetch'
import { queryCache } from '../query-cache'

customElements.define(
	Component.AjaxForm.Name,
	class extends HTMLElement {
		private form: HTMLFormElement | null = null
		private announce: HTMLDivElement | null = null
		private announceTitle: HTMLHeadingElement | null = null
		private spinner: HTMLDivElement | null = null
		private messageSubmitting = 'Submitting...'
		private messageSuccess = 'Data submitted successfully'
		private messageError = 'An error occurred'
		private actionOnSuccess: 'none' | 'remove-form' | 'remove-message' = 'none'
		private keepFields = false
		private queryKeyToInvalidate: string | null = null

		private readonly isSubmittingAttribute = 'is-submitting'

		connectedCallback() {
			this.form = this.querySelector('form')
			if (!this.form) return
			const existingAnnounce = this.querySelector<HTMLDivElement>('[role="status"]')
			if (existingAnnounce) {
				this.announce = existingAnnounce
				this.announceTitle = existingAnnounce.querySelector('.alert-title')
			} else {
				this.announce = document.createElement('div')
				this.announce.setAttribute('role', 'status')

				this.announceTitle = document.createElement('p')
				this.announceTitle.className = 'alert-title'
				this.announce.append(this.announceTitle)

				this.append(this.announce)
			}

			// Define options
			this.messageSubmitting =
				this.getAttribute('message-submitting') ?? this.messageSubmitting
			this.messageSuccess = this.getAttribute('message-success') ?? this.messageSuccess
			this.messageError = this.getAttribute('message-error') ?? this.messageError
			this.keepFields = this.hasAttribute('keep-fields')
			this.queryKeyToInvalidate = this.getAttribute('query-key')

			const actionOnSuccess = this.getAttribute('action-on-success')
			if (actionOnSuccess === 'remove-form') {
				this.actionOnSuccess = 'remove-form'
			} else if (actionOnSuccess === 'remove-message') {
				this.actionOnSuccess = 'remove-message'
			}

			this.spinner = document.createElement('div')
			this.spinner.className = 'loading'
			this.spinner.innerHTML = `<div class="spinner"></div>`
			this.append(this.spinner)

			// Listen for events
			this.form.addEventListener('submit', this)
		}

		disconnectedCallback() {
			this.form?.removeEventListener('submit', this)
		}

		async handleEvent(event: Event) {
			if (event.type === 'submit') {
				await this.handleSubmit(event)
			}
		}

		private async handleSubmit(event: Event) {
			if (!this.form) return

			event.preventDefault()

			if (this.isDisabled()) return
			this.disable()

			this.showStatus(this.messageSubmitting, 'pending')

			const { action, method } = this.form

			if (!fetchClient.isMethod(method)) {
				console.error('Method is not a valid value')
				this.showStatus(this.messageError, 'error')
				return
			}

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

			this.enable()
			submittingElement?.focus()

			if (error) {
				console.error('An error occurred', error)
				this.showStatus(this.messageError, 'error')
				return
			}

			if (this.actionOnSuccess === 'remove-form') {
				this.form.remove()
			}

			if (!this.keepFields) {
				this.reset()
			}

			if (response.type === 'html') {
				if (!this.queryKeyToInvalidate) return
				queryCache.setQueryData(this.queryKeyToInvalidate, response)
				this.showStatus(this.messageSuccess, 'success')
				return
			}

			this.showStatus(response.message ?? this.messageSuccess, 'success')

			if (response.redirectUrl) {
				window.location.href = response.redirectUrl
				return
			}

			if (response.queryKey) {
				queryCache.invalidateQuery(response.queryKey)
			}
			if (this.queryKeyToInvalidate) {
				queryCache.invalidateQuery(this.queryKeyToInvalidate)
			}

			emitEvent(Component.AjaxForm.Name, Component.AjaxForm.Event.Form, this)
		}

		private disable() {
			this.setAttribute(this.isSubmittingAttribute, '')
		}

		private enable() {
			this.removeAttribute(this.isSubmittingAttribute)
		}

		private isDisabled(): boolean {
			return this.hasAttribute(this.isSubmittingAttribute)
		}

		private showStatus(msg: string, status: 'success' | 'error' | 'pending') {
			if (!this.announce || !this.announceTitle) return

			this.announceTitle.textContent = msg
			this.showStatusIcon(status)

			switch (status) {
				case 'success':
					this.announce.className = 'alert alert-success'
					if (this.actionOnSuccess === 'remove-message') {
						setTimeout(() => {
							if (!this.announce || !this.announceTitle) return
							this.announceTitle.textContent = ''
							this.announce.className = ''
							this.showStatusIcon('pending')
						}, 6 * SECOND)
					}
					break
				case 'error':
					this.announce.className = 'alert alert-danger'
					break
				case 'pending':
					this.announce.className = 'alert visually-hidden'
					break
			}
		}

		private showStatusIcon(status: 'success' | 'error' | 'pending') {
			if (!this.announce) return

			const successIcon = this.announce.querySelector('[data-announce-success-icon]')
			const errorIcon = this.announce.querySelector('[data-announce-error-icon]')

			switch (status) {
				case 'success':
					successIcon?.removeAttribute('hidden')
					errorIcon?.setAttribute('hidden', '')
					break
				case 'error':
					successIcon?.setAttribute('hidden', '')
					errorIcon?.removeAttribute('hidden')
					break
				case 'pending':
					successIcon?.setAttribute('hidden', '')
					errorIcon?.setAttribute('hidden', '')
					break
			}
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
	},
)
