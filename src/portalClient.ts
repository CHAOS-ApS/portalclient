import {ISession} from "./data"
import ExtensionHandler from "./extensions/extensionHandler"
import RepeatedPromise from "./repeatedPromise"

export default class PortalClient {

	public readonly servicePath: string
	public readonly call: ExtensionHandler

	// tslint:disable-next-line
	private _session: RepeatedPromise<ISession | null>
	// tslint:disable-next-line
	private readonly _protocolVersion: number = 6
	private authenticationType: RepeatedPromise<string | null>

	private whenSessionIsAvailable!: Promise<void>
	private whenSessionIsAuthenticated!: Promise<string>

	constructor(servicePath: string, protocolVersion: number = 6) {
		this.servicePath = PortalClient.getServicePath(servicePath)
		this._protocolVersion = protocolVersion
		this._session = new RepeatedPromise<ISession | null>(null)
		this.authenticationType = new RepeatedPromise<string | null>(null)
		this.call = new ExtensionHandler(this)
	}

	public get hasSession(): boolean {
		return this.session !== null
	}

	public get session(): ISession | null {
		return this._session.value
	}

	public get protocolVersion(): number {
		return this._protocolVersion
	}

	public get isAuthenticated(): boolean {
		return this.authenticationType.value !== null
	}

	public get whenHasSession(): Promise<ISession> {
		return this._session.whenNotNull() as Promise<ISession>
	}

	public get whenIsAuthenticated(): Promise<string> {
		return this.authenticationType.whenNotNull() as Promise<string>
	}

	public updateSession(session: ISession | null): void {
		PortalClient.fixSession(session)

		this._session.value = session

		if (session == null)
			this.setAuthenticated(null)
	}

	public setAuthenticated(type: string | null): void {
		this.authenticationType.value = type
	}

	private static fixSession(session: ISession | null): void { // Fix if API is old version
		if (session === null || session.Id)
			return

		session.Id = (session as any).Guid
	}

	private static getServicePath(value: string): string {
		if (value === null || value === "")
			throw new Error("Parameter servicePath can't be empty")

		if (value.substr(value.length - 1, 1) !== "/")
			value += "/"

		return value
	}
}
