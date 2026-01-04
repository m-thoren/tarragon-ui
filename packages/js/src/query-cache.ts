import { FetchSuccess, fetchClient } from './fetch'

type QueryData = FetchSuccess | undefined
type QueryMeta = {
	staleTime: number // Time in ms after which data is considered stale. Default 0.
}

// QueryResult represents the complete state for a query
export type QueryResult = {
	data: QueryData // The actual fetched data (HTML Document or JSON), or null
	isFetching: boolean // Specifically for when data is being fetched (can be loading for first time, or fetching a stale query)
	error: string | null // Any error from the last fetch
	meta: QueryMeta // The configuration for this query
}

type SubscriberCallback = (result: QueryResult) => void

// Default values for meta, ensuring all properties are present
const defaultQueryMeta: QueryMeta = {
	staleTime: 0,
}

class QueryCache {
	private static instance: QueryCache | undefined = undefined
	private cache = new Map<string, QueryResult>()
	private subscriptions = new Map<string, Set<SubscriberCallback>>()
	private refetchIntervals = new Map<string, number>()

	public static getInstance(): QueryCache {
		QueryCache.instance ??= new QueryCache()
		return QueryCache.instance
	}

	// Centralized state update logic
	private updateQueryState(
		key: string,
		options: Partial<QueryResult>,
		meta?: Partial<QueryMeta>,
	): void {
		const prevQueryResult = this.cache.get(key)

		// Initialize with default state if no previous query exists
		const baseState: QueryResult = prevQueryResult
			? { ...prevQueryResult }
			: {
					data: undefined,
					isFetching: false,
					error: null,
					meta: { ...defaultQueryMeta },
				}

		if (meta) {
			baseState.meta = { ...baseState.meta, ...meta }
		}

		const updatedState = { ...baseState, ...options }

		updatedState.meta = {
			...defaultQueryMeta,
			...baseState.meta,
		}

		this.cache.set(key, updatedState)
		this.notifySubscribers(key, updatedState)
		this.manageRefetchInterval(key, updatedState.meta.staleTime)
	}

	private notifySubscribers(key: string, result: QueryResult) {
		this.subscriptions.get(key)?.forEach((callback) => {
			callback(result)
		})
	}

	private manageRefetchInterval(key: string, interval: number) {
		const currentIntervalId = this.refetchIntervals.get(key)
		if (currentIntervalId) {
			clearInterval(currentIntervalId)
			this.refetchIntervals.delete(key)
		}

		if (interval && interval > 0) {
			// Only start polling if there are active subscribers
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			if (this.subscriptions.has(key) && this.subscriptions.get(key)!.size > 0) {
				const newIntervalId = window.setInterval(() => {
					this.invalidateQuery(key)
				}, interval)
				this.refetchIntervals.set(key, newIntervalId)
			}
		}
	}

	/**
	 * Subscribes to a query key.
	 * @param key The query key.
	 * @param callback The function to call when the query's data or state updates.
	 * @param options Query options that might affect initial state or refetch behavior.
	 * @returns An unsubscribe function.
	 */
	subscribe(key: string, callback: SubscriberCallback, meta?: Partial<QueryMeta>): () => void {
		if (!this.subscriptions.has(key)) {
			this.subscriptions.set(key, new Set())
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const subscription = this.subscriptions.get(key)!

		subscription.add(callback)

		// Ensure query state exists and options are applied, then fetch if needed
		this.updateQueryState(key, {}, meta)

		const currentState = this.cache.get(key)
		if (currentState) {
			// Immediately provide current state
			callback(currentState)
		}

		// Re-manage interval in case subscription state changed (e.g., first subscriber)
		this.manageRefetchInterval(key, currentState?.meta.staleTime ?? 0)

		return () => {
			this.subscriptions.get(key)?.delete(callback)
			if (this.subscriptions.get(key)?.size === 0) {
				this.subscriptions.delete(key)
				// Stop polling if no more subscribers
				this.manageRefetchInterval(key, 0)
			}
		}
	}

	/**
	 * Gets the current state of a query.
	 * @param key The query key.
	 * @returns The current QueryResult, or undefined if not initialized.
	 */
	get(key: string): QueryResult | undefined {
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
	setQueryData(key: string, data: QueryData, meta?: Partial<QueryMeta>) {
		this.updateQueryState(
			key,
			{
				data: data,
				error: null,
				isFetching: false,
			},
			meta,
		)
	}

	/**
	 * Fetches data for a query key. This is an internal method called by subscribe/invalidate.
	 * It ensures only one fetch is active at a time for a given key.
	 */
	private async fetchQuery(key: string, meta?: Partial<QueryMeta>): Promise<void> {
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
			this.updateQueryState(
				key,
				{
					error: fetchError.message,
					isFetching: false,
				},
				meta,
			)
			return
		}

		this.updateQueryState(
			key,
			{
				data: fetchSuccess,
				isFetching: false,
				error: null,
			},
			meta,
		)
		return
	}

	/**
	 * Invalidates a query, triggering an immediate refetch
	 * @param key The query key.
	 */
	invalidateQuery(key: string) {
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
