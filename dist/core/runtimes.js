"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectRuntime = exports.RuntimeType = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./utils/index");
var RuntimeType;
(function (RuntimeType) {
    RuntimeType["dotnet"] = "dotnet";
    RuntimeType["node"] = "node.js";
    RuntimeType["unknown"] = "unknown";
})(RuntimeType = exports.RuntimeType || (exports.RuntimeType = {}));
const detectRuntime = (appLocation) => {
    if (!appLocation || fs_1.default.existsSync(appLocation) === false) {
        index_1.logger.info(`The provided app location "${appLocation}" was not found. Can't detect runtime!`);
        return RuntimeType.unknown;
    }
    const files = fs_1.default.readdirSync(appLocation);
    if (files.some((file) => [".csproj", ".sln"].includes(path_1.default.extname(file)))) {
        return RuntimeType.dotnet;
    }
    if (files.includes("package.json")) {
        return RuntimeType.node;
    }
    index_1.logger.silly(`Detected runtime: ${RuntimeType}`);
    return RuntimeType.unknown;
};
exports.detectRuntime = detectRuntime;
//# sourceMappingURL=runtimes.js.map