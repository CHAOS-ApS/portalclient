import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {ISession} from "../data"
import Extension from "./extension"

export default class Session extends Extension {
	protected readonly extensionName = "Session"

	public create(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Create", null, HttpMethod.Get, SessionRequirement.none),
			r => this.client.updateSession(r[0]))
	}

	public get(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Get", null, HttpMethod.Get, SessionRequirement.none),
			r => this.client.updateSession(r[0]))
	}

	public update(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Update", null, HttpMethod.Get, SessionRequirement.none),
			r => this.client.updateSession(r[0]))
	}

	public delete(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Delete", null, HttpMethod.Get, SessionRequirement.none),
			r => this.client.updateSession(null))
	}
}

export {ISession}

/*Extension.add(Session, "session")

declare module "./extensionHandler" {
	// tslint:disable-next-line
	interface ExtensionHandler {
		session: Session
	}
}*/
