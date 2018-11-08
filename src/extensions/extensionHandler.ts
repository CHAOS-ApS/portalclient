import {PortalClient} from "../portalClient"
import {IExtension, IExtensionConstructor} from "./extension"
import Session from "./session"

export default class ExtensionHandler {
	private extensionMap: {[key: string]: IExtension} = {}

	constructor(public client: PortalClient) {

	}

	public get session(): Session {
		return this.getExtension(Session, "session")
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
