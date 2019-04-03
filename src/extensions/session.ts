import {Extension, HttpMethod, IServiceCall, ISession, SessionRequirement} from "../index"

export default class Session extends Extension {
	protected readonly extensionName = "Session"

	public create(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Create", null, HttpMethod.Get, SessionRequirement.none),
			r => this.updateSession(r))
	}

	public get(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Get", null, HttpMethod.Get, SessionRequirement.none),
			r => this.updateSession(r))
	}

	public update(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Update", null, HttpMethod.Get, SessionRequirement.none),
			r => this.updateSession(r))
	}

	public delete(): IServiceCall<ISession> {
		return this.onSuccess(this.call<ISession>("Delete", null, HttpMethod.Get, SessionRequirement.none),
			r => this.clearSession())
	}
}

export {ISession}
