import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {ISession} from "../data"
import Extension from "./extension"

export default class Session extends Extension {
	protected readonly extensionName: string = "Session"

	public create(): IServiceCall<ISession> {
		const call = this.call<ISession>("Create", null, HttpMethod.Get, SessionRequirement.none)

		call.response.then(r => {
			this.client.updateSession(r.Body!.Results[0])
		})

		return call
	}

	public get(): IServiceCall<ISession> {
		const call = this.call<ISession>("Create", null, HttpMethod.Get, SessionRequirement.basic)

		call.response.then(r => {
			this.client.updateSession(r.Body!.Results[0])
		})

		return call
	}

	public update(): IServiceCall<ISession> {
		const call = this.call<ISession>("Update", null, HttpMethod.Get, SessionRequirement.basic)

		call.response.then(r => {
			this.client.updateSession(r.Body!.Results[0])
		})

		return call
	}

	public delete(): IServiceCall<ISession> {
		const call = this.call<ISession>("Delete", null, HttpMethod.Get, SessionRequirement.basic)

		call.response.then(r => {
			this.client.updateSession(null)
		})

		return call
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
