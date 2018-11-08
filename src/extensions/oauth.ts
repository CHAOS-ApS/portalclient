import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {AuthenticationExtension} from "./extension"
import {IBooleanResult} from "../data"
import {IUser} from "./user"

export default class OAuth extends AuthenticationExtension {
	public readonly authenticationType = "OAuth"
	protected readonly extensionName = "OAuth"

	public getLoginEndPoint(callbackUrl: string): IServiceCall<IUser> {
		return this.call("GetLoginEndPoint", {callbackUrl}, HttpMethod.Get, SessionRequirement.basic)
	}

	public processLogin(callbackUrl: string, responseUrl: string, stateCode: string): IServiceCall<IBooleanResult> {
		return this.setAuthenticatedOnSuccess(this.call("ProcessLogin", {callbackUrl, responseUrl, stateCode}, HttpMethod.Post, SessionRequirement.basic))
	}
}
