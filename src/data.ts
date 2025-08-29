export enum HttpMethod {
	Get = "GET",
	Post = "POST",
	Put = "PUT",
	Patch = "PATCH",
	Delete = "DELETE"
}

export enum Encoding {
	None,
	FormData,
	Json,
	Blob
}

export type BodyEncoding = Encoding.None | Encoding.FormData | Encoding.Json
export type ResponseEncoding = Encoding.None | Encoding.Blob | Encoding.Json

export interface IServiceCall<T> {
	readonly response: Promise<T>
	readonly error: IServiceError | null
	readonly attempts: number
	readonly token: string | null
	readonly wasAborted: boolean
	abort(reason?: Error): void
}

export interface IServiceParameters {
	[index: string]: any
}

export interface IServiceError {
	readonly Code: string
	readonly StatusCode?: number
	readonly Message: string
}

export type ErrorHandler = (error: IServiceError, token: string | null) => Promise<boolean>
