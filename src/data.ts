export interface IPortalResponse<TBody> {
	Header: IHeader | null
	Body: TBody | null
	Error: IError | null
}

export interface IHeader {
	Duration: number
}

export interface IPagedPortalResult<T> {
	Count: number
	TotalCount: number
	Results: T[]
}

export interface IError {
	Fullname: string
	Message: string
	Stacktrace?: string
	InnerException?: IError
}

export interface ISession {
	Id: string
	UserGuid: string
	DateCreated: number
	DateModified: number
}

export interface IBooleanResult {
	WasSuccess: boolean
}
