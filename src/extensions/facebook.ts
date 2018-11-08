import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {AuthenticationExtension} from "./extension"
import {IBooleanResult} from "../data"
import {IUser} from "./user"

export default class Facebook extends AuthenticationExtension {
	public readonly authenticationType = "Facebook"
	protected readonly extensionName = "Facebook"

	public login(signedRequest: string, userAccessToken: string): IServiceCall<IBooleanResult> {
		return this.setAuthenticatedOnSuccess(this.call("Login", {signedRequest, userAccessToken}, HttpMethod.Post, SessionRequirement.basic))
	}
}
