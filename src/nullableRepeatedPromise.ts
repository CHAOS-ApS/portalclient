import RepeatedPromise from "./repeatedPromise"

export default class NullableRepeatedPromise<T> extends RepeatedPromise<T | null> {
	constructor(initialValue: T | null = null) {
		super(initialValue)
	}

	public async whenNotNull(): Promise<T> {
		return this.value !== null ? this.value! : (await this.promise)!
	}
}
