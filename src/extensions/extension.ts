import {PortalClient} from "../portalClient"
import ServiceCall, {HttpMethod, Parameters, SessionRequirement} from "../serviceCall"
import {ExtensionHandler} from "./extensionHandler"

export interface IExtensionConstructor {
	new (client: PortalClient): IExtension
}

export interface IExtension {

}

export default abstract class Extension implements IExtension {
	constructor(protected client: PortalClient) {

	}

	protected call<T>(path: string, parameters: Parameters | null, method: HttpMethod = HttpMethod.Get, sessionRequirement: SessionRequirement = SessionRequirement.basic): ServiceCall<T> {
		return new ServiceCall<T>(this.client, path, parameters, HttpMethod.Get, sessionRequirement)
	}

	public static add(extensionConstructor: IExtensionConstructor): void {
		ExtensionHandler.add(extensionConstructor);
	}
}
