import {ISession} from "./data"
import ExtensionHandler from "./extensions/extensionHandler"

export class PortalClient {
	public readonly protocolVersion = "6"
	public readonly servicePath: string
	public readonly call: ExtensionHandler

	// tslint:disable-next-line
	private _session: ISession | null = null
	private authenticationType: string | null = null

	constructor(servicePath: string) {
		this.servicePath = this.getServicePath(servicePath)
		this.call = new ExtensionHandler(this)
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

	private getServicePath(value: string): string {
		if (value === null || value === "")
			throw new Error("Parameter servicePath can't be empty")

		if (value.substr(value.length - 1, 1) !== "/")
			value += "/"

		return value
	}
}
