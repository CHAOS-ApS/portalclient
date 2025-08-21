import PortalClient from "../index"

export default class AccessTokenChangedEvent extends Event {
	public static readonly eventName = "accessTokenChanged"

	public readonly accessToken: string | null
	public readonly authenticationType: string | null

	public constructor(accessToken: string | null, authenticationType: string | null) {
		super(AccessTokenChangedEvent.eventName, {bubbles: false, cancelable: false, composed: false})
		this.accessToken = accessToken
		this.authenticationType = authenticationType
	}
}

declare global {
	interface GlobalEventHandlersEventMap {
		[AccessTokenChangedEvent.eventName]: AccessTokenChangedEvent
	}
}
