// tslint:disable:max-classes-per-file

import PortalClient, {ExtensionHandler, HttpMethod, SessionRequirement} from "../index"
import type {IServiceParameters, ISession} from "../index"
import {ServiceCall} from "../serviceCall"

export type IExtensionConstructor<T extends IExtension> = new (client: PortalClient) => T

export interface IExtension {

}

export default abstract class Extension implements IExtension {
	protected abstract readonly extensionName: string

	constructor(protected client: PortalClient) {}

	// tslint:disable-next-line:max-line-length
	protected call<T>(methodName: string | null, parameters: IServiceParameters | null = null, method: HttpMethod = HttpMethod.Get, sessionRequirement: SessionRequirement = SessionRequirement.basic): ServiceCall<T> {
		const path = methodName !== null ? `${this.extensionName}/${methodName}` : this.extensionName
		return new ServiceCall<T>(this.client, path, parameters, method, sessionRequirement)
	}

	protected onSuccess<T>(call: ServiceCall<T>, onSuccess: (value: T) => void): ServiceCall<T> {
		call.response.then(onSuccess)
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

	public static add<T>(extensionConstructor: IExtensionConstructor<T>, extensionName: string): void {
		ExtensionHandler.add(extensionConstructor, extensionName)
	}

	protected static dateToIsoString(value: Date): string {
		return ServiceCall.dateToIsoString(value)
	}

	protected static encodeParameter(value: string): string | number | Blob | null {
		return ServiceCall.encodeParameter(value, true)
	}
}

