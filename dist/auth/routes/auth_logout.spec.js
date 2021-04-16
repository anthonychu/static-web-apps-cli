"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_logout_1 = __importDefault(require("./auth_logout"));
describe("auth_logout", () => {
    let context;
    let req;
    const deletedCookieDefinition = {
        name: "StaticWebAppsAuthCookie",
        value: "deleted",
        path: "/",
        HttpOnly: false,
        expires: new Date(1).toUTCString(),
    };
    beforeEach(() => {
        context = {};
        req = {
            headers: {},
        };
    });
    it("should handle empty config", async () => {
        await auth_logout_1.default(context, req);
        expect(context.res.body).toBe(null);
        expect(context.res.status).toBe(500);
    });
    it("should handle host without port", async () => {
        var _a, _b;
        await auth_logout_1.default(context, {
            headers: {
                host: "0.0.0.0",
            },
        });
        expect(context.res.body).toBe(null);
        expect(context.res.status).toBe(302);
        expect((_a = context.res.headers) === null || _a === void 0 ? void 0 : _a.Location).toBe("http://0.0.0.0/");
        expect((_b = context.res.cookies) === null || _b === void 0 ? void 0 : _b[0]).toEqual(deletedCookieDefinition);
    });
    it("should handle host with port", async () => {
        var _a, _b;
        await auth_logout_1.default(context, {
            headers: {
                host: "127.0.0.1:4280",
            },
        });
        expect(context.res.body).toBe(null);
        expect(context.res.status).toBe(302);
        expect((_a = context.res.headers) === null || _a === void 0 ? void 0 : _a.Location).toBe("http://127.0.0.1:4280/");
        expect((_b = context.res.cookies) === null || _b === void 0 ? void 0 : _b[0]).toEqual(deletedCookieDefinition);
    });
    it("should handle post_logout_redirect_uri", async () => {
        var _a, _b;
        await auth_logout_1.default(context, {
            url: "/.auth/logout?post_logout_redirect_uri=/foobar",
            headers: {
                host: "127.0.0.1:4280",
            },
        });
        expect(context.res.body).toBe(null);
        expect(context.res.status).toBe(302);
        expect((_a = context.res.headers) === null || _a === void 0 ? void 0 : _a.Location).toBe("http://127.0.0.1:4280/foobar");
        expect((_b = context.res.cookies) === null || _b === void 0 ? void 0 : _b[0]).toEqual(deletedCookieDefinition);
    });
});
//# sourceMappingURL=auth_logout.spec.js.map