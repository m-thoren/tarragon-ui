import { Result } from './constants'

type Method = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

type Headers = Record<string, string>

type FetchParameters = {
	queryParameters?: URLSearchParams
	headers?: Headers
	data?: BodyInit
}

type FetchError = { message: string; error?: Error; status?: number }

export type FetchSuccess =
	| {
			type: 'json'
			message?: string | null
			redirectUrl?: string | null
			queryKey?: string
	  }
	| {
			type: 'html'
			document: Document
	  }

type FetchResult = Promise<Result<FetchError, FetchSuccess>>

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
			}

			// Add body only for methods that typically use it
			if (method !== 'GET' && 'data' in parameters && parameters.data) {
				requestOptions.body = parameters.data
			}

			const fetchResponse = await fetch(fullUrl, requestOptions)

			if (!fetchResponse.ok) {
				const errorData: FetchError = {
					message: 'Request failed',
					status: fetchResponse.status,
				}

				const contentType = fetchResponse.headers.get('content-type')
				if (contentType?.includes('application/json')) {
					try {
						const jsonError = (await fetchResponse.json()) as {
							message?: string
							error?: string
						}
						errorData.message =
							jsonError.message ?? jsonError.error ?? errorData.message
						// Optionally, you might want to include the raw error object if it's detailed
					} catch (jsonParseError) {
						errorData.message = `Failed to parse error JSON: ${errorData.message}`
						errorData.error =
							jsonParseError instanceof Error
								? jsonParseError
								: new Error(String(jsonParseError))
					}
				} else {
					// For other content types (like text/html for errors), we might just get text
					const errorText = await fetchResponse.text()
					if (errorText) {
						errorData.message = `Server responded with an error: ${errorText.substring(0, 100)}` // Truncate for brevity
					}
				}
				return [errorData, undefined]
			}

			// If the response is OK, process the successful body
			const contentType = fetchResponse.headers.get('content-type')
			if (contentType?.includes('application/json')) {
				const json = (await fetchResponse.json()) as FetchSuccess
				return [undefined, json]
			} else if (contentType?.includes('text/html')) {
				const htmlText = await fetchResponse.text()
				const document = new DOMParser().parseFromString(htmlText, 'text/html')
				return [undefined, { type: 'html', document }]
			} else if (contentType?.includes('text/plain')) {
				const text = await fetchResponse.text()
				return [undefined, { type: 'json', message: text }] // Wrap plain text in FetchSuccess
			}
			// If no specific content type, return an empty success or default message
			return [undefined, { type: 'json', message: 'Request successful, no content.' }]
		} catch (error: unknown) {
			if (error instanceof Error) {
				return [{ message: 'Network error', error }, undefined]
			}
			return [{ message: 'An unknown error occurred' }, undefined]
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
