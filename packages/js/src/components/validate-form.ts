import { Component, libNamePrefix, tuiAttribute, tuiAttributeSelector } from '../constants.js'
import { emitEvent } from '../emitEvent.js'

const groupValidationAttribute = 'validate-group'

customElements.define(
	Component.ValidateForm.Name,
	class extends HTMLElement {
		private form: HTMLFormElement | null = null
		private groups: Array<HTMLElement> | undefined = undefined

		connectedCallback() {
			this.form = this.querySelector('form')
			if (!this.form) {
				console.warn('No form was found')
				return
			}

			// Get fields and groups
			this.groups = Array.from(
				this.form.querySelectorAll(tuiAttributeSelector(groupValidationAttribute)),
			)

			// Suppress default form validation
			this.form.setAttribute('novalidate', '')

			// Listen for events
			this.form.addEventListener('submit', this.onSubmit)
			this.form.addEventListener('input', this.onInput)
			this.form.addEventListener('blur', this.onBlur, { capture: true })

			// Ready
			emitEvent(Component.ValidateForm.Name, Component.ValidateForm.Event.Validate, this)
			this.setAttribute(tuiAttribute('is-ready'), '')
		}

		disconnectedCallback() {
			if (!this.form) return
			this.form.removeEventListener('submit', this.onSubmit)
			this.form.removeEventListener('input', this.onInput)
			this.form.removeEventListener('blur', this.onBlur, { capture: true })
		}

		/**
		 * Handle input events
		 * @param {Event} event The event object
		 */
		private onInput = (event: Event) => {
			if (!(event.target instanceof Element)) return

			// Check if the input is part of a group
			const group = event.target.closest(tuiAttributeSelector(groupValidationAttribute))
			const field = group ?? event.target

			// If a group, set the interacted status
			group?.setAttribute(tuiAttribute(groupValidationAttribute), 'interacted')

			// If the field or group is not currently invalid, do nothing
			if (!group && field.getAttribute('aria-invalid') !== 'true') return

			// Otherwise, re-validate the group or field
			if (group) {
				this.isGroupValid(group)
				return
			}
			this.isFieldValid(field)
		}

		/**
		 * Handle blur events
		 * @param {Event} event The event object
		 */
		private onBlur = (event: Event) => {
			if (!(event.target instanceof Element)) return

			// If it's an input group and its been interacted with, validate the group
			const group = event.target.closest(`[${groupValidationAttribute}="interacted"]`)
			if (group) {
				this.isGroupValid(group)
				return
			}

			// If the field is not :user-invalid, the input has not yet been
			// interacted with or is valid. Remove any errors.
			if (!event.target.matches(':user-invalid')) {
				this.removeError(event.target)
				return
			}

			// Otherwise, show any errors
			this.showError(event.target)
		}

		/**
		 * Handle submit events
		 * @param {Event} event The event object
		 */
		private onSubmit = (event: Event) => {
			// Emit a cancellable event before validating
			const cancelled = !emitEvent(
				Component.ValidateForm.Name,
				Component.ValidateForm.Event.Validate,
				this,
				true,
			)
			if (cancelled) return

			// Check validity and show errors
			const areGroupsValid = this.checkGroupValidity()
			const isValid = this.checkFieldValidity() && areGroupsValid

			// If form is valid, do nothing
			if (isValid) {
				emitEvent(Component.ValidateForm.Name, Component.ValidateForm.Event.Validate, this)
				return
			}

			// Stop form from submitting and prevent other submit events from firing
			event.preventDefault()
			event.stopPropagation()
			event.stopImmediatePropagation()

			// If not valid, focus on the first invalid field
			/** @type {HTMLElement | null | undefined} */
			const firstInvalidField: HTMLElement | null | undefined = this.form?.querySelector(
				'input:invalid, [aria-invalid="true"] :is([type="checkbox"], [type="radio"])',
			)
			// @ts-expect-error focusVisible is not universally supported. Used as a progressive enhancement.
			firstInvalidField?.focus({ focusVisible: true })

			// Emit error
			emitEvent(Component.ValidateForm.Name, Component.ValidateForm.Event.Validate, this)
		}

		/**
		 * Check the validity of fields that can be validated with HTMLFormElement.checkValidity().
		 * Show error messages for fields that are not.
		 *
		 * @return {Boolean} If true, all fields are valid
		 */
		private checkFieldValidity(): boolean {
			// If form is valid, return true immediately
			if (!this.form || this.form.checkValidity()) return true

			// Otherwise, get invalid fields and show errors
			const invalidFields = this.form.querySelectorAll(':invalid')
			for (const field of invalidFields) {
				if (!(field instanceof HTMLElement)) continue
				this.showError(field)
			}

			return false
		}

		/**
		 * Check if an input is valid and show/remove errors
		 * @param  {Element} field The field to validate
		 * @return {Boolean}       If true, field is valid
		 */
		private isFieldValid(field: Element): boolean {
			if (field.matches(':invalid')) {
				this.showError(field)
				return false
			}
			this.removeError(field)
			return true
		}

		/**
		 * Check the validity of all input groups
		 * @return {Boolean} If true, all groups are valid
		 */
		private checkGroupValidity(): boolean {
			if (!this.groups) return true
			let isValid = true
			for (const group of this.groups) {
				if (!(group instanceof HTMLElement)) continue
				if (this.isGroupValid(group)) continue
				isValid = false
			}
			return isValid
		}

		/**
		 * Check if an input group is valid and show/remove errors
		 * @param  {Element} group The input group
		 * @return {Boolean}       If true, the group is valid
		 */
		private isGroupValid(group: Element): boolean {
			if (group.querySelector('input:checked')) {
				this.removeError(group)
				return true
			}
			this.showError(group, true)
			return false
		}

		/**
		 * Show error message on a field
		 * @param  {Element} field   The field or fieldset
		 * @param  {Boolean} isGroup If true, field is a fieldset input group
		 */
		private showError(field: Element, isGroup = false) {
			const errorMsg = this.getMessage(field, isGroup)
			if (!errorMsg) return

			field.setAttribute('aria-invalid', 'true')

			const template = this.querySelector<HTMLTemplateElement>(
				tuiAttributeSelector('validation-message-template'),
			)
			const hasTemplate = !!template
			const existingErrorID = field.getAttribute('aria-describedby')
			const newErrorID = existingErrorID ?? `${libNamePrefix}${crypto.randomUUID()}`

			// Try to find and update an existing error message
			if (existingErrorID) {
				const existingErrorEl = this.form?.querySelector<HTMLElement>(`#${existingErrorID}`)

				if (existingErrorEl) {
					if (hasTemplate) {
						const formMessageEl = existingErrorEl.querySelector(
							tuiAttributeSelector('slot', 'form-message'),
						)
						if (formMessageEl) formMessageEl.textContent = errorMsg
						existingErrorEl.id = newErrorID
						field.setAttribute('aria-describedby', newErrorID)
						return
					}

					existingErrorEl.textContent = errorMsg
					existingErrorEl.id = newErrorID
					field.setAttribute('aria-describedby', newErrorID)
					return
				}
			}

			// If no existing error was found/updated, create a new one
			let errorEl: HTMLElement

			if (hasTemplate) {
				const clonedMessageContent = template.content.cloneNode(true) as DocumentFragment
				errorEl = clonedMessageContent.firstElementChild as HTMLElement
				errorEl.id = newErrorID
				const formMessageEl = errorEl.querySelector(
					tuiAttributeSelector('slot', 'form-message'),
				)
				if (formMessageEl) formMessageEl.textContent = errorMsg
			} else {
				errorEl = document.createElement('p')
				errorEl.textContent = errorMsg
				errorEl.id = newErrorID
				errorEl.className = 'form-message'
			}

			field.setAttribute('aria-describedby', newErrorID)

			if (isGroup) {
				field.append(errorEl)
			} else {
				field.after(errorEl)
			}
		}

		/**
		 * Get the error message text
		 * @param  {Element} field   The field or fieldset
		 * @param  {Boolean} isGroup If true, field is a fieldset input group
		 * @return {String} The error message
		 */
		private getMessage(field: Element, isGroup = false): string {
			const validateMessage = field.getAttribute(tuiAttribute('validate-message'))
			if (validateMessage) return validateMessage

			if (isGroup) {
				const checkboxGroupMessage =
					this.getAttribute(tuiAttribute('checkbox-group-message')) ??
					'Please select at least one option.'
				const radioGroupMessage =
					this.getAttribute(tuiAttribute('radio-group-message')) ??
					'Please select an option.'

				const isCheckbox = field.querySelector('[type="checkbox"]')
				return isCheckbox ? checkboxGroupMessage : radioGroupMessage
			}

			const validationMessage = 'validationMessage' in field ? field.validationMessage : ''
			return validationMessage as string
		}

		/**
		 * Remove the error message from a field
		 * @param  {Element} field The field or fieldset
		 */
		private removeError(field: Element) {
			field.removeAttribute('aria-invalid')
			const id = field.getAttribute('aria-describedby')
			if (!id) return
			this.form?.querySelector(`#${id}`)?.remove()
		}
	},
)
