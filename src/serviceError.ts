import type {IServiceError} from "./index"

export default class ServiceError extends Error {
	public readonly code: string
	public readonly statusCode: number | null

	constructor(serviceError: IServiceError) {
		super(serviceError.Message)
		this.name = "ServiceError"
		this.code = serviceError.Code
		this.statusCode = serviceError.StatusCode ?? null
		Object.setPrototypeOf(this, ServiceError.prototype)
	}
}
