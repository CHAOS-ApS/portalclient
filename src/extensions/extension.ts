// tslint:disable:max-classes-per-file

import PortalClient, {ExtensionHandler, HttpMethod, IServiceParameters, SessionRequirement, ISession} from "../index"
import {ServiceCall} from "../serviceCall"

export type IExtensionConstructor<T extends IExtension> = new (client: PortalClient) => T

export interface IExtension {

}

export default abstract class Extension implements IExtension {
	protected abstract readonly extensionName: string

	constructor(protected client: PortalClient) {

	}

	protected call<T>(methodName: string, parameters: IServiceParameters | null = null, method: HttpMethod = HttpMethod.Get, sessionRequirement: SessionRequirement = SessionRequirement.basic): ServiceCall<T> {
		return new ServiceCall<T>(this.client, `${this.extensionName}/${methodName}`, parameters, method, sessionRequirement)
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
}

