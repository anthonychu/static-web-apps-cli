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
const decodeCookie = __importStar(require("../../../core/utils/cookie"));
const customRoutes_1 = require("./customRoutes");
describe("customRoutes()", () => {
    let method;
    let req;
    let res;
    let userRouteConfig;
    beforeEach(() => {
        method = "GET";
        req = {
            url: "/foo",
            method,
            headers: {
                cookie: "foo",
            },
        };
        res = {
            statusCode: 200,
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            getHeaders: jest.fn(),
            end: jest.fn(),
        };
        userRouteConfig = {};
    });
    it("should return undefined if req is not defined", async () => {
        req = undefined;
        res = undefined;
        const status = await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(status).toBeUndefined();
    });
    it("should return undefined if no routes", async () => {
        req = {};
        res = {};
        const status = await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(status).toBeUndefined();
    });
    it("should check for undefined config", async () => {
        req.url = "/foo";
        const status = await customRoutes_1.customRoutes(req, res, undefined);
        expect(status).toBeUndefined();
    });
    it("should check for null config", async () => {
        req.url = "/foo";
        const status = await customRoutes_1.customRoutes(req, res, null);
        expect(status).toBeUndefined();
    });
    it("should set headers", async () => {
        userRouteConfig = {
            route: "/foo",
            headers: {
                "Cache-Control": "public, max-age=604800, immutable",
                "Keep-Alive": "timeout=5, max=1000",
            },
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.setHeader).toHaveBeenCalledTimes(2);
    });
    it("should process HTTP methods", async () => {
        userRouteConfig = {
            route: "/foo",
            methods: ["FOO"],
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(405);
    });
    it("should return 403 if no user roles in cookie", async () => {
        jest.spyOn(decodeCookie, "decodeCookie").mockReturnValue({
            userRoles: [],
        });
        userRouteConfig = {
            route: "/foo",
            allowedRoles: ["authenticated"],
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(403);
    });
    it("should return 403 if unmatched roles", async () => {
        jest.spyOn(decodeCookie, "decodeCookie").mockReturnValue({
            userRoles: ["foo"],
        });
        userRouteConfig = {
            route: "/foo",
            allowedRoles: ["authenticated"],
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(403);
    });
    it("should return 200 if matched roles", async () => {
        jest.spyOn(decodeCookie, "decodeCookie").mockReturnValue({
            userRoles: ["authenticated"],
        });
        userRouteConfig = {
            route: "/foo",
            allowedRoles: ["authenticated"],
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(200);
    });
    it("should set custom status code as number (statusCode=418)", async () => {
        userRouteConfig = {
            route: "/foo",
            statusCode: 418,
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(418);
    });
    it("should set custom status code as string (statusCode='418')", async () => {
        userRouteConfig = {
            route: "/foo",
            statusCode: "418",
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(418);
    });
    it("should not set custom status code if invalid code (statusCode='NaN')", async () => {
        userRouteConfig = {
            route: "/foo",
            statusCode: "NaN",
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(200);
    });
    it("should set custom status code (statusCode=404)", async () => {
        userRouteConfig = {
            route: "/foo",
            statusCode: 404,
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.writeHead).not.toHaveBeenCalled();
        expect(res.end).not.toHaveBeenCalled();
    });
    it("should rewrite URLs", async () => {
        userRouteConfig = {
            route: "/foo",
            rewrite: "/bar.html",
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(req.url).toBe("/bar.html");
    });
    it("should handle 302 redirects", async () => {
        userRouteConfig = {
            route: "/foo",
            redirect: "/bar.html",
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.setHeader).toHaveBeenCalledWith("Location", "/bar.html");
        expect(res.statusCode).toBe(302);
    });
    it("should serve with redirect (statusCode=302)", async () => {
        userRouteConfig = {
            route: "/foo",
            serve: "/bar",
            statusCode: 302,
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.setHeader).toHaveBeenCalledWith("Location", "/bar");
        expect(res.statusCode).toBe(302);
    });
    it("should serve with redirect (statusCode=301)", async () => {
        userRouteConfig = {
            route: "/foo",
            serve: "/bar",
            statusCode: 301,
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.setHeader).toHaveBeenCalledWith("Location", "/bar");
        expect(res.statusCode).toBe(301);
    });
    it("should not serve with redirect (statusCode=200)", async () => {
        userRouteConfig = {
            route: "/foo",
            serve: "/bar",
            statusCode: 200,
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.writeHead).not.toHaveBeenCalled();
    });
    it("should serve with rewrite (statusCode=200)", async () => {
        userRouteConfig = {
            route: "/foo",
            serve: "/bar",
            statusCode: 200,
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.writeHead).not.toHaveBeenCalled();
        expect(req.url).toBe("/bar");
    });
    it("should serve with rewrite (statusCode=undefined)", async () => {
        userRouteConfig = {
            route: "/foo",
            serve: "/bar",
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(req.url).toBe("/bar");
        expect(res.writeHead).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
    });
    it("should protect against ERR_TOO_MANY_REDIRECTS", async () => {
        userRouteConfig = {
            route: "/foo",
            redirect: "/foo",
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.writeHead).not.toHaveBeenCalled();
    });
    it("should parse URL and ignore query params", async () => {
        req.url = "/.auth/login/github?post_login_redirect_uri=/profile";
        userRouteConfig = {
            route: "/.auth/login/github",
            statusCode: 403,
        };
        await customRoutes_1.customRoutes(req, res, userRouteConfig);
        expect(res.statusCode).toBe(403);
    });
    describe("Wildcards", () => {
        it("should match root wildcards /* (non-legacy config file)", async () => {
            req.url = "/.auth/login/github?post_login_redirect_uri=/profile";
            userRouteConfig = {
                route: "/*",
            };
            const regex = customRoutes_1.matchRoute(req, false)(userRouteConfig);
            expect(regex).toBe(true);
        });
        it("should not match root wildcards /* when requesting socketjs (for legacy config file)", async () => {
            req.url = "/sockjs-node/366/fskzyskg/websocket";
            userRouteConfig = {
                route: "/*",
            };
            const regex = customRoutes_1.matchRoute(req, true)(userRouteConfig);
            expect(regex).toBe(false);
        });
        it("should not match root wildcards /* when requesting /.auth (for legacy config file)", async () => {
            req.url = "/.auth/login/github?post_login_redirect_uri=/profile";
            userRouteConfig = {
                route: "/*",
            };
            const regex = customRoutes_1.matchRoute(req, true)(userRouteConfig);
            expect(regex).toBe(false);
        });
        it("should not match root wildcards /* when requesting file assets (for legacy config file)", async () => {
            req.url = "/foo/bar/image.jpg";
            userRouteConfig = {
                route: "/*",
            };
            const regex = customRoutes_1.matchRoute(req, true)(userRouteConfig);
            expect(regex).toBe(false);
        });
        it("should not match root wildcards /* when requesting /api (for legacy config file)", async () => {
            req.url = "/api/foo/bar";
            userRouteConfig = {
                route: "/*",
            };
            const regex = customRoutes_1.matchRoute(req, true)(userRouteConfig);
            expect(regex).toBe(false);
        });
        it("should match root wildcards /* when requesting app route (for legacy config file)", async () => {
            req.url = "/foo/bar";
            userRouteConfig = {
                route: "/*",
            };
            const regex = customRoutes_1.matchRoute(req, true)(userRouteConfig);
            expect(regex).toBe(true);
        });
        it("should match sub paths wildcards (non-legacy config file)", async () => {
            req.url = "/.auth/login/github";
            userRouteConfig = {
                route: "/.auth/*",
            };
            const regex = customRoutes_1.matchRoute(req, false)(userRouteConfig);
            expect(regex).toBe(true);
        });
        it("should match sub paths wildcards (legacy config file)", async () => {
            req.url = "/.auth/login/github";
            userRouteConfig = {
                route: "/.auth/*",
            };
            const regex = customRoutes_1.matchRoute(req, true)(userRouteConfig);
            expect(regex).toBe(true);
        });
        it("should not match wrong sub paths wildcards", async () => {
            req.url = "/.xyz/login/github";
            userRouteConfig = {
                route: "/.auth/*",
            };
            const regex = customRoutes_1.matchRoute(req, false)(userRouteConfig);
            expect(regex).toBe(false);
        });
        it("should match file-based wildcards", async () => {
            req.url = "/assets/foo.png";
            userRouteConfig = {
                route: "/assets/*.{png,svg}",
            };
            const regex = customRoutes_1.matchRoute(req, false)(userRouteConfig);
            expect(regex).toBe(true);
        });
        it("should not match wrong file-based wildcards", async () => {
            req.url = "/assets/foo.svg";
            userRouteConfig = {
                route: "/assets/*.{png}",
            };
            const regex = customRoutes_1.matchRoute(req, false)(userRouteConfig);
            expect(regex).toBe(false);
        });
    });
});
//# sourceMappingURL=customRoutes.spec.js.map