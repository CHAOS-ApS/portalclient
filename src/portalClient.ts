import {ISession} from "./data"

export default class PortalClient {
	public readonly protocolVersion = "6"
	public readonly servicePath: string

	private _session: ISession | null = null
	private authenticationType: string | null = null

	constructor(servicePath: string) {
		if (servicePath === null || servicePath === "")
			throw new Error("Parameter servicePath can't be empty")

		if(servicePath.substr(servicePath.length -1, 1) !== "/")
			servicePath += "/";

		this.servicePath = servicePath
	}

	public get hasSession(): boolean {
		return this.authenticationType !== null
	}

	public get session(): ISession | null {
		return this._session
	}

	public get isAuthenticated(): boolean {
		return this.authenticationType !== null
	}

	public updateSession(session: ISession): void {
		this._session = session
	}

	public setAuthenticated(type: string): void {
		this.authenticationType = type
	}
}
