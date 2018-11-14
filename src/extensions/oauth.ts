import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {AuthenticationExtension} from "./extension"
import {ISession} from "../data"

export default class OAuth extends AuthenticationExtension {
	public readonly authenticationType = "OAuth"
	protected readonly extensionName = "OAuth"

	public getLoginEndPoint(callbackUrl: string): IServiceCall<ILoginEndPoint> {
		return this.call("GetLoginEndPoint", {callbackUrl}, HttpMethod.Get, SessionRequirement.basic)
	}

	public processLogin(callbackUrl: string, responseUrl: string, stateCode: string): IServiceCall<ISession> {
		return this.setAuthenticatedOnSuccess(this.call("ProcessLogin", {callbackUrl, responseUrl, stateCode}, HttpMethod.Post, SessionRequirement.basic))
	}
}

export interface ILoginEndPoint
{
	Uri: string;
	StateCode: string;
}