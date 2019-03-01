import PortalClient, {IPagedPortalResult, IPortalResponse} from "./index"

export class ServiceCall<T> implements IServiceCall<T> {

	public get results(): Promise<T[]> {
		return this.response.then(r => {
			if (r.Error !== null)
				throw new Error(r.Error.Message)
			return r.Body!.Results
		})
	}

	public get singleResult(): Promise<T> {
		return this.results.then(r => {
			if (r.length === 0)
				throw new Error("No results returned")

			if (r.length !== 1)
				throw new Error(`More than 1 result reutned (${r.length})`)

			return r[0]
		})
	}
	private static readonly sessionParameterName = "sessionGUID"
	private static readonly formatParameterName = "format"
	private static readonly formatParameterValue = "json3"

	public readonly response: Promise<IPortalResponse<IPagedPortalResult<T>>>

	private readonly client: PortalClient

	constructor(client: PortalClient, path: string, parameters: IParameters | null = null, method: HttpMethod, sessionRequirement: SessionRequirement) {
		this.client = client

		this.response = this.createFetch(path, parameters, method, sessionRequirement)
			.then(r => this.createResponse(r))
			.catch(reason => this.createErrorResponse(reason))
	}

	private createFetch(path: string, parameters: IParameters | null, method: HttpMethod, sessionRequirement: SessionRequirement): Promise<Response> {
		const url = new URL(this.getUrlToExtension(path))
		parameters = ServiceCall.handleStandardParameters(parameters)
		this.handleSessionParameter(path, parameters, sessionRequirement)
		this.encodeParameters(parameters)

		let body: FormData | undefined

		if (method === HttpMethod.Get)
			url.search = new URLSearchParams(parameters).toString()
		else {
			body = new FormData()
			Object.keys(parameters).forEach(key => body!.append(key, parameters![key]))
		}

		return fetch(url.toString(),
			{
				method: method === HttpMethod.Get ? "GET" : "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "omit",
				body,
			})
	}

	private handleSessionParameter(path: string, parameters: IParameters, sessionRequirement: SessionRequirement): void {
		if (sessionRequirement !== SessionRequirement.none) {
			if (!this.client.hasSession)
				throw new Error(`A session is required for "${path}"`)
			parameters[ServiceCall.sessionParameterName] = this.client.session!.Id

			if (sessionRequirement === SessionRequirement.authenticated && !this.client.isAuthenticated)
				throw new Error(`An authenticated session is required for "${path}"`)
		}
	}

	private getUrlToExtension(path: string): string {
		return this.client.servicePath + "v" + this.client.protocolVersion.toString(10) + "/" + path
	}

	private createResponse(response: Response): Promise<IPortalResponse<IPagedPortalResult<T>>> {
		return response.json()
			.then(r => {
				if (r.Error !== null && r.Error.Fullname === null)
					r.Error = null

				return r
			})
	}

	private createErrorResponse(reason: string): IPortalResponse<IPagedPortalResult<T>> {
		return {
			Header: null,
			Body: null,
			Error: {
				Fullname: "FetchError",
				Message: reason,
			},
		}
	}

	private encodeParameters(parameters: IParameters) {
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
					else if (!(value instanceof Blob)) // Don't encode Blobs (including Files)
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

	private static handleStandardParameters(parameters: IParameters | null): IParameters {
		if (parameters === null)
			parameters = {}

		parameters[ServiceCall.formatParameterName] = ServiceCall.formatParameterValue

		return parameters
	}
}

export interface IServiceCall<T> {
	readonly response: Promise<IPortalResponse<IPagedPortalResult<T>>>
	readonly results: Promise<T[]>
	readonly singleResult: Promise<T>
}

export interface IParameters {
	[index: string]: any
}

export enum SessionRequirement {
	none,
	basic,
	authenticated,
}

export enum HttpMethod {
	Get,
	Post,
}
