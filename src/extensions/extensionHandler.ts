import {PortalClient} from "../portalClient"
import {IExtension, IExtensionConstructor} from "./extension"
import Session from "./session"
import User from "./user"
import EmailPassword from "./emailPassword"
import Facebook from "./facebook"
import SecureCookie from "./secureCookie"
import AuthKey from "./authKey"
import OAuth from "./oauth"

export default class ExtensionHandler {
	private extensionMap: {[key: string]: IExtension} = {}

	constructor(public client: PortalClient) {

	}

	public get session(): Session{
		return this.getExtension(Session, "session")
	}

	public get user(): User {
		return this.getExtension(User, "user")
	}

	public get emailPassword(): EmailPassword {
		return this.getExtension(EmailPassword, "emailPassword")
	}

	public get secureCookie(): SecureCookie {
		return this.getExtension(SecureCookie, "secureCookie")
	}

	public get facebook(): Facebook {
		return this.getExtension(Facebook, "facebook")
	}

	public get authKey(): AuthKey {
		return this.getExtension(AuthKey, "authKey")
	}

	public get oauth(): OAuth {
		return this.getExtension(OAuth, "oauth")
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
