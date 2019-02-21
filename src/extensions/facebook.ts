import {HttpMethod, IServiceCall, SessionRequirement, AuthenticationExtension, ISession} from "index"

export default class Facebook extends AuthenticationExtension {
	public readonly authenticationType = "Facebook"
	protected readonly extensionName = "Facebook"

	public login(signedRequest: string, userAccessToken: string): IServiceCall<ISession> {
		return this.setAuthenticatedOnSuccess(this.call("Login", {signedRequest, userAccessToken}, HttpMethod.Post, SessionRequirement.basic))
	}
}
