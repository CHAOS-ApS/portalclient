import PortalClient, {IServiceParameters, SessionRequirement, IServiceError, IServiceCall, HttpMethod} from "./index"

export class ServiceCall<T> implements IServiceCall<T> {
	private static readonly sessionParameterName = "sessionGUID"
	private static readonly formatParameterName = "format"
	private static readonly formatParameterValue = "json3"

	public readonly response: Promise<T>
	private _error: IServiceError | null = null

	private readonly client: PortalClient

	public get error(): IServiceError | null {
		return this._error
	}

	constructor(client: PortalClient, path: string, parameters: IServiceParameters | null = null, method: HttpMethod, sessionRequirement: SessionRequirement, protocolVersion?: string) {
		this.client = client

		this.response = this.createFetch(path, parameters, method, sessionRequirement)
			.then(r => this.createResponse(r))
			.catch(reason => {
				this._error = ServiceCall.createServiceError(reason)
				throw reason
			})
	}

	private createFetch(path: string, parameters: IServiceParameters | null, method: HttpMethod, sessionRequirement: SessionRequirement, protocolVersion?: string): Promise<Response> {
		const url = new URL(this.getUrlToExtension(path, protocolVersion))
		parameters = ServiceCall.handleStandardParameters(parameters)
		this.handleSessionParameter(path, parameters, sessionRequirement)
		this.encodeParameters(parameters)

		const request: RequestInit = {
			method: method === HttpMethod.Get ? "GET" : "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "omit",
			redirect: "follow",
		}

		if (method === HttpMethod.Get) {
			url.search = new URLSearchParams(parameters).toString()
		}
		else if(method === HttpMethod.Post) {
			const body = new FormData()
			Object.keys(parameters).forEach(key => body!.append(key, parameters![key]))
			request.body = body
		} else if(method === HttpMethod.PostJson) {
			request.body = JSON.stringify(parameters)
			request.headers = {"Content-Type": "application/json"}
		} else
			throw new Error("Unknown http method: " + method)

		return fetch(url.toString(), request)
	}

	private handleSessionParameter(path: string, parameters: IServiceParameters, sessionRequirement: SessionRequirement): void {
		if (sessionRequirement !== SessionRequirement.none) {
			if (!this.client.hasSession)
				throw new Error(`A session is required for "${path}"`)
			parameters[ServiceCall.sessionParameterName] = this.client.session!.Id

			if (sessionRequirement === SessionRequirement.authenticated && !this.client.isAuthenticated)
				throw new Error(`An authenticated session is required for "${path}"`)
		}
	}

	private getUrlToExtension(path: string, protocolVersion?: string): string {
		return this.client.servicePath + "v" + (protocolVersion !== undefined ? protocolVersion : this.client.defaultProtocolVersion) + "/" + path
	}

	private createResponse(response: Response): Promise<T> {
		if (response.ok)
			return response.json()

		if(response.status === 400)
			return response.json().then(error => {
				this._error = error as IServiceError
				throw new Error(this._error.Message)
			})

		this._error = ServiceCall.createServiceErrorFromString(`Service returned ${response.status}: ${response.statusText}`)

		return Promise.reject(this._error.Message)
	}

	private encodeParameters(parameters: IServiceParameters) {
		for (const key in parameters) { // tslint:disable-line:forin
			const value = parameters[key]

			if (value === undefined || value === null) {
				delete parameters[key]
				continue
			}

			switch (typeof value) {
				case "boolean":
					parameters[key] = value ? "True" : "False"
					break
				case "object":
					if (value instanceof Date)
						parameters[key] = ServiceCall.dateToIsoString(value)
					else if (value instanceof String || value instanceof Number)
						parameters[key] = value.toString()
					else if (!(value instanceof Blob)) // Don"t encode Blobs (including Files)
						parameters[key] = JSON.stringify(value)
					break
				case "symbol":
					throw new Error("A Symbol is not a valid parameter")
				case "function":
					throw new Error("A Function not a valid parameter")
				case "number":
					break
			}

		}
	}

	public static dateToIsoString(value: Date): string {
		return value.toISOString().slice(0, -1) + "0000Z"
	}

	private static createServiceError(reason: Error): IServiceError {
		return this.createServiceErrorFromString(reason.message)
	}

	private static createServiceErrorFromString(message: string): IServiceError {
		return {
			Code: "",
			Message: message
		}
	}

	private static handleStandardParameters(parameters: IServiceParameters | null): IServiceParameters {
		if (parameters === null)
			parameters = {}

		parameters[ServiceCall.formatParameterName] = ServiceCall.formatParameterValue

		return parameters
	}
}
