import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {AuthenticationExtension} from "./extension"
import {IBooleanResult} from "../data"
import {IUser} from "./user"

export default class SecureCookie extends AuthenticationExtension {
	public readonly authenticationType = "SecureCookie"
	protected readonly extensionName = "SecureCookie"

	public create(email: string, password: string): IServiceCall<IUser> {
		return this.call("Create", {email, password}, HttpMethod.Post, SessionRequirement.basic)
	}

	public login(userGuid: string, newPassword: string): IServiceCall<IBooleanResult> {
		return this.setAuthenticatedOnSuccess(this.call("Login", {userGuid, newPassword}, HttpMethod.Post, SessionRequirement.basic))
	}
}
