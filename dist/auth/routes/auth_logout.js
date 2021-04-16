"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const httpTrigger = async function (context, req) {
    var _a;
    const host = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.host;
    if (!host) {
        context.res = core_1.response({
            context,
            status: 500,
        });
        return;
    }
    const uri = `http://${host}`;
    const query = new URL((req === null || req === void 0 ? void 0 : req.url) || "", uri).searchParams;
    const location = `${uri}${query.get("post_logout_redirect_uri") || "/"}`;
    context.res = core_1.response({
        context,
        status: 302,
        cookies: [
            {
                name: "StaticWebAppsAuthCookie",
                value: "deleted",
                path: "/",
                HttpOnly: false,
                expires: new Date(1).toUTCString(),
            },
        ],
        headers: {
            Location: location,
        },
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=auth_logout.js.map