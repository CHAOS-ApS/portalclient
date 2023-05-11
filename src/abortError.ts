export default class AbortError extends Error {
	public static readonly errorName = "AbortError"
	public readonly innerError: Error

	constructor(inner: Error) {
		super(inner.message)
		this.innerError = inner
		this.name = AbortError.name

		Object.setPrototypeOf(this, AbortError.prototype)
	}
}
