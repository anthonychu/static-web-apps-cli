"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_fs_1 = __importDefault(require("mock-fs"));
const path_1 = __importDefault(require("path"));
const cli_1 = require("./cli");
describe("argv()", () => {
    it("process.argv = []", () => {
        process.argv = [];
        expect(cli_1.argv("--port")).toBe(null);
    });
    it("process.argv = ['--port']", () => {
        process.argv = ["--port"];
        expect(cli_1.argv("--port")).toBe(true);
        expect(cli_1.argv("--portxyz")).toBe(false);
    });
    it("process.argv = ['--port=4242']", () => {
        process.argv = ["--port=4242"];
        expect(cli_1.argv("--port")).toBe("4242");
    });
    it("process.argv = ['--port  =   4242  ']", () => {
        process.argv = ["--port  =  4242  "];
        expect(cli_1.argv("--port")).toBe("4242");
    });
    it("process.argv = ['--port', '4242']", () => {
        process.argv = ["--port", "4242"];
        expect(cli_1.argv("--port")).toBe("4242");
    });
    it("process.argv = ['--port', '--other']", () => {
        process.argv = ["--port", "--other"];
        expect(cli_1.argv("--port")).toBe(true);
    });
    it("process.argv = ['--port=']", () => {
        process.argv = ["--port="];
        expect(cli_1.argv("--port")).toBe(null);
    });
});
describe("createStartupScriptCommand()", () => {
    describe("npm", () => {
        it("should parse npm scripts (simple)", () => {
            const cmd = cli_1.createStartupScriptCommand("npm:start", {});
            expect(cmd).toBe("npm run start --if-present");
        });
        it("should parse npm scripts (with -)", () => {
            const cmd = cli_1.createStartupScriptCommand("npm:start-foo", {});
            expect(cmd).toBe("npm run start-foo --if-present");
        });
        it("should parse npm scripts (with :)", () => {
            const cmd = cli_1.createStartupScriptCommand("npm:start:foo", {});
            expect(cmd).toBe("npm run start:foo --if-present");
        });
        it("should parse npm scripts (with #)", () => {
            const cmd = cli_1.createStartupScriptCommand("npm:start#foo", {});
            expect(cmd).toBe("npm run start#foo --if-present");
        });
    });
    describe("yarn", () => {
        it("should parse yarn scripts (simple)", () => {
            const cmd = cli_1.createStartupScriptCommand("yarn:start", {});
            expect(cmd).toBe("yarn run start --if-present");
        });
        it("should parse yarn scripts (with -)", () => {
            const cmd = cli_1.createStartupScriptCommand("yarn:start-foo", {});
            expect(cmd).toBe("yarn run start-foo --if-present");
        });
        it("should parse yarn scripts (with :)", () => {
            const cmd = cli_1.createStartupScriptCommand("yarn:start:foo", {});
            expect(cmd).toBe("yarn run start:foo --if-present");
        });
        it("should parse yarn scripts (with #)", () => {
            const cmd = cli_1.createStartupScriptCommand("yarn:start#foo", {});
            expect(cmd).toBe("yarn run start#foo --if-present");
        });
    });
    describe("npx", () => {
        it("should parse npx command (simple)", () => {
            const cmd = cli_1.createStartupScriptCommand("npx:foo", {});
            expect(cmd).toBe("npx foo");
        });
        it("should parse npx command (with -)", () => {
            const cmd = cli_1.createStartupScriptCommand("npx:start-foo", {});
            expect(cmd).toBe("npx start-foo");
        });
        it("should parse npx command (with :)", () => {
            const cmd = cli_1.createStartupScriptCommand("npx:start:foo", {});
            expect(cmd).toBe("npx start:foo");
        });
        it("should parse npx command (with #)", () => {
            const cmd = cli_1.createStartupScriptCommand("npx:start#foo", {});
            expect(cmd).toBe("npx start#foo");
        });
    });
    describe("npm, npm and npx with optional args", () => {
        it("should parse npm options", () => {
            const cmd = cli_1.createStartupScriptCommand("npm:foo --foo1 --foo2", {});
            expect(cmd).toBe("npm run foo --foo1 --foo2 --if-present");
        });
        it("should parse yarn options", () => {
            const cmd = cli_1.createStartupScriptCommand("yarn:foo --foo1 --foo2", {});
            expect(cmd).toBe("yarn run foo --foo1 --foo2 --if-present");
        });
        it("should parse npx options", () => {
            const cmd = cli_1.createStartupScriptCommand("npx:foo --foo1 --foo2", {});
            expect(cmd).toBe("npx foo --foo1 --foo2");
        });
    });
    describe("an external script", () => {
        afterEach(() => {
            mock_fs_1.default.restore();
        });
        it("should parse relative script file ./script.sh", () => {
            mock_fs_1.default({
                "script.sh": "",
            });
            const cmd = cli_1.createStartupScriptCommand("script.sh", {});
            expect(cmd).toBe(`${process.cwd()}${path_1.default.sep}script.sh`);
        });
        it("should parse relative script file ./script.sh from the root of --app-location", () => {
            mock_fs_1.default({
                "/bar/script.sh": "",
            });
            const cmd = cli_1.createStartupScriptCommand("script.sh", { appLocation: `${path_1.default.sep}bar` });
            expect(cmd).toInclude(path_1.default.join(path_1.default.sep, "bar", "script.sh"));
        });
        it("should parse absolute script file /foo/script.sh", () => {
            mock_fs_1.default({
                "/foo": {
                    "script.sh": "",
                },
            });
            const cmd = cli_1.createStartupScriptCommand("/foo/script.sh", {});
            expect(cmd).toBe("/foo/script.sh");
        });
    });
    describe("non-valid use cases", () => {
        it("should handle non-valid npm patterns", () => {
            const cmd = cli_1.createStartupScriptCommand("npm", {});
            expect(cmd).toBe(null);
        });
        it("should handle non-valid yarn patterns", () => {
            const cmd = cli_1.createStartupScriptCommand("yarn", {});
            expect(cmd).toBe(null);
        });
        it("should handle non-valid npx patterns", () => {
            const cmd = cli_1.createStartupScriptCommand("npx", {});
            expect(cmd).toBe(null);
        });
        it("should handle non-existant scripts (relative)", () => {
            const cmd = cli_1.createStartupScriptCommand("script.sh", {});
            expect(cmd).toBe(null);
        });
        it("should handle non-existant scripts (asbolute)", () => {
            const cmd = cli_1.createStartupScriptCommand("/foo/bar/script.sh", {});
            expect(cmd).toBe(null);
        });
        it("should handle non-existant scripts (asbolute)", () => {
            const cmd = cli_1.createStartupScriptCommand(`"npm:µ˜¬…˚πº–ª¶§∞¢£¢™§_)(*!#˜%@)`, {});
            expect(cmd).toBe(null);
        });
    });
});
//# sourceMappingURL=cli.spec.js.map