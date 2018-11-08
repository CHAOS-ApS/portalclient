import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import {AuthenticationExtension} from "./extension"
import {IBooleanResult, ISession} from "../data"
import {IUser} from "./user"

export default class AuthKey extends AuthenticationExtension {
	public readonly authenticationType = "AuthKey"
	protected readonly extensionName = "AuthKey"

	public create(name: string): IServiceCall<IAuthKey> {
		return this.call("Create", {name}, HttpMethod.Post, SessionRequirement.authenticated)
	}

	public login(token: string): IServiceCall<ISession> {
		return this.setAuthenticatedOnSuccess(this.call("Login", {token}, HttpMethod.Post, SessionRequirement.basic))
	}

	public get(): IServiceCall<IAuthKey> {
		return this.call("Get", null, HttpMethod.Get, SessionRequirement.authenticated)
	}

	public delete(name: string): IServiceCall<IBooleanResult> {
		return this.call("Delete", {name}, HttpMethod.Post, SessionRequirement.authenticated)
	}
}

export interface IAuthKey {
	Name: string
	Token: string
	UserGuid: string
}
