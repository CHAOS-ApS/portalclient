import {ServiceError} from "./index"

enum ErrorCode {
	externalError = "EC-0",
	missingParameter = "EC-99999",
	unexpectedError = "EC-999999999"
}

export function hasServiceErrorCode(error: any, ...codes: string[]): boolean {
	if (!(error instanceof ServiceError))
		return false

	for (const code of codes)
		if (error.code === code)
			return true

	return false
}

export default ErrorCode
