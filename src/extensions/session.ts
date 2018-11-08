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
}

Extension.add(Session, "session")

declare module "./extensionHandler" {
	// tslint:disable-next-line
	interface ExtensionHandler {
		session: Session
	}
}
