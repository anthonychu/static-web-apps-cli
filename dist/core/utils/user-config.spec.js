"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_fs_1 = __importDefault(require("mock-fs"));
const path_1 = __importDefault(require("path"));
const user_config_1 = require("./user-config");
describe("traverseFolder()", () => {
    afterEach(() => {
        mock_fs_1.default.restore();
    });
    const asyncGeneratorToArray = async (gen) => {
        const entries = [];
        for await (const entry of gen) {
            entries.push(entry);
        }
        return entries;
    };
    it("should handle empty folders", async () => {
        mock_fs_1.default();
        const entry = await asyncGeneratorToArray(user_config_1.traverseFolder("."));
        expect(entry).toEqual([]);
    });
    describe("should handle flat folder", async () => {
        it("with single entry", async () => {
            mock_fs_1.default({
                "foo.txt": "fake content",
            });
            const entries = await asyncGeneratorToArray(user_config_1.traverseFolder("."));
            expect(entries.length).toBe(1);
            // entries are populated indeterminately because of async generator
            expect(entries.find((entry) => entry.endsWith("foo.txt"))).toEndWith("foo.txt");
        });
        it("with multiple entries", async () => {
            mock_fs_1.default({
                "foo.txt": "fake content",
                "bar.jpg": "fake content",
            });
            const entries = await asyncGeneratorToArray(user_config_1.traverseFolder("."));
            expect(entries.length).toBe(2);
            // entries are populated indeterminately because of async generator
            expect(entries.find((entry) => entry.endsWith("bar.jpg"))).toEndWith("bar.jpg");
            expect(entries.find((entry) => entry.endsWith("foo.txt"))).toEndWith("foo.txt");
        });
    });
    describe("should handle deep folders", async () => {
        it("with single entry", async () => {
            mock_fs_1.default({
                swa: {
                    "foo.txt": "fake content",
                },
            });
            const entries = await asyncGeneratorToArray(user_config_1.traverseFolder("."));
            expect(entries.length).toBe(1);
            // entries are populated indeterminately because of async generator
            expect(entries.find((entry) => entry.endsWith(`swa${path_1.default.sep}foo.txt`))).toEndWith(`swa${path_1.default.sep}foo.txt`);
        });
        it("with multiple entries", async () => {
            mock_fs_1.default({
                swa: {
                    "foo.txt": "fake content",
                },
                "bar.jpg": "fake content",
            });
            const entries = await asyncGeneratorToArray(user_config_1.traverseFolder("."));
            expect(entries.length).toBe(2);
            // entries are populated indeterminately because of async generator
            expect(entries.find((entry) => entry.endsWith("bar.jpg"))).toEndWith("bar.jpg");
            expect(entries.find((entry) => entry.endsWith(`swa${path_1.default.sep}foo.txt`))).toEndWith(`swa${path_1.default.sep}foo.txt`);
        });
    });
    describe("should exclude folders", async () => {
        it("node_modules", async () => {
            mock_fs_1.default({
                "foo.txt": "fake content",
                swa: {
                    "bar.jpg": "fake content",
                },
                node_modules: {
                    "bar.txt": "fake content",
                },
            });
            const entries = await asyncGeneratorToArray(user_config_1.traverseFolder("."));
            expect(entries.length).toBe(2);
            // entries are populated indeterminately because of async generator
            expect(entries.find((entry) => entry.endsWith(`swa${path_1.default.sep}bar.jpg`))).toEndWith(`swa${path_1.default.sep}bar.jpg`);
            expect(entries.find((entry) => entry.endsWith("foo.txt"))).toEndWith("foo.txt");
        });
    });
});
describe("findSWAConfigFile()", () => {
    afterEach(() => {
        mock_fs_1.default.restore();
    });
    it("should find no config file", async () => {
        mock_fs_1.default({});
        const file = await user_config_1.findSWAConfigFile(".");
        expect(file).toBe(null);
    });
    it("should find staticwebapp.config.json (at the root)", async () => {
        mock_fs_1.default({
            "staticwebapp.config.json": `{ "routes": []}`,
        });
        const config = await user_config_1.findSWAConfigFile(".");
        expect(config === null || config === void 0 ? void 0 : config.file).toContain("staticwebapp.config.json");
    });
    it("should find staticwebapp.config.json (recursively)", async () => {
        mock_fs_1.default({
            s: {
                w: {
                    a: {
                        "staticwebapp.config.json": `{ "routes": []}`,
                    },
                },
            },
        });
        const config = await user_config_1.findSWAConfigFile(".");
        expect(config === null || config === void 0 ? void 0 : config.file).toContain("staticwebapp.config.json");
    });
    it("should find routes.json (at the root)", async () => {
        mock_fs_1.default({
            "routes.json": `{ "routes": []}`,
        });
        const config = await user_config_1.findSWAConfigFile(".");
        expect(config === null || config === void 0 ? void 0 : config.file).toContain("routes.json");
    });
    it("should find routes.json (recursively)", async () => {
        mock_fs_1.default({
            s: {
                w: {
                    a: {
                        "routes.json": `{ "routes": []}`,
                    },
                },
            },
        });
        const config = await user_config_1.findSWAConfigFile(".");
        expect(config === null || config === void 0 ? void 0 : config.file).toContain("routes.json");
    });
    it("should ignore routes.json if a staticwebapp.config.json exists", async () => {
        mock_fs_1.default({
            s: {
                w: {
                    "staticwebapp.config.json": `{ "routes": []}`,
                    a: {
                        "routes.json": `{ "routes": []}`,
                    },
                },
            },
        });
        const config = await user_config_1.findSWAConfigFile(".");
        expect(config === null || config === void 0 ? void 0 : config.file).toContain("staticwebapp.config.json");
    });
});
//# sourceMappingURL=user-config.spec.js.map