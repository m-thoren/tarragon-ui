import { Result, fail, ok } from '@/utils/constants'

type Method = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

type Headers = Record<string, string>

type FetchParameters = {
	queryParameters?: URLSearchParams
	headers?: Headers
	data?: BodyInit
	signal?: AbortSignal
}

export type FetchSuccess = Document

type FetchResult = Promise<Result<FetchSuccess>>

export class FetchClient {
	private static instance: FetchClient | undefined = undefined
	private baseHeaders: Headers | undefined = undefined

	constructor(headers: Headers = {}) {
		this.baseHeaders = headers
	}

	// Singleton pattern with initial configuration.
	// Subsequent calls without arguments will return the existing instance.
	// If arguments are provided, it reconfigures the existing instance or creates a new one.
	public static getInstance(headers?: Headers): FetchClient {
		if (!FetchClient.instance) {
			FetchClient.instance = new FetchClient(headers)
		} else {
			if (headers) {
				FetchClient.instance.baseHeaders = {
					...FetchClient.instance.baseHeaders,
					...headers,
				}
			}
		}
		return FetchClient.instance
	}

	public isMethod(value: string): value is Method {
		// Define an array of all valid methods
		const validMethods: Array<Method> = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']

		// Check if the value is included in the array of valid methods
		return validMethods.includes(value.toUpperCase() as Method)
	}

	private buildQueryString(data: URLSearchParams | undefined): string {
		if (!data) return ''
		const queryString = new URLSearchParams(data).toString()
		if (!queryString) return ''
		return `?${queryString}`
	}

	private buildHeaders(headers: Headers | undefined): Headers {
		return {
			...this.baseHeaders,
			...headers,
		}
	}

	public async send(url: string, methodParam: Method, parameters: FetchParameters): FetchResult {
		try {
			const method = methodParam.toUpperCase()
			const queryParameters = this.buildQueryString(parameters.queryParameters)
			const fullUrl = `${url}${queryParameters}`

			const requestOptions: RequestInit = {
				method,
				headers: this.buildHeaders(parameters.headers),
				signal: parameters.signal,
			}

			// Add body only for methods that typically use it
			if (method !== 'GET' && 'data' in parameters && parameters.data) {
				requestOptions.body = parameters.data
			}

			const fetchResponse = await fetch(fullUrl, requestOptions)

			if (!fetchResponse.ok) {
				const contentType = fetchResponse.headers.get('content-type')
				if (contentType?.includes('text/html')) {
					const htmlText = await fetchResponse.text()
					const document = new DOMParser().parseFromString(htmlText, 'text/html')
					return fail({ message: '', data: { document } })
				}
				return fail({
					message: 'Request failed',
					data: { status: fetchResponse.status },
				})
			}

			// If the response is OK, process the successful body
			const contentType = fetchResponse.headers.get('content-type')
			if (contentType?.includes('text/html')) {
				const htmlText = await fetchResponse.text()
				const document = new DOMParser().parseFromString(htmlText, 'text/html')
				return ok(document)
			}
			return fail({
				message: 'Response returned with a content-type that was not "text/html"',
				data: { contentType },
			})
		} catch (error: unknown) {
			if (error instanceof Error) {
				return fail({ message: 'Network error', data: { error } })
			}
			return fail('An unknown error occurred')
		}
	}

	public get(url: string, parameters?: FetchParameters): FetchResult {
		return this.send(url, 'GET', parameters ?? {})
	}

	public put(url: string, parameters?: FetchParameters): FetchResult {
		return this.send(url, 'PUT', parameters ?? {})
	}

	public post(url: string, parameters?: FetchParameters): FetchResult {
		return this.send(url, 'POST', parameters ?? {})
	}

	public patch(url: string, parameters?: FetchParameters): FetchResult {
		return this.send(url, 'PATCH', parameters ?? {})
	}

	public delete(url: string, parameters?: FetchParameters): FetchResult {
		return this.send(url, 'DELETE', parameters ?? {})
	}
}

export const fetchClient = FetchClient.getInstance({
	'Content-Type': 'application/json',
})
