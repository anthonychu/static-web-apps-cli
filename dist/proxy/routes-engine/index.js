"use strict";
// The routes engine implemetation is (and should always be) aligned with the documentation
// see: https://docs.microsoft.com/en-us/azure/static-web-apps/configuration
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRules = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("../../core");
const customRoutes_1 = require("./rules/customRoutes");
const globalHeaders_1 = require("./rules/globalHeaders");
const mimeTypes_1 = require("./rules/mimeTypes");
const navigationFallback_1 = require("./rules/navigationFallback");
const responseOverrides_1 = require("./rules/responseOverrides");
/**
 * The order in which the following are applied are:
 * 1. Request comes in, a route rule that applies to the request is searched for
 * 2. If content to serve does not exist, navigation fallback is specified, and the request isn't excluded from navigation fallback, then serve navigation fallback content
 * 3. If content to serve does exist, apply headers to page, and apply mime type (either default or custom)
 * 4. At any point in 1-3 if there is a reason to throw an error response (401, 403, 404) and response overrides are specified than those values are served
 */
async function applyRules(req, res, userConfig) {
    var _a;
    const userDefinedRoute = (_a = userConfig.routes) === null || _a === void 0 ? void 0 : _a.find(customRoutes_1.matchRoute(req, userConfig.isLegacyConfigFile));
    const filepath = path_1.default.join(process.env.SWA_CLI_OUTPUT_LOCATION, req.url);
    const isFileFound = fs_1.default.existsSync(filepath);
    // note: these rules are mutating the req and res objects
    await navigationFallback_1.navigationFallback(req, res, userConfig.navigationFallback);
    await globalHeaders_1.globalHeaders(req, res, userConfig.globalHeaders);
    await mimeTypes_1.mimeTypes(req, res, userConfig.mimeTypes);
    await customRoutes_1.customRoutes(req, res, userDefinedRoute);
    await responseOverrides_1.responseOverrides(req, res, userConfig.responseOverrides);
    core_1.logger.silly({
        outputLocation: process.env.SWA_CLI_OUTPUT_LOCATION,
        matchedRoute: userDefinedRoute,
        filepath,
        isFileFound,
        statusCode: res.statusCode,
        url: req.url,
    });
}
exports.applyRules = applyRules;
//# sourceMappingURL=index.js.map