/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
/**
 * The order in which the following are applied are:
 * 1. Request comes in, a route rule that applies to the request is searched for
 * 2. If content to serve does not exist, navigation fallback is specified, and the request isn't excluded from navigation fallback, then serve navigation fallback content
 * 3. If content to serve does exist, apply headers to page, and apply mime type (either default or custom)
 * 4. At any point in 1-3 if there is a reason to throw an error response (401, 403, 404) and response overrides are specified than those values are served
 */
export declare function applyRules(req: IncomingMessage, res: ServerResponse, userConfig: SWAConfigFile): Promise<void>;
//# sourceMappingURL=index.d.ts.map
