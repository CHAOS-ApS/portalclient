import {PortalClient} from "../portalClient"
import {IExtensionConstructor} from "./extension"

export interface IExtensionHandler {

}

export class ExtensionHandler implements IExtensionHandler {
	constructor(private client: PortalClient) {

	}

	public static add(extensionConstructor: IExtensionConstructor): void {
		Object.defineProperty(ExtensionHandler.prototype, extensionConstructor.prototype.constructor.name, {
			get(this: ExtensionHandler ) {
				return new extensionConstructor(this.client)
			},
		})
	}
}
