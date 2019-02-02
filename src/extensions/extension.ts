// tslint:disable:max-classes-per-file

import {PortalClient} from "../portalClient"
import {HttpMethod, IParameters, ServiceCall, SessionRequirement} from "../serviceCall"
import ExtensionHandler from "./extensionHandler"

export interface IExtensionConstructor<T extends IExtension> {
	new (client: PortalClient): T
}

export interface IExtension {

}

export default abstract class Extension implements IExtension {
	protected abstract readonly extensionName: string

	constructor(protected client: PortalClient) {

	}

	protected call<T>(methodName: string, parameters: IParameters | null = null, method: HttpMethod = HttpMethod.Get, sessionRequirement: SessionRequirement = SessionRequirement.basic): ServiceCall<T> {
		return new ServiceCall<T>(this.client, `${this.extensionName}/${methodName}`, parameters, method, sessionRequirement)
	}

	protected onSuccess<T>(call: ServiceCall<T>, onSuccess: (value: T[]) => void): ServiceCall<T> {
		call.results.then(onSuccess)
		return call
	}

	public static add<T>(extensionConstructor: IExtensionConstructor<T>, extensionName: string): void {
		ExtensionHandler.add(extensionConstructor, extensionName)
	}
}

export abstract class AuthenticationExtension extends Extension {
	public abstract readonly authenticationType: string

	protected setAuthenticated(): void {
		this.client.setAuthenticated(this.authenticationType)
	}

	protected setUnauthenticated(): void {
		this.client.setAuthenticated(null)
	}

	protected setAuthenticatedOnSuccess<T>(call: ServiceCall<T>): ServiceCall<T> {
		return this.onSuccess(call, () => this.setAuthenticated())
	}

	protected setUnauthenticatedOnSuccess<T>(call: ServiceCall<T>): ServiceCall<T> {
		return this.onSuccess(call, () => this.setUnauthenticated())
	}
}
