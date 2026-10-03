import { Component, NativeEvent, fail, ok, tuiAttribute } from '@/utils/constants'
import { QueryResult, queryCache } from '@/utils/query-cache'
import { ComponentBase } from '../component-base'

class TUIAjaxHtml extends ComponentBase {
	static readonly componentName = Component.AjaxHtml.Name

	private queryKey: string | null = null
	private unsubscribe: (() => void) | null = null
	private initialFetchTriggered = false // To prevent multiple fetch calls
	private intersectionObserver: IntersectionObserver | null = null

	protected setup() {
		if (!this.id) {
			return fail('Missing id attribute')
		}

		this.queryKey = this.getAttribute(tuiAttribute('query-key'))
		if (!this.queryKey) {
			return fail('Missing query-key attribute')
		}

		this.setAttribute('aria-live', 'polite')

		this.unsubscribe = queryCache.subscribe(this.queryKey, (queryResult) => {
			this.renderContent(queryResult)
		})

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
					this.intersectionObserver = new IntersectionObserver(this.handleIntersection, {
						rootMargin: '0px 0px 100px 0px',
					})
					this.intersectionObserver.observe(this)
					break
				case 'defer':
					this.listeners.add(
						document,
						NativeEvent.DOMContentLoaded,
						this.handleDomContentLoaded,
						{
							once: true,
						},
					)
					break
			}
		} else {
			this.initialFetchTriggered = true
		}
		return ok()
	}

	protected cleanup() {
		if (this.unsubscribe) {
			this.unsubscribe()
		}
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
		if (newElem?.id === this.id) {
			this.innerHTML = newElem.innerHTML
			this.emit(Component.AjaxHtml.Event.Render)
			return
		}

		if (document.body.innerHTML.trim().length > 0) {
			this.innerHTML = document.body.innerHTML
			this.emit(Component.AjaxHtml.Event.Render)
			return
		}

		if (!queryResult.isFetching) {
			this.innerHTML = '<p>No results found.</p>'
		}
	}
}

TUIAjaxHtml.define()
