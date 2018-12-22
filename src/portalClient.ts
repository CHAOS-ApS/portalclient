import {ISession} from "./data"
import ExtensionHandler from "./extensions/extensionHandler"
import RepeatedPromise from "./repeatedPromise"

export class PortalClient {

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
		this.servicePath = this.getServicePath(servicePath)
		this._protocolVersion = protocolVersion
		this._session = new RepeatedPromise<ISession | null>(null)
		this.authenticationType = new RepeatedPromise<string | null>(null)
		this.call = new ExtensionHandler(this)
	}

	public get hasSession(): boolean {
		return this.authenticationType !== null
	}

	public get session(): ISession | null {
		return this._session.Value
	}

	public get protocolVersion(): number {
		return this._protocolVersion
	}

	public get isAuthenticated(): boolean {
		return this.authenticationType.Value !== null
	}

	public get whenHasSession(): Promise<void> {
		return this._session.Value
			? Promise.resolve()
			: this._session.Promise.then(()=>{})
	}

	public get whenIsAuthenticated(): Promise<string> {
		return this.authenticationType.Value !== null
			? Promise.resolve(this.authenticationType.Value)
			: this.authenticationType.Promise as Promise<string>
	}

	public updateSession(session: ISession | null): void {
		this._session.setValue(session)

		if (session == null)
			this.setAuthenticated(null)
	}

	public setAuthenticated(type: string | null): void {
		this.authenticationType.setValue(type)
	}

	private getServicePath(value: string): string {
		if (value === null || value === "")
			throw new Error("Parameter servicePath can't be empty")

		if (value.substr(value.length - 1, 1) !== "/")
			value += "/"

		return value
	}
}
