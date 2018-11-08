import {PortalClient} from "../portalClient"
import {IExtension, IExtensionConstructor} from "./extension"

export default class ExtensionHandler {
	private extensionMap:{[key:string]: IExtension} = {}

	constructor(public client: PortalClient) {

	}

	private getExtension(extensionConstructor: IExtensionConstructor, extensionName: string): IExtension {
		if (!this.extensionMap.hasOwnProperty(extensionName))
			this.extensionMap[extensionName] = new extensionConstructor(this.client)

		return this.extensionMap[extensionName]
	}

	public static add(extensionConstructor: IExtensionConstructor, extensionName: string): void {
		Object.defineProperty(ExtensionHandler.prototype, extensionName, {
			get(this: ExtensionHandler ) {
				return this.getExtension(extensionConstructor, extensionName)
			},
		})
	}
}
