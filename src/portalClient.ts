import {ISession} from "./data"
import ExtensionHandler from "./extensions/extensionHandler"

export class PortalClient {

	public readonly servicePath: string
	public readonly call: ExtensionHandler

	// tslint:disable-next-line
	private _session: ISession | null = null
	// tslint:disable-next-line
	private readonly _protocolVersion: number = 6
	private authenticationType: string | null = null

	constructor(servicePath: string, protocolVersion: number = 6) {
		this.servicePath = this.getServicePath(servicePath)
		this._protocolVersion = protocolVersion
		this.call = new ExtensionHandler(this)
	}

	public get hasSession(): boolean {
		return this.authenticationType !== null
	}

	public get session(): ISession | null {
		return this._session
	}

	public get protocolVersion(): number {
		return this._protocolVersion
	}

	public get isAuthenticated(): boolean {
		return this.authenticationType !== null
	}

	public updateSession(session: ISession | null): void {
		this._session = session

		if (session == null)
			this.setAuthenticated(null)
	}

	public setAuthenticated(type: string | null): void {
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
