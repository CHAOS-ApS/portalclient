import PortalClient, {HttpMethod, IServiceCall, IServiceError, IServiceParameters, ServiceError, SessionRequirement} from "./index"
import errorCode from "./errorCode"

export class ServiceCall<T> implements IServiceCall<T> {
	public static readonly searchParameterPrefix = "_"
	private static readonly maxAttempts = 5
	private static readonly initialRetryDelay = 2000
	private static readonly retryDelayIncrease = 2

	public readonly response: Promise<T>
	// tslint:disable-next-line:variable-name
	private _error: IServiceError | null = null
	// tslint:disable-next-line:variable-name
	private _attempts = 0
	private hasUsedErrorHandler = false

	private readonly client: PortalClient

	public get error(): IServiceError | null {
		return this._error
	}
	public get attempts(): number {
		return this._attempts
	}

	constructor(client: PortalClient, path: string, parameters: IServiceParameters | null = null, method: HttpMethod, sessionRequirement: SessionRequirement, protocolVersion?: string) {
		this.client = client

		this.response = this.callAndHandle(method, () => this.createFetch(path, parameters, method, sessionRequirement, protocolVersion)
			.then(
				r => this.createResponse(r),
				reason => {
					this._error = ServiceCall.createServiceError(reason)
					throw reason
				}))
	}

	private async callAndHandle(method: HttpMethod, call: () => Promise<T>): Promise<T> {
		try {
			this._attempts++
			return await call()
		} catch (reason) {
			if (this._error === null)
				throw reason

			if (this.shouldRetry(method, this._error)) {
				await this.delayRetry()
				this._error = null
				return this.callAndHandle(method, call)
			}

			if (this.client.errorHandler === null || this.hasUsedErrorHandler)
				throw reason

			this.hasUsedErrorHandler = true
			let wasHandled = false

			try {
				wasHandled = await this.client.errorHandler(this._error)
			} catch (innerReason) {
				throw new Error("Error handler failed itself: " + (innerReason as any)?.message)
			}

			if (wasHandled) {
				this._error = null
				return this.callAndHandle(method, call)
			}

			throw reason // Error wasn't handled
		}
	}

	private createFetch(path: string, parameters: IServiceParameters | null, method: HttpMethod, sessionRequirement: SessionRequirement, protocolVersion?: string): Promise<Response> {
		const url = new URL(this.getUrlToExtension(path, protocolVersion))
		const hasBody = ServiceCall.hasBody(method)
		const sessionInBody = this.client.sessionIdMatchesCallMethod && hasBody
		parameters = parameters ?? {}

		const searchParameters = ServiceCall.encodeParameters(ServiceCall.extractSearchParameters(parameters, !hasBody), false)
		const bodyParameters = ServiceCall.encodeParameters(parameters, !ServiceCall.isJson(method))

		this.handleSessionParameter(path, sessionInBody ? bodyParameters : searchParameters, sessionRequirement)

		url.search = new URLSearchParams(searchParameters).toString()
		const request = ServiceCall.createRequest(method)

		switch (method) {
			case HttpMethod.Get:
			case HttpMethod.Delete:
				break
			case HttpMethod.Post:
			case HttpMethod.Put:
				request.body = ServiceCall.createFormDataBody(bodyParameters)
				break
			case HttpMethod.PostJson:
			case HttpMethod.PutJson:
			case HttpMethod.PatchJson:
				request.body = JSON.stringify(bodyParameters)
				request.headers = {"Content-Type": "application/json"}
				break
			default:
				throw new Error("Unknown http method: " + method)
		}

		return fetch(url.toString(), request)
	}

	private handleSessionParameter(path: string, parameters: IServiceParameters, sessionRequirement: SessionRequirement): IServiceParameters {
		if (sessionRequirement !== SessionRequirement.none) {
			if (!this.client.hasSession)
				throw new Error(`A session is required for "${path}"`)
			parameters[this.client.sessionIdParameterName] = this.client.session!.Id

			if (sessionRequirement === SessionRequirement.authenticated && !this.client.isAuthenticated)
				throw new Error(`An authenticated session is required for "${path}"`)
		}

		return parameters
	}

	private getUrlToExtension(path: string, protocolVersion?: string): string {
		return this.client.servicePath + "v" + (protocolVersion !== undefined ? protocolVersion : this.client.defaultProtocolVersion) + "/" + path
	}

	private createResponse(response: Response): Promise<T> {
		if (response.ok) {
			if (response.status === 204)
				return Promise.resolve() as any as Promise<T>
			return response.json()
		}

		if (response.status >= 400 && response.status < 500)
			return this.handleError(response, (reason, statusCode) => ServiceCall.createServiceErrorFromString(`Failed to parse error object from ${response.status} "${response.statusText}" response: ${reason}`, statusCode))

		if (response.status >= 500 && response.status < 600)
			return this.handleError(response, (reason, statusCode) => ServiceCall.createServiceErrorFromResponse(response, statusCode))

		this._error = ServiceCall.createServiceErrorFromResponse(response, response.status)

		return Promise.reject(new ServiceError(this._error))
	}

