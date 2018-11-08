import {HttpMethod, IServiceCall, SessionRequirement} from "../serviceCall"
import Extension from "./extension"

export default class User extends Extension {
	protected readonly extensionName = "User"

	public create(guid: string, email: string): IServiceCall<IUser> {
		return this.call<IUser>("Create", {guid, email}, HttpMethod.Post, SessionRequirement.authenticated)
	}

	public update(guid: string, email: string, permissions: number | null = null): IServiceCall<IUser> {
		return this.call<IUser>("Update", {guid, email, permissions}, HttpMethod.Post, SessionRequirement.authenticated)
	}

	public delete(guid: string): IServiceCall<IUser> {
		return this.call<IUser>("Delete", {guid}, HttpMethod.Post, SessionRequirement.authenticated)
	}

	public get(guid: string | null = null, groupGuid: string | null = null): IServiceCall<IUser> {
		return this.call<IUser>("Get", {guid, groupGuid}, HttpMethod.Get, SessionRequirement.basic)
	}

	public getCurrent(): IServiceCall<IUser> {
		return this.call<IUser>("GetCurrent", null, HttpMethod.Get, SessionRequirement.basic)
	}
}

export interface IUser {
	Guid: string
	Email: string
	SystemPermissions: number
	SessionDateCreated: number
	SessionDateModified: number
}
