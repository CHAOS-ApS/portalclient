import {AuthenticationExtension, HttpMethod, IBooleanResult, IServiceCall, IUser, SessionRequirement} from "index"

export default class EmailPassword extends AuthenticationExtension {
	public readonly authenticationType = "EmailPassword"
	protected readonly extensionName = "EmailPassword"

	public login(email: string, password: string): IServiceCall<IUser> {
		return this.setAuthenticatedOnSuccess(this.call<IUser>("Login", {email, password}, HttpMethod.Post, SessionRequirement.basic))
	}

	public setPassword(userGuid: string, newPassword: string): IServiceCall<IBooleanResult> {
		return this.call("SetPassword", {userGuid, newPassword}, HttpMethod.Post, SessionRequirement.basic)
	}
}
