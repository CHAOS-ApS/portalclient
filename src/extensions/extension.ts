// tslint:disable:max-classes-per-file

import PortalClient, {ExtensionHandler, HttpMethod, SessionRequirement} from "../index"
import type {IServiceParameters, ISession} from "../index"
import {ServiceCall} from "../serviceCall"

export type IExtensionConstructor<T extends IExtension> = new (client: PortalClient) => T

// tslint:disable-next-line:no-empty-interface
export interface IExtension {

}

export default abstract class Extension implements IExtension {
	protected abstract readonly extensionName: string

	constructor(protected client: PortalClient) {}

	protected call<T>(methodName: string | null, parameters: IServiceParameters | null, method: HttpMethod, sessionRequirement: SessionRequirement, headers: Record<string, string> | undefined, returnBlob: false): ServiceCall<T>
	protected call(methodName: string | null, parameters: IServiceParameters | null, method: HttpMethod, sessionRequirement: SessionRequirement, headers: Record<string, string> | undefined, returnBlob: true): ServiceCall<Blob>
	protected call<T>(methodName: string | null, parameters: IServiceParameters | null = null, method: HttpMethod = HttpMethod.Get, sessionRequirement: SessionRequirement = SessionRequirement.basic, headers?: Record<string, string>, returnBlob: boolean = false): ServiceCall<T> {
		const path = methodName !== null ? `${this.extensionName}/${methodName}` : this.extensionName
		return new ServiceCall<T>(this.client, path, parameters, method, sessionRequirement, headers, returnBlob)
	}

	protected onSuccess<T>(call: ServiceCall<T>, onSuccess: (value: T) => void): ServiceCall<T> {
		call.response.then(onSuccess, () => {}) // Empty catch to prevent unhandled rejections from this branch of the promise
		return call
	}

	protected updateSessionFromId(id: string): void {
		this.updateSession({
			Id: id,
			DateCreated: Math.round(new Date().getTime() / 1000),
			DateModified: Math.round(new Date().getTime() / 1000),
		})
	}

	protected clearSession(): void {
		this.updateSession(null)
	}

	protected updateSession(session: ISession | null): void {
		this.client.updateSession(session)
	}

	public static add<T extends IExtension>(extensionConstructor: IExtensionConstructor<T>, extensionName: string): void {
		ExtensionHandler.add(extensionConstructor, extensionName)
	}

	protected static dateToIsoString(value: Date): string {
		return ServiceCall.dateToIsoString(value)
	}

	protected static encodeParameter(value: string): string | number | Blob | null {
		return ServiceCall.encodeParameter(value, true)
	}
}

