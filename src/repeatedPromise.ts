export default class RepeatedPromise<T> {
	private value: T
	private promise!: Promise<T>
	private resolve!: (value: T) => void

	constructor(initialValue: T) {
		this.value = initialValue
		this.initializePromise()
	}

	public get Value(): T {
		return this.value
	}

	public get Promise(): Promise<T> {
		return this.promise
	}

	public setValue(value: T): void {
		this.value = value
		this.resolve(value)
		this.initializePromise()
	}

	private initializePromise(): void {
		this.promise = new Promise(resolve => {
			this.resolve = resolve
		})
	}
}