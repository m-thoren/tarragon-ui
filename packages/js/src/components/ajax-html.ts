import { Component, tuiAttribute } from '../constants'
import { QueryResult, queryCache } from '../query-cache'

customElements.define(
	Component.AjaxHtml.Name,
	class extends HTMLElement {
		private queryKey: string | null = null
		private unsubscribe: (() => void) | null = null
		private initialFetchTriggered = false // To prevent multiple fetch calls
		private intersectionObserver: IntersectionObserver | null = null
		private staleTime: number | undefined

		connectedCallback() {
			this.queryKey = this.getAttribute(tuiAttribute('query-key'))
			if (!this.queryKey) {
				console.warn(`${Component.AjaxHtml.Name} requires a "query-key" attribute.`, this)
				return
			}

			this.staleTime = this.hasAttribute(tuiAttribute('stale-time'))
				? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					parseInt(this.getAttribute(tuiAttribute('stale-time'))!, 10)
				: undefined

			this.unsubscribe = queryCache.subscribe(
				this.queryKey,
				(queryResult) => {
					this.renderContent(queryResult)
				},
				{ staleTime: this.staleTime },
			)

			const load = this.getAttribute(tuiAttribute('load-strategy'))
			if (load) {
				switch (load) {
					case 'server-side':
						this.initialFetchTriggered = true
						break
					case 'initial':
						this.triggerInitialFetch()
						break
					case 'lazy':
						this.intersectionObserver = new IntersectionObserver(
							this.handleIntersection,
							{ rootMargin: '0px 0px 100px 0px' },
						)
						this.intersectionObserver.observe(this)
						break
					case 'defer':
						document.addEventListener('DOMContentLoaded', this.handleDomContentLoaded, {
							once: true,
						})
						break
				}
			} else {
				this.initialFetchTriggered = true
			}
		}

		disconnectedCallback() {
			if (this.unsubscribe) {
				this.unsubscribe()
			}
			document.removeEventListener('DOMContentLoaded', this.handleDomContentLoaded)
			if (this.intersectionObserver) {
				this.intersectionObserver.unobserve(this)
				this.intersectionObserver.disconnect()
				this.intersectionObserver = null
			}
		}

		private handleDomContentLoaded = () => {
			this.triggerInitialFetch()
		}

		private handleIntersection = (entries: Array<IntersectionObserverEntry>) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					this.triggerInitialFetch()
					if (this.intersectionObserver) {
						this.intersectionObserver.unobserve(this)
					}
				}
			})
		}

		private triggerInitialFetch() {
			if (!this.queryKey) return
			if (this.initialFetchTriggered) return
			this.initialFetchTriggered = true

			// Fetch the data. The QueryCache handles staleness, loading, etc.
			queryCache.invalidateQuery(this.queryKey)
		}

		private renderContent(queryResult: QueryResult) {
			if (!this.initialFetchTriggered) return
			if (!queryResult.data) return
			if (queryResult.data.type !== 'html') return

			const document = queryResult.data.document

			const newElem = document.querySelector(`#${this.id}`)
			if (newElem && newElem.id === this.id) {
				this.innerHTML = newElem.innerHTML
				return
			}

			if (document.body.innerHTML.trim().length > 0) {
				this.innerHTML = document.body.innerHTML
				return
			}

			if (!queryResult.isFetching) {
				this.innerHTML = '<p>No results found.</p>'
			}
		}
	},
)