	private handleError(response: Response, createError: (reason: string, statusCode: number) => IServiceError): Promise<T> {
		return response.json().then(error => {
			this._error = ServiceCall.normalizeServiceError(error, response.status)
			throw new ServiceError(this._error)
		}, reason => {
			this._error = createError(reason, response.status)
			throw new ServiceError(this._error)
		})
	}

	private shouldRetry(method: HttpMethod, error: IServiceError): boolean {
		if (this.attempts === ServiceCall.maxAttempts || error.StatusCode === undefined || error.StatusCode < 500 || error.StatusCode > 599)
			return false

		return method === HttpMethod.Get || error.StatusCode === 502 || error.StatusCode === 503 || error.StatusCode === 504
	}

	private delayRetry(): Promise<void> {
		return new Promise(resolve => {
			setTimeout(resolve, this.attempts * ServiceCall.retryDelayIncrease * ServiceCall.initialRetryDelay)
		})
	}

	public static dateToIsoString(value: Date): string {
		return value.toISOString().slice(0, -5) + "Z"
	}

	public static encodeParameter(value: any, encodeObject: boolean): string | number | Blob | null {
		if (value === null)
			return null

		switch (typeof value) {
			case "number":
			case "string":
				return value
			case "boolean":
				return value ? "True" : "False"
			case "object":
				if (value instanceof Date)
					return ServiceCall.dateToIsoString(value)
				else if (value instanceof String)
					return value.toString()
				else if (value instanceof Number)
					return value.valueOf()
				else if (encodeObject && !(value instanceof Blob)) // Don"t encode Blobs (including Files)
					return JSON.stringify(value)
				return value
			case "symbol":
				throw new Error("A Symbol is not a valid parameter")
			case "function":
				throw new Error("A Function not a valid parameter")
			case "undefined":
				throw new Error("A undefined value is not a valid parameter")
		}

		throw new Error(`Can't encode unknown parameter of type: ${typeof value}` )
	}

	private static encodeParameters(parameters: IServiceParameters, encodeObject: boolean): IServiceParameters {
		for (const key in parameters) { // tslint:disable-line:forin
			const value = parameters[key]

			if (value === undefined) {
				delete parameters[key]
				continue
			}

			parameters[key] = this.encodeParameter(value, encodeObject)
		}

		return parameters
	}

	private static extractSearchParameters(parameters: IServiceParameters, inPlace: boolean): IServiceParameters {
		const result: IServiceParameters = inPlace ? parameters : {}

		for (const key in parameters) { // tslint:disable-line:forin
			if (key[0] !== this.searchParameterPrefix)
				continue

			const value = parameters[key]

			if (value === undefined)
				continue

			delete parameters[key]
			const cleanKey = key.substring(1)

			result[cleanKey] = value
		}

		return result
	}

	private static createRequest(method: HttpMethod): RequestInit {
		return {
			method: this.getMethodString(method),
			mode: "cors",
			cache: "no-cache",
			credentials: "omit",
			redirect: "follow",
		}
	}

	private static hasBody(method: HttpMethod): boolean {
		switch (method) {
			case HttpMethod.Get:
			case HttpMethod.Delete:
				return false
			case HttpMethod.Post:
			case HttpMethod.PostJson:
			case HttpMethod.Put:
			case HttpMethod.PutJson:
			case HttpMethod.PatchJson:
				return true
		}
	}

	private static isJson(method: HttpMethod): boolean {
		switch (method) {
			case HttpMethod.Get:
			case HttpMethod.Delete:
			case HttpMethod.Post:
			case HttpMethod.Put:
				return false
			case HttpMethod.PostJson:
			case HttpMethod.PutJson:
			case HttpMethod.PatchJson:
				return true
		}
	}

	private static getMethodString(method: HttpMethod): string {
		switch (method) {
			case HttpMethod.Get:
				return "GET"
			case HttpMethod.Delete:
				return "DELETE"
			case HttpMethod.Post:
			case HttpMethod.PostJson:
				return "POST"
			case HttpMethod.Put:
			case HttpMethod.PutJson:
				return "PUT"
			case HttpMethod.PatchJson:
				return "PATCH"
		}
	}

	private static createFormDataBody(parameters: IServiceParameters): FormData {
		const body = new FormData()
		Object.keys(parameters).forEach(key => body!.append(key, parameters![key]))
		return body
	}

	private static createServiceErrorFromString(message: string, statusCode?: number): IServiceError {
		return {
			Code: errorCode.externalError,
			Message: message,
			StatusCode: statusCode
		}
	}

	private static createServiceError(error: Error, statusCode?: number): IServiceError {
		return this.createServiceErrorFromString(error.message, statusCode)
	}

	private static createServiceErrorFromResponse(response: Response, statusCode: number): IServiceError {
		return ServiceCall.createServiceErrorFromString(`Service returned ${response.status}: ${response.statusText}`, statusCode)
	}

	private static normalizeServiceError(error: IServiceError | any, status: number): IServiceError {
		if ("Message" in error && "Code" in error)
			return {Message: error.Message, Code: error.Code, StatusCode: status}

		const message =
			typeof error === "string"
			? error
			: "Message" in error
				? error.Message
				: "message" in error
					? error.message
					: "title" in error
						? "errors" in error
							? error.title + ": " + JSON.stringify(error.errors)
							: error.title
						: "Unparsable error"

		return {Message: message, Code: errorCode.externalError, StatusCode: status}
	}
}
