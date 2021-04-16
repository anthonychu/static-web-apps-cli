"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_fs_1 = __importDefault(require("mock-fs"));
const runtimes_1 = require("./runtimes");
const appLocation = "./tmp-swa-emulator";
describe("runtime", () => {
    afterEach(() => {
        mock_fs_1.default.restore();
    });
    describe("detectRuntime()", () => {
        it(`should detect ${runtimes_1.RuntimeType.dotnet} runtime (csproj)`, () => {
            mock_fs_1.default({
                [appLocation]: { "Example.csproj": `<?xml version="1.0" encoding="utf-8"?>` },
            });
            const runtime = runtimes_1.detectRuntime(appLocation);
            expect(runtime).toBe(runtimes_1.RuntimeType.dotnet);
        });
        it(`should detect ${runtimes_1.RuntimeType.dotnet} runtime (sln)`, () => {
            mock_fs_1.default({
                [appLocation]: { "Example.sln": `<?xml version="1.0" encoding="utf-8"?>` },
            });
            const runtime = runtimes_1.detectRuntime(appLocation);
            expect(runtime).toBe(runtimes_1.RuntimeType.dotnet);
        });
        it(`should detect ${runtimes_1.RuntimeType.node} runtime`, () => {
            mock_fs_1.default({
                [appLocation]: {
                    "package.json": "{}",
                },
            });
            const runtime = runtimes_1.detectRuntime(appLocation);
            expect(runtime).toBe(runtimes_1.RuntimeType.node);
        });
        it(`should detect ${runtimes_1.RuntimeType.unknown} runtime`, () => {
            mock_fs_1.default({
                [appLocation]: {},
            });
            const runtime = runtimes_1.detectRuntime(appLocation);
            expect(runtime).toBe(runtimes_1.RuntimeType.unknown);
        });
        it(`should throw if appLocation is undefined`, () => {
            const runtime = runtimes_1.detectRuntime(undefined);
            expect(runtime).toBe(runtimes_1.RuntimeType.unknown);
        });
    });
});
//# sourceMappingURL=runtimes.spec.js.map