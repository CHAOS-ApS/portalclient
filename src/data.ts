export enum SessionRequirement {
	none,
	basic,
	authenticated
}

export enum HttpMethod {
	Get,
	Post,
	PostJson
}

export interface IServiceCall<T> {
	readonly response: Promise<T>
	readonly error: IServiceError | null
}

export interface IServiceParameters {
	[index: string]: any
}

export interface IServiceError {
	Code: string
	Message: string
	ErrorCode: number | null
}

export interface ISession {
	Id: string
	UserGuid?: string
	DateCreated: number
	DateModified: number
}

export interface IBooleanResult {
	WasSuccess: boolean
}
