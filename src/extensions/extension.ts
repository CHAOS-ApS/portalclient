// tslint:disable:max-classes-per-file

import PortalClient, {BodyEncoding, Encoding, ExtensionHandler, HttpMethod, IServiceParameters, ResponseEncoding} from "../index"
import {ServiceCall} from "../serviceCall"

export type IExtensionConstructor<T extends IExtension> = new (client: PortalClient) => T

// tslint:disable-next-line:no-empty-interface
export interface IExtension {

}

export default abstract class Extension implements IExtension {
	protected abstract readonly extensionName: string
	protected client: PortalClient

	public constructor(client: PortalClient) {
		this.client = client
	}

	protected call<T>(methodName: string | null, parameters: IServiceParameters | null = null, method: HttpMethod = HttpMethod.Get, requiresToken: string | boolean = true, bodyEncoding?: BodyEncoding, responseEncoding?: ResponseEncoding, headers?: Record<string, string>, protocolVersion?: string): ServiceCall<T> {
		const path = methodName !== null ? `${this.extensionName}/${methodName}` : this.extensionName

		if (bodyEncoding === undefined)
			bodyEncoding = method === HttpMethod.Get || method === HttpMethod.Delete || parameters === null ? Encoding.None : Encoding.Json
		if (responseEncoding === undefined)
			responseEncoding = method === HttpMethod.Delete ? Encoding.None : Encoding.Json

		return new ServiceCall<T>(this.client, path, parameters, method, requiresToken, bodyEncoding, responseEncoding, headers, protocolVersion)
	}

	protected onSuccess<T>(call: ServiceCall<T>, onSuccess: (value: T) => void): ServiceCall<T> {
		call.response.then(onSuccess, () => {}) // Empty catch to prevent unhandled rejections from this branch of the promise
		return call
	}

	protected clearAccessToken(): void {
		this.setAccessToken(null, null)
	}

	protected setAccessToken(token: string | null, authenticationType: string | null): void {
		this.client.setAccessToken(token, authenticationType)
	}

	public static add<T extends IExtension>(extensionConstructor: IExtensionConstructor<T>, extensionName: string): void {
		ExtensionHandler.add(extensionConstructor, extensionName)
	}
}
