import { Component, tuiAttribute } from '@/constants'
import { fetchClient } from '@/fetch'
import { queryCache } from '@/query-cache'
import { ready } from '@/ready'

customElements.define(
	Component.AjaxFetch.Name,
	class extends HTMLElement {
		private trigger: HTMLButtonElement | null = null
		private announce: HTMLDivElement | null = null
		private announceTitle: HTMLHeadingElement | null = null
		private spinner: HTMLDivElement | null = null
		private messageSubmitting = 'Submitting...'
		private messageSuccess = 'Data submitted successfully'
		private messageError = 'An error occurred'
		private queryKey: string | null = null

		private readonly isSubmittingAttribute = 'is-submitting'

		connectedCallback() {
			this.trigger = this.querySelector('button')
			if (!this.trigger) return

			this.trigger.type = 'button'

			this.announce = document.createElement('div')
			this.announce.setAttribute('role', 'status')
			this.announce.className = 'visually-hidden'
			this.announceTitle = document.createElement('p')
			this.announce.append(this.announceTitle)
			this.append(this.announce)

			// Define options
			this.messageSubmitting =
				this.getAttribute(tuiAttribute('message-submitting')) ?? this.messageSubmitting
			this.messageSuccess =
				this.getAttribute(tuiAttribute('message-success')) ?? this.messageSuccess
			this.messageError =
				this.getAttribute(tuiAttribute('message-error')) ?? this.messageError
			this.queryKey = this.getAttribute(tuiAttribute('query-key'))

			this.spinner = document.createElement('div')
			this.spinner.className = 'loading'
			this.spinner.innerHTML = `<div class="spinner"></div>`
			this.append(this.spinner)

			// Listen for events
			this.trigger.addEventListener('click', this)
			ready(this)
		}

		disconnectedCallback() {
			this.trigger?.removeEventListener('click', this)
		}

		async handleEvent(event: Event) {
			if (event.type === 'click') {
				await this.handleSubmit()
			}
		}

		private async handleSubmit() {
			if (!this.queryKey) return

			const url = this.getAttribute(tuiAttribute('url'))
			if (!url) return

			if (this.isDisabled()) return
			this.disable()

			this.showStatus('pending')

			const [error, response] = await fetchClient.get(url)

			this.enable()
			this.trigger?.focus()

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

			queryCache.setQueryData(this.queryKey, response)
			this.showStatus('success')
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

		private showStatus(status: 'success' | 'error' | 'pending') {
			if (!this.announce || !this.announceTitle) return

			switch (status) {
				case 'error':
					this.announceTitle.textContent = this.messageError
					break
				case 'pending':
					this.announceTitle.textContent = this.messageSubmitting
					break
				case 'success':
					this.announceTitle.textContent = this.messageSuccess
					break
			}
		}
	},
)
