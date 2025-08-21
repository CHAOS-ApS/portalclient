import {AccessTokenChangedEvent, AuthenticationTypeChangedEvent, ErrorHandler, ExtensionHandler} from "./index"

export default class PortalClient extends EventTarget {
	public readonly servicePath: string
	public readonly defaultProtocolVersion: string
	public readonly call: ExtensionHandler
	public readonly errorHandler: ErrorHandler | null = null

	private _accessToken: string | null = null
	private _authenticationType: string | null = null

	public get accessToken(): string | null {
		return this._accessToken
	}

	public get authenticationType(): string | null {
		return this._authenticationType
	}

	public get hasAccessToken(): boolean {
		return this._accessToken !== null
	}

	public get hasAuthenticationType(): boolean {
		return this._authenticationType !== null
	}

	public get whenHasAccessToken(): Promise<void> {
		if (this.hasAccessToken)
			return Promise.resolve()

		return new Promise(resolve => {
			const listener = (event: Event) => {
				this.removeEventListener(AccessTokenChangedEvent.eventName, listener)
				resolve()
			}
			this.addEventListener(AccessTokenChangedEvent.eventName, listener)
		})
	}

	constructor(
		servicePath: string,
		defaultProtocolVersion: string,
		errorHandler: ErrorHandler | null = null) {
		super()
		this.servicePath = PortalClient.getServicePath(servicePath)
		this.defaultProtocolVersion = defaultProtocolVersion
		this.errorHandler = errorHandler
		this.call = new ExtensionHandler(this)
	}

	public setAccessToken(token: string | null, authenticationType: string | null): void {
		if (token === null && this._accessToken === null)
			return

		if (token === null && authenticationType !== null)
			authenticationType = null

		const authChanged = authenticationType !== this._authenticationType
		this._accessToken = token
		this._authenticationType = authenticationType

		this.dispatchEvent(new AccessTokenChangedEvent(token, authenticationType))

		if (authChanged)
			this.dispatchEvent(new AuthenticationTypeChangedEvent(authenticationType))
	}

	private static getServicePath(value: string): string {
		if (value === null || value === "")
			throw new Error("Parameter servicePath can't be empty")

		if (value.slice(value.length - 1, 1) !== "/")
			value += "/"

		return value
	}
}
