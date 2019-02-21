import PortalClient from "src/portalClient"
import Extension, {IExtension, IExtensionConstructor} from "src/extensions/extension"
import AuthenticationExtension from "./extensions/authenticationExtension"
import ExtensionHandler from "src/extensions/extensionHandler"

export default PortalClient

export {Extension, IExtension, IExtensionConstructor}
export {AuthenticationExtension}
export {ExtensionHandler}

export {HttpMethod, IParameters, IServiceCall, SessionRequirement} from "src/serviceCall"
export {ISession, IBooleanResult, IError, IHeader, IPagedPortalResult, IPortalResponse} from "src/data"
export {IAuthKey} from "src/extensions/authKey"
export {ILoginEndPoint} from "src/extensions/oauth"
export {IUser} from "src/extensions/user"
