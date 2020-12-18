import PortalClient from "./portalClient"

export {default as Extension} from "./extensions/extension"
export {default as AuthenticationExtension} from "./extensions/authenticationExtension"
export {default as ExtensionHandler} from "./extensions/extensionHandler"
export {HttpMethod, SessionRequirement} from "./data"
export {default as ErrorCode} from "./errorCode"
export {default as ServiceError} from "./sericeError"

export type {IExtension, IExtensionConstructor} from "./extensions/extension"
export type {ErrorHandler, ISession, IBooleanResult, IEmptyResult, IServiceCall, IServiceError, IServiceParameters } from "./data"

export default PortalClient
