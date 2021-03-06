import PortalClient, {HttpMethod, IServiceCall, IServiceError, IServiceParameters, ServiceError, SessionRequirement} from "./index"

export class ServiceCall<T> implements IServiceCall<T> {
	public readonly response: Promise<T>
	// tslint:disable-next-line:variable-name
	private _error: IServiceError | null = null

	private readonly client: PortalClient

	public get error(): IServiceError | null {
		return this._error
	}

	constructor(client: PortalClient, path: string, parameters: IServiceParameters | null = null, method: HttpMethod, sessionRequirement: SessionRequirement, protocolVersion?: string) {
		this.client = client

		const createFetchAndHandle = () => this.createFetch(path, parameters, method, sessionRequirement, protocolVersion)
			.then(
				r => this.createResponse(r),
				reason => {
					this._error = ServiceCall.createServiceError(reason)
					throw reason
				})

		this.response = createFetchAndHandle()
			.catch(reason => {
				if (this._error === null || this.client.errorHandler === null)
					throw reason

				return this.client.errorHandler(this._error)
					.then(wasHandled => {
						if (!wasHandled)
							throw reason
						return createFetchAndHandle()
					}, innerReason => {
						throw new Error("Error handler failed itself: " + innerReason.message)
					})
			})
	}

	private createFetch(path: string, parameters: IServiceParameters | null, method: HttpMethod, sessionRequirement: SessionRequirement, protocolVersion?: string): Promise<Response> {
		const url = new URL(this.getUrlToExtension(path, protocolVersion))

		parameters = parameters !== null
			? ServiceCall.encodeParameters(parameters, !ServiceCall.isJson(method))
			: {}

		if (this.client.sessionIdMatchedCallMethod && ServiceCall.hasBody(method))
			parameters = this.handleSessionParameter(path, parameters, sessionRequirement)
		else
			url.search = new URLSearchParams(this.handleSessionParameter(path, ServiceCall.hasBody(method) ? {} : parameters, sessionRequirement)).toString()

		const request = ServiceCall.createRequest(method)

		switch (method) {
			case HttpMethod.Get:
			case HttpMethod.Delete:
				break
			case HttpMethod.Post:
			case HttpMethod.Put:
				request.body = ServiceCall.createFormDataBody(parameters)
				break
			case HttpMethod.PostJson:
			case HttpMethod.PutJson:
				request.body = JSON.stringify(parameters)
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
			return this.handleError(response, reason => ServiceCall.createServiceErrorFromString(`Failed to parse error object from ${response.status} "${response.statusText}" response: ${reason}`))

		if (response.status >= 500 && response.status < 600)
			return this.handleError(response, () => ServiceCall.createServiceErrorFromResponse(response))

		this._error = ServiceCall.createServiceErrorFromResponse(response)

		return Promise.reject(new ServiceError(this._error))
	}

	private handleError(response: Response, createError: (reason: string) => IServiceError): Promise<T> {
		return response.json().then(error => {
			this._error = error as IServiceError
			throw new ServiceError(this._error)
		}, reason => {
			this._error = createError(reason)
			throw new ServiceError(this._error)
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

			parameters[key] = this.encodeParameter(parameters[key], encodeObject)
		}

		return parameters
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
		}
	}

	private static createFormDataBody(parameters: IServiceParameters): FormData {
		const body = new FormData()
		Object.keys(parameters).forEach(key => body!.append(key, parameters![key]))
		return body
	}

	private static createServiceErrorFromString(message: string): IServiceError {
		return {
			Code: "",
			Message: message
		}
	}

	private static createServiceError(error: Error): IServiceError {
		return this.createServiceErrorFromString(error.message)
	}

	private static createServiceErrorFromResponse(response: Response): IServiceError {
		return ServiceCall.createServiceErrorFromString(`Service returned ${response.status}: ${response.statusText}`)
	}
}
