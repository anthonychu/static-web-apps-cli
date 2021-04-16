"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const concurrently_1 = __importDefault(require("concurrently"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const runtimes_1 = require("./runtimes");
const utils_1 = require("./utils");
const nodeBuilder = (location, buildCommand, name, colour) => {
    return concurrently_1.default([
        {
            command: `npm install && ${buildCommand}`,
            name: name,
            prefixColor: colour,
            env: {
                CI: "1",
            },
        },
    ], {
        cwd: location,
        killOthers: ["failure"],
    });
};
const dotnetBuilder = (location, name, colour) => {
    return concurrently_1.default([
        {
            command: `dotnet build`,
            name: name,
            env: {
                CI: "1",
            },
            prefixColor: colour,
        },
    ], {
        cwd: location,
        killOthers: ["failure"],
    });
};
const builder = async ({ config }) => {
    if (config) {
        let { appLocation, apiLocation, appBuildCommand, apiBuildCommand } = config;
        const runtimeType = runtimes_1.detectRuntime(appLocation);
        utils_1.logger.silly({
            config,
            runtimeType,
        }, "swa");
        try {
            switch (runtimeType) {
                case runtimes_1.RuntimeType.dotnet:
                    {
                        // build app
                        await dotnetBuilder(appLocation, "dot", "dim.gray");
                        // NOTE: API is optional. Build it only if it exists
                        // This may result in a double-compile of some libraries if they are shared between the
                        // Blazor app and the API, but it's an acceptable outcome
                        apiLocation = path_1.default.resolve(process.cwd(), apiLocation);
                        if (fs_1.default.existsSync(apiLocation) === true && fs_1.default.existsSync(path_1.default.join(apiLocation, "host.json"))) {
                            await dotnetBuilder(apiLocation, "api", "dim.gray");
                        }
                    }
                    break;
                case runtimes_1.RuntimeType.node:
                default:
                    {
                        // figure out if appLocation exists
                        const isPackageJsonExists = fs_1.default.existsSync(appLocation) && fs_1.default.existsSync(path_1.default.join(appLocation, "package.json"));
                        const isAppDevServer = utils_1.isHttpUrl(config.outputLocation);
                        // build app
                        if (isPackageJsonExists) {
                            utils_1.logger.silly(chalk_1.default.green("Building app..."), "npm");
                            await nodeBuilder(appLocation, appBuildCommand, "npm", "dim.gray");
                        }
                        else if (isAppDevServer) {
                            utils_1.logger.silly(chalk_1.default.yellow(`Skipping app build: App served from ${config.outputLocation}`), "npm");
                        }
                        else {
                            utils_1.logger.silly(chalk_1.default.yellow("Skipping app build: No package.json found."), "npm");
                        }
                        // NOTE: API is optional. Build it only if it exists
                        const isAzureFunctionsProject = apiLocation && fs_1.default.existsSync(apiLocation) === true && fs_1.default.existsSync(path_1.default.join(apiLocation, "host.json"));
                        const isApiDevServer = utils_1.isHttpUrl(config.apiLocation);
                        if (isAzureFunctionsProject) {
                            utils_1.logger.silly(chalk_1.default.green("Building API..."), "npm");
                            await nodeBuilder(apiLocation, apiBuildCommand, "npm", "dim.gray");
                        }
                        else if (isApiDevServer) {
                            utils_1.logger.silly(chalk_1.default.yellow(`Skipping API build: API served from ${apiLocation}`), "npm");
                        }
                        else {
                            utils_1.logger.silly(chalk_1.default.yellow("Skipping API build: Not a valid Azure Functions project."), "npm");
                        }
                    }
                    break;
            }
        }
        catch (stderr) { }
    }
};
exports.default = builder;
//# sourceMappingURL=builder.js.map