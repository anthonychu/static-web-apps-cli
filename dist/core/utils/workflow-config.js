"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readWorkflowFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const config_1 = require("../../config");
const runtimes_1 = require("../runtimes");
const logger_1 = require("./logger");
const net_1 = require("./net");
const user_config_1 = require("./user-config");
const readWorkflowFile = ({ userConfig } = {}) => {
    let isAppDevServer = false;
    let isApiDevServer = false;
    if (userConfig) {
        // is dev servers? Skip reading workflow file
        isAppDevServer = net_1.isHttpUrl(userConfig === null || userConfig === void 0 ? void 0 : userConfig.outputLocation);
        isApiDevServer = net_1.isHttpUrl(userConfig === null || userConfig === void 0 ? void 0 : userConfig.apiLocation);
        if (isAppDevServer && isApiDevServer) {
            return userConfig && user_config_1.validateUserConfig(userConfig);
        }
    }
    const infoMessage = `GitHub Actions configuration was not found under ".github/workflows/"`;
    const githubActionFolder = path_1.default.resolve(process.cwd(), ".github/workflows/");
    // does the config folder exist?
    if (fs_1.default.existsSync(githubActionFolder) === false) {
        logger_1.logger.info(infoMessage);
        return userConfig && user_config_1.validateUserConfig(userConfig);
    }
    // find the SWA GitHub action file
    // TODO: handle multiple workflow files (see #32)
    let githubActionFile = fs_1.default
        .readdirSync(githubActionFolder)
        .filter((file) => file.includes("azure-static-web-apps") && file.endsWith(".yml"))
        .pop();
    // does the config file exist?
    if (!githubActionFile || fs_1.default.existsSync(githubActionFile)) {
        logger_1.logger.info(infoMessage);
        return userConfig && user_config_1.validateUserConfig(userConfig);
    }
    githubActionFile = path_1.default.resolve(githubActionFolder, githubActionFile);
    let githubActionContent = fs_1.default.readFileSync(githubActionFile, "utf8");
    if (typeof githubActionContent !== "string") {
        throw Error("TypeError: GitHub action file content should be a string");
    }
    // MOTE: the YAML library will parse and return properties as sanke_case
    // we will convert those properties to camelCase at the end of the function
    const swaYaml = yaml_1.default.parse(githubActionContent);
    if (!swaYaml) {
        throw Error(`could not parse the SWA workflow file "${githubActionFile}". Make sure it's a valid YAML file.`);
    }
    if (!swaYaml.jobs) {
        throw Error(`missing property 'jobs' in the SWA workflow file "${githubActionFile}". Make sure it's a valid SWA workflow file.`);
    }
    if (!swaYaml.jobs.build_and_deploy_job) {
        throw Error(`missing property 'jobs.build_and_deploy_job' in the SWA workflow file "${githubActionFile}". Make sure it's a valid SWA workflow file.`);
    }
    if (!swaYaml.jobs.build_and_deploy_job.steps) {
        throw Error(`missing property 'jobs.build_and_deploy_job.steps' in the SWA workflow file "${githubActionFile}". Make sure it's a valid SWA workflow file.`);
    }
    // hacking this to have an `any` on the type in .find, mainly because a typescript definition for the YAML file is painful...
    const swaBuildConfig = swaYaml.jobs.build_and_deploy_job.steps.find((step) => step.uses && step.uses.includes("static-web-apps-deploy"));
    if (!swaBuildConfig) {
        throw Error(`invalid property 'jobs.build_and_deploy_job.steps[]' in the SWA workflow file "${githubActionFile}". Make sure it's a valid SWA workflow file.`);
    }
    if (!swaBuildConfig.with) {
        throw Error(`missing property 'jobs.build_and_deploy_job.steps[].with' in the SWA workflow file "${githubActionFile}". Make sure it's a valid SWA workflow file.`);
    }
    // extract the user's config and set defaults
    let { app_build_command = config_1.DEFAULT_CONFIG.appBuildCommand, api_build_command = config_1.DEFAULT_CONFIG.apiBuildCommand, app_location = config_1.DEFAULT_CONFIG.appLocation, output_location = config_1.DEFAULT_CONFIG.outputLocation, api_location = config_1.DEFAULT_CONFIG.apiLocation, } = swaBuildConfig.with;
    // the following locations (extracted from the config) should be under the user's project folder:
    // - app_location
    // - api_location
    // - output_location
    app_location = path_1.default.normalize(path_1.default.join(process.cwd(), app_location));
    if (typeof api_location !== "undefined") {
        api_location = path_1.default.normalize(path_1.default.join(process.cwd(), api_location || path_1.default.sep));
    }
    output_location = path_1.default.normalize(output_location);
    const detectedRuntimeType = runtimes_1.detectRuntime(app_location);
    if (detectedRuntimeType === runtimes_1.RuntimeType.dotnet) {
        // TODO: work out what runtime is being used for .NET rather than hard-coded
        output_location = path_1.default.join(app_location, "bin", "Debug", "netstandard2.1", "publish", output_location);
    }
    else {
        output_location = path_1.default.join(app_location, output_location);
    }
    // override SWA config with user's config (if provided):
    // if the user provides different app location, app artifact location or api location, use that information
    if (userConfig) {
        userConfig = user_config_1.validateUserConfig(userConfig);
        app_location = userConfig === null || userConfig === void 0 ? void 0 : userConfig.appLocation;
        output_location = userConfig === null || userConfig === void 0 ? void 0 : userConfig.outputLocation;
        api_location = userConfig === null || userConfig === void 0 ? void 0 : userConfig.apiLocation;
    }
    const files = isAppDevServer && isApiDevServer ? undefined : [githubActionFile];
    // convert variable names to camelCase
    // instead of snake_case
    const config = {
        appBuildCommand: isAppDevServer ? undefined : app_build_command,
        apiBuildCommand: isApiDevServer ? undefined : api_build_command,
        appLocation: app_location,
        apiLocation: api_location,
        outputLocation: output_location,
        files,
    };
    logger_1.logger.silly({ config }, "swa");
    return config;
};
exports.readWorkflowFile = readWorkflowFile;
//# sourceMappingURL=workflow-config.js.map