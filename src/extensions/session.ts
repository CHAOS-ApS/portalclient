import {PortalClient} from "../portalClient"
import ServiceCall, {HttpMethod, SessionRequirement} from "../serviceCall"
import {ISession} from "../data"
import Extension from "./extension"

export default class Session extends Extension {
	protected readonly extensionName: string = "session"

	public Create(): ServiceCall<ISession> {
		const call = this.call<ISession>("create", null, HttpMethod.Get, SessionRequirement.none)

		call.response.then(r => {
			this.client.updateSession(r.Body!.Results[0])
		})

		return call
	}
}

declare module "../portalClient" {
	// tslint:disable-next-line
	interface PortalClient {
		session: Session
	}
}

Extension.add(Session)
