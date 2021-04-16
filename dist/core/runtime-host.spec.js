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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const runtime_host_1 = require("./runtime-host");
const detectRuntime = __importStar(require("./runtimes"));
let spyDetectRuntime;
const mockConfig = {
    appPort: 8080,
    outputLocation: `.${path_1.default.sep}`,
    appLocation: `.${path_1.default.sep}`,
    proxyHost: "0.0.0.0",
    proxyPort: 4242,
};
describe("runtimeHost", () => {
    beforeEach(() => {
        process.env.SWA_CLI_DEBUG = "";
        spyDetectRuntime = jest.spyOn(detectRuntime, "detectRuntime");
        spyDetectRuntime.mockReturnValue(detectRuntime.RuntimeType.unknown);
    });
    describe("createRuntimeHost()", () => {
        it("outputLocation should be propagated in resulting command", () => {
            const rh = runtime_host_1.createRuntimeHost({
                ...mockConfig,
                outputLocation: "./foobar",
            });
            expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path_1.default.sep}`);
            expect(rh.command).toContain(`npx http-server`);
            expect(rh.args).toEqual(["./foobar", "-d", "false", "--host", "0.0.0.0", "--port", "8080", "--cache", "-1"]);
        });
        it("outputLocation should default to ./ if undefined", () => {
            const rh = runtime_host_1.createRuntimeHost({
                ...mockConfig,
                outputLocation: undefined,
            });
            expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path_1.default.sep}`);
            expect(rh.command).toContain(`npx http-server`);
            expect(rh.args).toEqual([`.${path_1.default.sep}`, "-d", "false", "--host", "0.0.0.0", "--port", "8080", "--cache", "-1"]);
        });
        it("proxyHost should be propagated in resulting command", () => {
            const rh = runtime_host_1.createRuntimeHost({
                ...mockConfig,
                proxyHost: "127.0.0.1",
            });
            expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path_1.default.sep}`);
            expect(rh.command).toContain(`npx http-server`);
            expect(rh.args).toEqual([`.${path_1.default.sep}`, "-d", "false", "--host", "127.0.0.1", "--port", "8080", "--cache", "-1"]);
        });
        it("proxyPort should be propagated in resulting command", () => {
            const rh = runtime_host_1.createRuntimeHost({
                ...mockConfig,
                proxyPort: 3000,
            });
            expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path_1.default.sep}`);
            expect(rh.command).toContain(`npx http-server`);
            expect(rh.args).toEqual([`.${path_1.default.sep}`, "-d", "false", "--host", "0.0.0.0", "--port", "8080", "--cache", "-1"]);
        });
        it("appLocation should be propagated to the runtime detector", () => {
            const rh = runtime_host_1.createRuntimeHost({
                ...mockConfig,
                appLocation: "./foobar",
            });
            expect(spyDetectRuntime).toHaveBeenCalledWith("./foobar");
            expect(rh.command).toContain(`npx http-server`);
            expect(rh.args).toEqual([`.${path_1.default.sep}`, "-d", "false", "--host", "0.0.0.0", "--port", "8080", "--cache", "-1"]);
        });
    });
});
//# sourceMappingURL=runtime-host.spec.js.map