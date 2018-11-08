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

	protected call<T>(methodName: string, parameters: IParameters | null, method: HttpMethod = HttpMethod.Get, sessionRequirement: SessionRequirement = SessionRequirement.basic): ServiceCall<T> {
		return new ServiceCall<T>(this.client, `${this.extensionName}/${methodName}`, parameters, HttpMethod.Get, sessionRequirement)
	}

	public static add<T>(extensionConstructor: IExtensionConstructor<T>, extensionName: string): void {
		ExtensionHandler.add(extensionConstructor, extensionName)
	}
}
