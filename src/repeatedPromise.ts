export default class RepeatedPromise<T> {
	private _value: T
	private _promise!: Promise<T>
	private resolve!: (value: T) => void

	constructor(initialValue: T) {
		this._value = initialValue
		this.initializePromise()
	}

	public get value(): T {
		return this.value
	}

	public set value(value: T) {
		this.value = value
		this.resolve(value)
		this.initializePromise()
	}

	public get promise(): Promise<T> {
		return this.promise
	}

	public async whenNotNull(): Promise<T> {
		return this.value !== null ? this.value : await this.promise
	}

	private initializePromise(): void {
		this._promise = new Promise(resolve => {
			this.resolve = resolve
		})
	}
}