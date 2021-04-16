"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRoutes = exports.matchRoute = void 0;
const core_1 = require("../../../core");
const glob_1 = require("../../../core/utils/glob");
const matchRoute = (req, isLegacyConfigFile) => {
    var _a;
    const sanitizedUrl = new URL(req.url, `http://${(_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.host}`);
    return (routeDef) => {
        let filter = routeDef.route;
        if (!filter) {
            return false;
        }
        const originlUrl = sanitizedUrl.pathname;
        // In the legacy config file,
        // the /* rule should only match routes segments (eg. /about), but not file paths (eg. image.png)
        // bypass rules for /api and /.auth routes
        if (isLegacyConfigFile && filter === "/*") {
            if (originlUrl.startsWith("/api") || originlUrl.startsWith("/.auth")) {
                return false;
            }
            else if (originlUrl.includes(".") && !originlUrl.startsWith("/.auth")) {
                return false;
            }
            else if (originlUrl.includes("sockjs")) {
                return false;
            }
        }
        // we don't support full globs in the config file.
        // add this little utility to convert a wildcard into a valid glob pattern
        const regexp = new RegExp(`^${glob_1.globToRegExp(filter)}$`);
        return regexp.test(originlUrl);
    };
};
exports.matchRoute = matchRoute;
const customRoutes = async (req, res, userDefinedRoute) => {
    var _a;
    if (!req) {
        return Promise.resolve(undefined);
    }
    if (userDefinedRoute) {
        core_1.logger.silly("checking routes rule...");
        core_1.logger.silly({ userDefinedRoute });
        // set headers
        if (userDefinedRoute.headers) {
            for (const header in userDefinedRoute.headers) {
                res.setHeader(header, userDefinedRoute.headers[header]);
            }
        }
        // check allowed method
        if (((_a = userDefinedRoute.methods) === null || _a === void 0 ? void 0 : _a.includes(req.method)) === false) {
            res.statusCode = 405;
        }
        // ACL
        if (userDefinedRoute.allowedRoles) {
            const user = req.headers.cookie ? core_1.decodeCookie(req.headers.cookie) : null;
            if (userDefinedRoute.allowedRoles.some((role) => { var _a; return (_a = user === null || user === void 0 ? void 0 : user.userRoles) === null || _a === void 0 ? void 0 : _a.some((userRole) => userRole === role); }) === false) {
                res.statusCode = 403;
            }
            else {
                res.statusCode = 200;
            }
        }
        // specific status code but no attached route
        if (userDefinedRoute.statusCode && !userDefinedRoute.serve) {
            const code = Number(userDefinedRoute.statusCode);
            if (isNaN(code) === false) {
                res.statusCode = code;
            }
        }
        // rewrite
        const isServeWrite = userDefinedRoute.serve && ![301, 302].includes(Number(userDefinedRoute.statusCode));
        if (isServeWrite || userDefinedRoute.rewrite) {
            req.url = userDefinedRoute.serve || userDefinedRoute.rewrite;
        }
        // redirect route
        const isServeRedirect = userDefinedRoute.serve && [301, 302].includes(Number(userDefinedRoute.statusCode));
        if (isServeRedirect || userDefinedRoute.redirect) {
            let route = (userDefinedRoute.serve || userDefinedRoute.redirect);
            // redirects
            // note: adding checks to avoid ERR_TOO_MANY_REDIRECTS
            if (route !== req.url) {
                res.setHeader("Location", route);
                res.statusCode = Number(userDefinedRoute.statusCode) || 302;
            }
        }
    }
    return Promise.resolve(undefined);
};
exports.customRoutes = customRoutes;
//# sourceMappingURL=customRoutes.js.map