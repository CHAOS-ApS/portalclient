export enum HttpMethod {
	Get,
	Post,
	PostJson,
	Put,
	PutJson,
	PatchJson,
	Delete
}

export interface IServiceCall<T> {
	readonly response: Promise<T>
	readonly error: IServiceError | null
}

export interface IServiceParameters {
	[index: string]: any
}

export interface IServiceError {
	readonly Code: string
	readonly StatusCode?: number
	readonly Message: string
}

export type ErrorHandler = (error: IServiceError) => Promise<boolean>
