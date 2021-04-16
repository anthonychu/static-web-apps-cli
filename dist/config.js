"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
const path_1 = __importDefault(require("path"));
exports.DEFAULT_CONFIG = {
    port: 4280,
    host: "0.0.0.0",
    apiPort: 7071,
    apiPrefix: "api",
    ssl: false,
    appLocation: `.${path_1.default.sep}`,
    outputLocation: `.${path_1.default.sep}`,
    routesLocation: `.${path_1.default.sep}`,
    sslCert: undefined,
    sslKey: undefined,
    appBuildCommand: "npm run build --if-present",
    apiBuildCommand: "npm run build --if-present",
    swaConfigFilename: "staticwebapp.config.json",
    swaConfigFilenameLegacy: "routes.json",
    run: undefined,
    verbose: "log",
    customUrlScheme: "swa://",
};
//# sourceMappingURL=config.js.map