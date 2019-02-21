import PortalClient from "portalClient"
import Extension, {IExtension, IExtensionConstructor} from "extensions/extension"
import AuthenticationExtension from "extensions/authenticationExtension"
import ExtensionHandler from "extensions/extensionHandler"

export default PortalClient

export {Extension, IExtension, IExtensionConstructor}
export {AuthenticationExtension}
export {ExtensionHandler}

export {HttpMethod, IParameters, IServiceCall, SessionRequirement} from "serviceCall"
export {ISession, IBooleanResult, IError, IHeader, IPagedPortalResult, IPortalResponse} from "data"
export {IAuthKey} from "extensions/authKey"
export {ILoginEndPoint} from "extensions/oauth"
export {IUser} from "extensions/user"
