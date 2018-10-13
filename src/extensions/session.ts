import ServiceCall, {HttpMethod, SessionRequirement} from "../serviceCall"
import {ISession} from "../data"
import Extension from "./extension"

export default class Session extends Extension {
	protected readonly extensionName: string = "Session"

	public create(): ServiceCall<ISession> {
		const call = this.call<ISession>("Create", null, HttpMethod.Get, SessionRequirement.none)

		call.response.then(r => {
			this.client.updateSession(r.Body!.Results[0])
		})

		return call
	}
}

declare module "../serviceCall" {
	// tslint:disable-next-line
	interface ServiceCall {
		session: Session
	}
}

Extension.add(Session, "session")
