import {PortalClient} from "./portalClient"
import {IPagedPortalResult, IPortalResponse} from "./data"

export type Parameters = { [index: string]: any }

export default class ServiceCall<T> {
	private static readonly sessionParameterName = "sessionGUID"
	private static readonly formatParameterName = "format"
	private static readonly formatParameterValue = "json3"

	private readonly client: PortalClient

	public readonly response: Promise<IPortalResponse<IPagedPortalResult<T>>>

	constructor(client: PortalClient, path: string, parameters: Parameters | null = null, method: HttpMethod, sessionRequirement: SessionRequirement) {
		this.client = client

		this.response = this.createFetch(path, parameters, method, sessionRequirement)
			.then(r => this.createResponse(r))
			.catch(reason => this.createErrorResponse(reason))
	}

	private createFetch(path: string, parameters: Parameters | null, method: HttpMethod, sessionRequirement: SessionRequirement): Promise<Response> {
		let url = new URL(this.getUrlToExtension(path))
		parameters = ServiceCall.handleStandardParameters(parameters)
		this.handleSessionParameter(path, parameters, sessionRequirement)

		let body: FormData | undefined = undefined

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
				body: body
			})
	}

	private static handleStandardParameters(parameters: Parameters | null): Parameters {
		if (parameters === null)
			parameters = {}

		parameters[ServiceCall.formatParameterName] = ServiceCall.formatParameterValue

		return parameters
	}

	private handleSessionParameter(path: string, parameters: Parameters, sessionRequirement: SessionRequirement): void {
		if (sessionRequirement !== SessionRequirement.none) {
			if (!this.client.hasSession)
				throw new Error(`A session is required for "${path}"`)
			parameters[ServiceCall.sessionParameterName] = this.client.session!.Guid

			if (sessionRequirement === SessionRequirement.authenticated && !this.client.isAuthenticated)
				throw new Error(`An authenticated session is required for "${path}"`)
		}
	}

	private getUrlToExtension(path: string): string {
		return this.client.servicePath + "v" + this.client.protocolVersion + "/" + path;
	}

	private createResponse(response: Response): Promise<IPortalResponse<IPagedPortalResult<T>>> {
		return response.json()
			.then(r => {
				if (r.Error === null || r.Error.Fullname === null)
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
				Message: reason
			}
		}
	}
}

export enum SessionRequirement {
	none,
	basic,
	authenticated
}

export enum HttpMethod {
	Get,
	Post
}
