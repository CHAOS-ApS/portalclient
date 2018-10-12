import {PortalClient} from "../portalClient"
import ServiceCall, {HttpMethod, SessionRequirement} from "../serviceCall"
import {ISession} from "../data"
import Extension from "./extension"

export default class Session extends Extension {
	protected readonly extensionName: string = "Session"

	public Create(): ServiceCall<ISession> {
		return this.call("Create", null, HttpMethod.Get, SessionRequirement.none)
	}
}

declare module "../portalClient" {
	interface PortalClient {
		Session: Session
	}
}

Extension.add(Session)