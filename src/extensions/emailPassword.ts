import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {AuthenticationExtension} from "./extension"
import {IBooleanResult} from "../data"
import {IUser} from "./user"

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
