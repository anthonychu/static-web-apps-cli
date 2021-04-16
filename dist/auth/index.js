"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAuth = void 0;
const core_1 = require("../core");
const authPaths = [
    {
        method: "GET",
        route: /^\/\.auth\/login\/(?<provider>aad|github|twitter|google|facebook|[a-z]+)/,
        function: "auth_login_provider",
    },
    {
        method: "GET",
        route: /^\/\.auth\/me/,
        function: "auth_me",
    },
    {
        method: "GET",
        route: /^\/\.auth\/logout/,
        function: "auth_logout",
    },
];
async function routeMatcher(url = "/") {
    var _a;
    for (let index = 0; index < authPaths.length; index++) {
        const path = authPaths[index];
        const match = url.match(new RegExp(path.route));
        if (match) {
            let bindingData;
            if ((_a = match.groups) === null || _a === void 0 ? void 0 : _a.provider) {
                bindingData = {
                    provider: match.groups.provider,
                };
            }
            const func = (await Promise.resolve().then(() => __importStar(require(`./routes/${path.function}`)))).default;
            return { func, bindingData };
        }
    }
    return { func: undefined, bindingData: undefined };
}
async function processAuth(request, response) {
    var _a, _b;
    let defaultStatus = 200;
    const context = {
        invocationId: new Date().getTime().toString(36) + Math.random().toString(36).slice(2),
        bindingData: undefined,
        res: {},
    };
    const { func, bindingData } = await routeMatcher(request.url);
    if (func) {
        context.bindingData = bindingData;
        try {
            await func(context, request);
            for (const key in context.res.headers) {
                const element = context.res.headers[key];
                if (element) {
                    response.setHeader(key, element);
                }
            }
            // set auth cookies
            if (context.res.cookies) {
                const serializedCookies = (_a = context.res.cookies) === null || _a === void 0 ? void 0 : _a.map((cookie) => {
                    if (cookie.expires) {
                        cookie.expires = new Date(cookie.expires);
                    }
                    return core_1.serializeCookie(cookie.name, cookie.value, cookie);
                });
                response.setHeader("Set-Cookie", serializedCookies);
            }
            // enable CORS for all requests
            response.setHeader("Access-Control-Allow-Origin", request.headers.origin || "*");
            response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            // set JSON response by default (if no content type was set)
            if (response.hasHeader("Content-Type") === false) {
                response.setHeader("Content-Type", "application/json");
            }
            // if response type is JSON, serialize body response
            if (((_b = response.getHeader("Content-Type")) === null || _b === void 0 ? void 0 : _b.toString().includes("json")) && typeof context.res.body === "object") {
                context.res.body = JSON.stringify(context.res.body);
            }
        }
        catch (error) {
            core_1.logger.error(error);
            defaultStatus = 500;
            context.res.body = {
                error: error.toString(),
            };
        }
    }
    else {
        defaultStatus = 404;
    }
    const statusCode = context.res.status || defaultStatus;
    if (statusCode === 200 || statusCode === 302) {
        response.writeHead(statusCode);
        response.end(context.res.body);
    }
    return statusCode;
}
exports.processAuth = processAuth;
//# sourceMappingURL=index.js.map