"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const httpTrigger = async function (context, req) {
    const { cookie } = req.headers;
    if (!cookie || !core_1.validateCookie(cookie)) {
        context.res = core_1.response({
            context,
            status: 200,
            body: {
                clientPrincipal: null,
            },
        });
        return;
    }
    const clientPrincipal = core_1.decodeCookie(cookie);
    if ((clientPrincipal === null || clientPrincipal === void 0 ? void 0 : clientPrincipal.userRoles.includes("authenticated")) === false) {
        clientPrincipal === null || clientPrincipal === void 0 ? void 0 : clientPrincipal.userRoles.push(...["anonymous", "authenticated"]);
    }
    context.res = core_1.response({
        context,
        status: 200,
        body: {
            clientPrincipal,
        },
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=auth_me.js.map