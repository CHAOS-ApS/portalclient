export default class RepeatedPromise<T> {
	private _value: T // tslint:disable-line:variable-name
	private _promise!: Promise<T> // tslint:disable-line:variable-name
	private resolve!: (value: T) => void

	public get value(): T {
		return this._value
	}

	public set value(value: T) {
		this._value = value
		this.resolve(value)
		this.initializePromise()
	}

	public get promise(): Promise<T> {
		return this._promise
	}

	constructor(initialValue: T) {
		this._value = initialValue
		this.initializePromise()
	}

	private initializePromise(): void {
		this._promise = new Promise(resolve => {
			this.resolve = resolve
		})
	}
}
