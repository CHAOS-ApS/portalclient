import {ErrorHandler, ExtensionHandler, ISession} from "./index"
import NullableRepeatedPromise from "./nullableRepeatedPromise"

export default class PortalClient {
	private static readonly defaultSessionParameterName = "sessionId"

	public readonly servicePath: string
	public readonly call: ExtensionHandler
	public readonly errorHandler: ErrorHandler | null = null
	public readonly sessionIdParameterName: string
	public readonly sessionIdMatchedCallMethod: boolean

	// tslint:disable-next-line
	private _session: NullableRepeatedPromise<ISession>
	// tslint:disable-next-line
	private readonly _defaultProtocolVersion: string
	// tslint:disable-next-line
	private _authenticationType: NullableRepeatedPromise<string>

	public get hasSession(): boolean {
		return this.session !== null
	}

	public get session(): ISession | null {
		return this._session.value
	}

	public get defaultProtocolVersion(): string {
		return this._defaultProtocolVersion
	}

	public get authenticationType(): string | null {
		return this._authenticationType.value
	}

	public get isAuthenticated(): boolean {
		return this._authenticationType.value !== null
	}

	public get whenHasSession(): Promise<ISession> {
		return this._session.whenNotNull()
	}

	public get whenIsAuthenticated(): Promise<string> {
		return this._authenticationType.whenNotNull()
	}

	public get whenIsAuthenticatedChange(): Promise<boolean> {
		return this._authenticationType.promise.then(type => type !== null)
	}

	constructor(
		servicePath: string,
		defaultProtocolVersion: string,
		errorHandler: ErrorHandler | null = null,
		sessionIdParameterName: string = PortalClient.defaultSessionParameterName,
		sessionIdMatchedCallMethod = false) {
		this.servicePath = PortalClient.getServicePath(servicePath)
		this._defaultProtocolVersion = defaultProtocolVersion
		this.errorHandler = errorHandler
		this.sessionIdParameterName = sessionIdParameterName
		this.sessionIdMatchedCallMethod = sessionIdMatchedCallMethod
		this._session = new NullableRepeatedPromise()
		this._authenticationType = new NullableRepeatedPromise()
		this.call = new ExtensionHandler(this)
	}

	public updateSession(session: ISession | null): void {
		PortalClient.fixSession(session)
		this._session.value = session

		if (session === null)
			this.setAuthenticated(null)
	}

	public setAuthenticated(type: string | null): void {
		this._authenticationType.value = type
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
