import type {IServiceError} from "./index"

export default class ServiceError extends Error {
	public readonly code: string

	constructor(serviceError: IServiceError) {
		super(serviceError.Message)
		this.name = "ServiceError"
		this.code = serviceError.Code
		Object.setPrototypeOf(this, ServiceError.prototype)
	}
}
