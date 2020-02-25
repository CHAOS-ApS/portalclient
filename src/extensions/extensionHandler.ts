import type PortalClient from "../index"
import type { IExtension, IExtensionConstructor } from "../index"

export default class ExtensionHandler {
	private extensionMap: {[key: string]: IExtension} = {}

	constructor(public client: PortalClient) {

	}

	private getExtension<T extends IExtension>(extensionConstructor: IExtensionConstructor<T>, extensionName: string): T {
		if (!this.extensionMap.hasOwnProperty(extensionName))
			this.extensionMap[extensionName] = new extensionConstructor(this.client)
		return this.extensionMap[extensionName] as T
	}

	public static add<T>(extensionConstructor: IExtensionConstructor<T>, extensionName: string): void {
		Object.defineProperty(ExtensionHandler.prototype, extensionName, {
			get(this: ExtensionHandler) {
				return this.getExtension(extensionConstructor, extensionName)
			},
		})
	}
}
