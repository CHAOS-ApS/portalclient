import {PortalClient} from "./portalClient"
import {IPagedPortalResult, IPortalResponse} from "./data"

export class ServiceCall<T> implements IServiceCall<T> {
	private static readonly sessionParameterName = "sessionGUID"
	private static readonly formatParameterName = "format"
	private static readonly formatParameterValue = "json3"

	public readonly response: Promise<IPortalResponse<IPagedPortalResult<T>>>
	public readonly result: Promise<T[]>

	private readonly client: PortalClient

	constructor(client: PortalClient, path: string, parameters: IParameters | null = null, method: HttpMethod, sessionRequirement: SessionRequirement) {
		this.client = client

		this.response = this.createFetch(path, parameters, method, sessionRequirement)
			.then(r => this.createResponse(r))
			.catch(reason => this.createErrorResponse(reason))

		this.result = this.response.then(r => {
			if (r.Error !== null)
				throw r.Error.Message
			return r.Body!.Results
		})
	}

	private createFetch(path: string, parameters: IParameters | null, method: HttpMethod, sessionRequirement: SessionRequirement): Promise<Response> {
		const url = new URL(this.getUrlToExtension(path))
		parameters = ServiceCall.handleStandardParameters(parameters)
		this.handleSessionParameter(path, parameters, sessionRequirement)

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
			parameters[ServiceCall.sessionParameterName] = this.client.session!.Guid

			if (sessionRequirement === SessionRequirement.authenticated && !this.client.isAuthenticated)
				throw new Error(`An authenticated session is required for "${path}"`)
		}
	}

	private getUrlToExtension(path: string): string {
		return this.client.servicePath + "v" + this.client.protocolVersion + "/" + path
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

	private static handleStandardParameters(parameters: IParameters | null): IParameters {
		if (parameters === null)
			parameters = {}

		parameters[ServiceCall.formatParameterName] = ServiceCall.formatParameterValue

		return parameters
	}
}

export interface IServiceCall<T> {
	readonly response: Promise<IPortalResponse<IPagedPortalResult<T>>>
	readonly result: Promise<T[]>
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
