import {Extension} from "../index"
import type {ServiceCall} from "../serviceCall"

export default abstract class AuthenticationExtension extends Extension {
	public abstract readonly authenticationType: string

	protected setAuthenticated(): void {
		this.client.setAuthenticated(this.authenticationType)
	}

	protected setUnauthenticated(): void {
		this.client.setAuthenticated(null)
	}

	protected setAuthenticatedOnSuccess<T>(call: ServiceCall<T>): ServiceCall<T> {
		return this.onSuccess(call, () => this.setAuthenticated())
	}

	protected setUnauthenticatedOnSuccess<T>(call: ServiceCall<T>): ServiceCall<T> {
		return this.onSuccess(call, () => this.setUnauthenticated())
	}
}
