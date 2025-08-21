import PortalClient from "../index"

export default class AuthenticationTypeChangedEvent extends Event {
	public static readonly eventName = "authenticationTypeChanged"

	public readonly authenticationType: string | null

	public constructor(authenticationType: string | null) {
		super(AuthenticationTypeChangedEvent.eventName, {bubbles: false, cancelable: false, composed: false})
		this.authenticationType = authenticationType
	}
}

declare global {
	interface GlobalEventHandlersEventMap {
		[AuthenticationTypeChangedEvent.eventName]: AuthenticationTypeChangedEvent
	}
}
