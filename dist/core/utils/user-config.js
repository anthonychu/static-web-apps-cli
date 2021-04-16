"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserConfig = exports.findSWAConfigFile = exports.traverseFolder = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const net_1 = require("./net");
const { readdir, readFile } = fs_1.promises;
async function* traverseFolder(folder) {
    const folders = (await readdir(folder, { withFileTypes: true }));
    for (const folderEntry of folders) {
        if (folderEntry.name.includes("node_modules")) {
            // ignore folder
            continue;
        }
        const entryPath = path_1.default.resolve(folder, folderEntry.name);
        if (folderEntry.isDirectory()) {
            yield* traverseFolder(entryPath);
        }
        else {
            yield entryPath;
        }
    }
}
exports.traverseFolder = traverseFolder;
async function findSWAConfigFile(folder) {
    const configFiles = new Map();
    for await (const file of traverseFolder(folder)) {
        const filename = path_1.default.basename(file);
        if (filename === config_1.DEFAULT_CONFIG.swaConfigFilename || filename === config_1.DEFAULT_CONFIG.swaConfigFilenameLegacy) {
            const config = JSON.parse((await readFile(file)).toString("utf-8"));
            // make sure we are using the right SWA config file.
            // Note: some JS frameworks (eg. Nuxt, Scully) use routes.json as part of their config. We need to ignore those
            const isValidSWAConfigFile = config.globalHeaders || config.mimeTypes || config.navigationFallback || config.responseOverrides || config.routes;
            if (isValidSWAConfigFile) {
                const isLegacyConfigFile = filename === config_1.DEFAULT_CONFIG.swaConfigFilenameLegacy;
                configFiles.set(filename, { file, isLegacyConfigFile });
            }
        }
    }
    // take staticwebapp.config.json if it exists (and ignore routes.json legacy file)
    if (configFiles.has(config_1.DEFAULT_CONFIG.swaConfigFilename)) {
        return configFiles.get(config_1.DEFAULT_CONFIG.swaConfigFilename);
    }
    // legacy config file
    else if (configFiles.has(config_1.DEFAULT_CONFIG.swaConfigFilenameLegacy)) {
        return configFiles.get(config_1.DEFAULT_CONFIG.swaConfigFilenameLegacy);
    }
    // no config file found
    return null;
}
exports.findSWAConfigFile = findSWAConfigFile;
function validateUserConfig(userConfig) {
    let appLocation = undefined;
    let apiLocation = undefined;
    let outputLocation = undefined;
    if (userConfig === null || userConfig === void 0 ? void 0 : userConfig.appLocation) {
        appLocation = path_1.default.normalize(path_1.default.join(process.cwd(), userConfig.appLocation || `.${path_1.default.sep}`));
        if (path_1.default.isAbsolute(userConfig.appLocation)) {
            appLocation = userConfig.appLocation;
        }
    }
    if (userConfig === null || userConfig === void 0 ? void 0 : userConfig.apiLocation) {
        if (net_1.isHttpUrl(userConfig.apiLocation)) {
            apiLocation = userConfig.apiLocation;
        }
        else {
            // use the user's config and construct an absolute path
            apiLocation = path_1.default.normalize(path_1.default.join(process.cwd(), userConfig.apiLocation));
        }
        if (path_1.default.isAbsolute(userConfig.apiLocation)) {
            apiLocation = userConfig.apiLocation;
        }
    }
    if (userConfig === null || userConfig === void 0 ? void 0 : userConfig.outputLocation) {
        // is dev server url
        if (net_1.isHttpUrl(userConfig.outputLocation)) {
            outputLocation = userConfig.outputLocation;
        }
        else {
            outputLocation = path_1.default.normalize(path_1.default.join(process.cwd(), userConfig.outputLocation || `.${path_1.default.sep}`));
            if (path_1.default.isAbsolute(userConfig.outputLocation)) {
                outputLocation = userConfig.outputLocation;
            }
        }
    }
    return {
        appLocation,
        apiLocation,
        outputLocation,
    };
}
exports.validateUserConfig = validateUserConfig;
//# sourceMappingURL=user-config.js.map