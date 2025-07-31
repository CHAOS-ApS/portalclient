// tslint:disable:max-classes-per-file

import type {IServiceParameters} from "../index"
import PortalClient, {BodyEncoding, ExtensionHandler, HttpMethod, ResponseEncoding} from "../index"
import {ServiceCall} from "../serviceCall"

export type IExtensionConstructor<T extends IExtension> = new (client: PortalClient) => T

// tslint:disable-next-line:no-empty-interface
export interface IExtension {

}

export default abstract class Extension implements IExtension {
	protected abstract readonly extensionName: string
	protected client: PortalClient

	protected constructor(client: PortalClient) {
		this.client = client
	}

	protected call<T>(methodName: string | null, parameters: IServiceParameters | null = null, method: HttpMethod = HttpMethod.Get, bodyEncoding: BodyEncoding = BodyEncoding.None, requiresToken: string | boolean = false, headers?: Record<string, string>, responseEncoding: ResponseEncoding = ResponseEncoding.Json, protocolVersion?: string): ServiceCall<T> {
		const path = methodName !== null ? `${this.extensionName}/${methodName}` : this.extensionName
		return new ServiceCall<T>(this.client, path, parameters, method, bodyEncoding, requiresToken, headers, responseEncoding, protocolVersion)
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
