"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_fs_1 = __importDefault(require("mock-fs"));
const navigationFallback_1 = require("./navigationFallback");
describe("navigationFallback()", () => {
    let req;
    let res;
    let userConfig;
    beforeEach(() => {
        req = {};
        res = {};
        userConfig = {};
    });
    afterEach(() => {
        mock_fs_1.default.restore();
    });
    it("should not process fallbacks if empty config", async () => {
        req.url = "/foo";
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/foo");
    });
    it("should check for undefined config", async () => {
        req.url = "/foo";
        await navigationFallback_1.navigationFallback(req, res, undefined);
        expect(req.url).toBe("/foo");
    });
    it("should check for null config", async () => {
        req.url = "/foo";
        await navigationFallback_1.navigationFallback(req, res, null);
        expect(req.url).toBe("/foo");
    });
    it("should not process fallbacks if /.auth/**", async () => {
        req.url = "/.auth/login/github?post_login_redirect_uri=/profile";
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/.auth/login/github?post_login_redirect_uri=/profile");
    });
    it("should not process fallbacks if /api/**", async () => {
        req.url = "/api/foo/bar";
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/api/foo/bar");
    });
    it("should not process fallbacks if file found and matched exclude filter", async () => {
        req.url = "/images/foo.png";
        userConfig = {
            rewrite: "/bar",
            exclude: ["/images/*.{png,jpg,gif}"],
        };
        process.env.SWA_CLI_OUTPUT_LOCATION = "/";
        mock_fs_1.default({
            "/images/foo.png": "",
        });
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/images/foo.png");
    });
    it("should not process fallbacks if file not found but matched exclude filter", async () => {
        req.url = "/images/foo.png";
        userConfig = {
            rewrite: "/bar",
            exclude: ["/images/*.{png,jpg,gif}"],
        };
        process.env.SWA_CLI_OUTPUT_LOCATION = "/";
        mock_fs_1.default({
            "/no-file": "",
        });
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/images/foo.png");
    });
    it("should process fallbacks if file found but not matched exclude filter", async () => {
        req.url = "/images/foo.png";
        userConfig = {
            rewrite: "/bar",
            exclude: ["/images/*.{gif}"],
        };
        process.env.SWA_CLI_OUTPUT_LOCATION = "/";
        mock_fs_1.default({
            "/images/foo.png": "",
        });
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/bar");
    });
    it("should process fallbacks if file not found and not matched exclude filter", async () => {
        req.url = "/images/foo.png";
        userConfig = {
            rewrite: "/bar",
            exclude: ["/images/*.{gif}"],
        };
        process.env.SWA_CLI_OUTPUT_LOCATION = "/";
        mock_fs_1.default({
            "/no-file": "",
        });
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/bar");
    });
    it("should expand wildcards (/*.{png}) into valid glob wildcards (/**/*.{png})", async () => {
        req.url = "/images/foo/bar.png";
        userConfig = {
            rewrite: "/bar",
            exclude: ["/*.{png}"],
        };
        process.env.SWA_CLI_OUTPUT_LOCATION = "/";
        mock_fs_1.default({
            "/no-file": "",
        });
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/images/foo/bar.png");
    });
    it("should expand wildcards (/images/*.{png}) into valid glob wildcards (/images/**/*.{png})", async () => {
        req.url = "/images/foo/bar.png";
        userConfig = {
            rewrite: "/bar",
            exclude: ["/images/*.{png}"],
        };
        process.env.SWA_CLI_OUTPUT_LOCATION = "/";
        mock_fs_1.default({
            "/no-file": "",
        });
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/images/foo/bar.png");
    });
    it("should ignore fallback if no exclude property is provided", async () => {
        req.url = "/images/foo/bar.png";
        userConfig = {
            rewrite: "/bar",
        };
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/images/foo/bar.png");
    });
    it("should ignore fallback if exclude list is empty", async () => {
        req.url = "/images/foo/bar.png";
        userConfig = {
            rewrite: "/bar",
            exclude: [],
        };
        await navigationFallback_1.navigationFallback(req, res, userConfig);
        expect(req.url).toBe("/images/foo/bar.png");
    });
});
//# sourceMappingURL=navigationFallback.spec.js.map