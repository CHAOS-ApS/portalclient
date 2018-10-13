import {PortalClient} from "../portalClient"
import ServiceCall, {HttpMethod, IParameters, SessionRequirement} from "../serviceCall"
import {ExtensionHandler} from "./extensionHandler"

export interface IExtensionConstructor {
	new (client: PortalClient): IExtension
}

export interface IExtension {

}

export default abstract class Extension implements IExtension {
	protected abstract readonly extensionName: string

	constructor(protected client: PortalClient) {

	}

	protected call<T>(methodName: string, parameters: IParameters | null, method: HttpMethod = HttpMethod.Get, sessionRequirement: SessionRequirement = SessionRequirement.basic): ServiceCall<T> {
		return new ServiceCall<T>(this.client, `${this.extensionName}/${methodName}`, parameters, HttpMethod.Get, sessionRequirement)
	}

	public static add(extensionConstructor: IExtensionConstructor): void {
		ExtensionHandler.add(extensionConstructor)
	}
}
