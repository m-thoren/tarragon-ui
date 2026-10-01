import { FetchSuccess, fetchClient } from '@/utils/fetch'

type QueryData = FetchSuccess | undefined

// QueryResult represents the complete state for a query
export type QueryResult = {
	data: QueryData // The actual fetched data (HTML Document or JSON), or null
	isFetching: boolean // Specifically for when data is being fetched (can be loading for first time, or fetching a stale query)
	error: string | null // Any error from the last fetch
}

type SubscriberCallback = (result: QueryResult) => void

class QueryCache {
	private static instance: QueryCache | undefined = undefined
	private cache = new Map<string, QueryResult>()
	private subscriptions = new Map<string, Set<SubscriberCallback>>()

	public static getInstance(): QueryCache {
		QueryCache.instance ??= new QueryCache()
		return QueryCache.instance
	}

	// Centralized state update logic
	private updateQueryState(key: string, options: Partial<QueryResult>): void {
		const prevQueryResult = this.cache.get(key)

		// Initialize with default state if no previous query exists
		const baseState: QueryResult = prevQueryResult
			? { ...prevQueryResult }
			: {
					data: undefined,
					isFetching: false,
					error: null,
				}

		const updatedState = { ...baseState, ...options }

		this.cache.set(key, updatedState)
		this.notifySubscribers(key, updatedState)
	}

	private notifySubscribers(key: string, result: QueryResult) {
		this.subscriptions.get(key)?.forEach((callback) => {
			callback(result)
		})
	}

	/**
	 * Subscribes to a query key.
	 * @param key The query key.
	 * @param callback The function to call when the query's data or state updates.
	 * @returns An unsubscribe function.
	 */
	public subscribe(key: string, callback: SubscriberCallback): () => void {
		if (!this.subscriptions.has(key)) {
			this.subscriptions.set(key, new Set())
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const subscription = this.subscriptions.get(key)!

		subscription.add(callback)

		// Ensure query state exists and options are applied, then fetch if needed
		this.updateQueryState(key, {})

		const currentState = this.cache.get(key)
		if (currentState) {
			// Immediately provide current state
			callback(currentState)
		}

		return () => {
			this.subscriptions.get(key)?.delete(callback)
			if (this.subscriptions.get(key)?.size === 0) {
				this.subscriptions.delete(key)
			}
		}
	}

	/**
	 * Gets the current state of a query.
	 * @param key The query key.
	 * @returns The current QueryResult, or undefined if not initialized.
	 */
	public get(key: string): QueryResult | undefined {
		const query = this.cache.get(key)
		if (!query) return undefined
		return query
	}

	/**
	 * Sets the data for a query key and notifies subscribers.
	 * This is used for pushing data without fetching (e.g., from mutations/forms).
	 * @param key The query key.
	 * @param data The data to set.
	 * @param options Options for this query.
	 */
	public setQueryData(key: string, data: QueryData) {
		this.updateQueryState(key, {
			data: data,
			error: null,
			isFetching: false,
		})
	}

	/**
	 * Fetches data for a query key. This is an internal method called by subscribe/invalidate.
	 * It ensures only one fetch is active at a time for a given key.
	 */
	private async fetchQuery(key: string): Promise<void> {
		const existingQuery = this.cache.get(key)
		if (!existingQuery) {
			return
		}

		if (existingQuery.isFetching) {
			return
		}

		// Mark as loading/fetching
		this.updateQueryState(key, {
			isFetching: true, // Always true when a fetch is in progress
			error: null,
		})

		const [fetchError, fetchSuccess] = await fetchClient.get(key)

		if (fetchError) {
			this.updateQueryState(key, {
				error: fetchError.message,
				isFetching: false,
			})
			return
		}

		this.updateQueryState(key, {
			data: fetchSuccess,
			isFetching: false,
			error: null,
		})
		return
	}

	/**
	 * Invalidates a query, triggering an immediate refetch
	 * @param key The query key.
	 */
	public invalidateQuery(key: string) {
		const existingQuery = this.cache.get(key)
		if (!existingQuery) {
			console.warn(`No query exists for key: ${key}`)
			return
		}

		if (!existingQuery.isFetching) {
			void this.fetchQuery(key)
		}
	}
}

export const queryCache = QueryCache.getInstance()
