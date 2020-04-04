import type {ErrorCode, IServiceError} from "./index"

export default class ServiceError extends Error {
	public readonly code: ErrorCode

	constructor(serviceError: IServiceError) {
		super(serviceError.Message)
		this.name = "ServiceError"
		this.code = serviceError.Code as ErrorCode
		Object.setPrototypeOf(this, ServiceError.prototype)
	}
}
