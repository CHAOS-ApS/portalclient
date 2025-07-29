export enum SessionRequirement {
	none,
	basic,
	authenticated
}

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

export interface ISession {
	Id: string
	UserGuid?: string
	DateCreated: number
	DateModified: number
	Tokens: {
		Access: string | null
		Refresh: string | null
	}
}

export interface IBooleanResult {
	WasSuccess: boolean
}

export type ErrorHandler = (error: IServiceError) => Promise<boolean>
