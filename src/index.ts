import PortalClient from "./portalClient"

export {default as Extension} from "./extensions/extension"
export {default as ExtensionHandler} from "./extensions/extensionHandler"
export {HttpMethod, Encoding} from "./data"
export {default as ErrorCode, hasServiceErrorCode} from "./errorCode"
export {default as AbortError} from "./abortError"
export {default as ServiceError} from "./serviceError"
export {default as AccessTokenChangedEvent} from "./events/accessTokenChangedEvent"
export {default as AuthenticationTypeChangedEvent} from "./events/authenticationTypeChangedEvent"

export type {IExtension, IExtensionConstructor} from "./extensions/extension"
export type {BodyEncoding, ErrorHandler, IServiceCall, IServiceError, IServiceParameters, ResponseEncoding} from "./data"

export default PortalClient
