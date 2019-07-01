import PortalClient from "./portalClient"
import Extension, {IExtension, IExtensionConstructor} from "./extensions/extension"
import AuthenticationExtension from "./extensions/authenticationExtension"
import ExtensionHandler from "./extensions/extensionHandler"

export default PortalClient

export {Extension, IExtension, IExtensionConstructor}
export {AuthenticationExtension}
export {ExtensionHandler}

export {HttpMethod, ISession, IBooleanResult, IEmptyResult, IServiceCall, IServiceError, IServiceParameters, SessionRequirement} from "./data"
