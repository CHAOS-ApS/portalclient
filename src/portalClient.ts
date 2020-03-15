import {ExtensionHandler, ISession} from "./index"
import NullableRepeatedPromise from "./nullableRepeatedPromise"

export default class PortalClient {
	public readonly servicePath: string
	public readonly call: ExtensionHandler

	// tslint:disable-next-line
	private _session: NullableRepeatedPromise<ISession>
	// tslint:disable-next-line
	private readonly _defaultProtocolVersion: string
	private authenticationType: NullableRepeatedPromise<string>

	constructor(servicePath: string, defaultProtocolVersion: string) {
		this.servicePath = PortalClient.getServicePath(servicePath)
		this._defaultProtocolVersion = defaultProtocolVersion
		this._session = new NullableRepeatedPromise()
		this.authenticationType = new NullableRepeatedPromise()
		this.call = new ExtensionHandler(this)
	}

	public get hasSession(): boolean {
		return this.session !== null
	}

	public get session(): ISession | null {
		return this._session.value
	}

	public get defaultProtocolVersion(): string {
		return this._defaultProtocolVersion
	}

	public get isAuthenticated(): boolean {
		return this.authenticationType.value !== null
	}

	public get whenHasSession(): Promise<ISession> {
		return this._session.whenNotNull()
	}

	public get whenIsAuthenticated(): Promise<string> {
		return this.authenticationType.whenNotNull()
	}

	public get whenIsAuthenticatedChange(): Promise<boolean> {
		return this.authenticationType.promise.then(type => type !== null)
	}

	public updateSession(session: ISession | null): void {
		PortalClient.fixSession(session)

		this._session.value = session

		if (session === null)
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
