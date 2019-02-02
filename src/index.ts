import {PortalClient} from "./portalClient"
import Extension, {AuthenticationExtension} from "portalclient/extensions/extension"
import ExtensionHandler from "portalclient/extensions/extensionHandler"
import {HttpMethod, IServiceCall, SessionRequirement} from "portalclient/serviceCall"
import Session from "portalclient/extensions/session"

export {AuthenticationExtension, Extension, ExtensionHandler, HttpMethod, IServiceCall, SessionRequirement, Session}
export default PortalClient
