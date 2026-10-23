import { Component, NativeEvent, fail, ok, tuiAttribute } from '@/utils/constants'
import { QueryResult, queryCache } from '@/utils/query-cache'
import { ComponentBase } from '../component-base'
import { fetchClient } from '@/utils/fetch'

class TUIAjaxHtml extends ComponentBase {
	static readonly componentName = Component.AjaxHtml.Name

	private queryKey: string | null = null
	private unsubscribe: (() => void) | null = null
	private initialFetchTriggered = false // To prevent multiple fetch calls
	private cacheVersion = 0
	private intersectionObserver: IntersectionObserver | null = null

	protected setup() {
		if (!this.id) {
			return fail('Missing id attribute')
		}

		this.queryKey = this.getAttribute(tuiAttribute('query-key'))
		if (!this.queryKey) {
			return fail('Missing query-key attribute')
		}

		this.unsubscribe = queryCache.subscribe(this.queryKey, (queryResult) => {
			if (queryResult.data) {
				this.cacheVersion += 1
				this.initialFetchTriggered = true
			}
			this.renderContent(queryResult)
		})

		const load = this.getAttribute(tuiAttribute('load-strategy'))
		if (load) {
			switch (load) {
				case 'server-side':
					this.initialFetchTriggered = true
					break
				case 'initial':
					void this.triggerInitialFetch()
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
		void this.triggerInitialFetch()
	}

	private handleIntersection = (entries: Array<IntersectionObserverEntry>) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				void this.triggerInitialFetch()
				if (this.intersectionObserver) {
					this.intersectionObserver.unobserve(this)
				}
			}
		})
	}

	private async triggerInitialFetch() {
		if (!this.queryKey) return
		if (this.initialFetchTriggered) return
		this.initialFetchTriggered = true
		const currentQuery = queryCache.get(this.queryKey)
		if (currentQuery?.data) {
			this.renderContent(currentQuery)
			return
		}

		const url = this.getAttribute(tuiAttribute('url'))
		if (!url) {
			this.logError({ message: 'Missing url attribute' })
			return
		}

		const cacheVersionAtFetchStart = this.cacheVersion
		const [error, response] = await fetchClient.get(url)
		if (this.cacheVersion !== cacheVersionAtFetchStart) return
		if (typeof error === 'object') {
			this.logError(error)
			return
		}
		queryCache.setQueryData(this.queryKey, response)
	}

	private renderContent(queryResult: QueryResult) {
		if (!this.initialFetchTriggered) return
		if (!queryResult.data) return

		const resultDocument = queryResult.data

		const newElem = resultDocument.querySelector(`#${this.id}`)
		if (newElem?.id === this.id) {
			this.innerHTML = newElem.innerHTML
			this.emit(Component.AjaxHtml.Event.Render)
			return
		}

		if (resultDocument.body.innerHTML.trim().length > 0) {
			this.innerHTML = resultDocument.body.innerHTML
			this.emit(Component.AjaxHtml.Event.Render)
			return
		}

		if (!queryResult.isFetching) {
			this.innerHTML = '<p>No results found.</p>'
		}
	}
}

TUIAjaxHtml.define()
