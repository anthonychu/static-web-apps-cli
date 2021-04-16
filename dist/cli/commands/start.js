"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const concurrently_1 = __importDefault(require("concurrently"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const builder_1 = __importDefault(require("../../core/builder"));
const core_1 = require("../../core");
const swa_api_1 = require("../../core/utils/swa-api");
async function start(startContext, options) {
    // WARNING: code below doesn't have access to SWA CLI env vars which are defined later below
    // make sure this code (or code from utils) does't depend on SWA CLI env vars!
    var _a, _b, _c, _d, _e;
    let useAppDevServer = undefined;
    let useApiDevServer = undefined;
    let startupCommand = undefined;
    if (core_1.isHttpUrl(startContext)) {
        useAppDevServer = startContext;
        options.outputLocation = useAppDevServer;
    }
    else {
        // make sure the CLI default port is available before proceeding.
        if (await core_1.isAcceptingTcpConnections({ host: options.host, port: options.port })) {
            core_1.logger.error(`Port ${options.port} is already used. Choose a different port.`, true);
        }
        // start the emulator from a specific artifact folder, if folder exists
        if (fs_1.default.existsSync(startContext)) {
            options.outputLocation = startContext;
        }
        else {
            // prettier-ignore
            core_1.logger.error(`The dist folder "${startContext}" is not found.\n` +
                `Make sure that this folder exists or use the --build option to pre-build the static app.`, true);
        }
    }
    if (options.apiLocation) {
        if (core_1.isHttpUrl(options.apiLocation)) {
            useApiDevServer = options.apiLocation;
            options.apiLocation = useApiDevServer;
        }
        // make sure api folder exists
        else if (fs_1.default.existsSync(options.apiLocation) === false) {
            core_1.logger.info(`Skipping API because folder "${options.apiLocation}" is missing.`);
        }
        else {
            options.apiLocation = swa_api_1.generateSwaApiFunctions(options.apiLocation);
        }
    }
    // get the app and api artifact locations
    let [appLocation, outputLocation, apiLocation] = [options.appLocation, options.outputLocation, options.apiLocation];
    let apiPort = (options.apiPort || config_1.DEFAULT_CONFIG.apiPort);
    let userConfig = {
        appLocation,
        outputLocation,
        apiLocation,
    };
    // mix CLI args with the project's build workflow configuration (if any)
    // use any specific workflow config that the user might provide undef ".github/workflows/"
    // Note: CLI args will take precedence over workflow config
    userConfig = core_1.readWorkflowFile({
        userConfig,
    });
    const isApiLocationExistsOnDisk = fs_1.default.existsSync(userConfig === null || userConfig === void 0 ? void 0 : userConfig.apiLocation);
    // handle the API location config
    let serveApiCommand = "echo No API found. Skipping";
    if (useApiDevServer) {
        serveApiCommand = `echo 'using API dev server at ${useApiDevServer}'`;
        // get the API port from the dev server
        apiPort = (_a = core_1.parseUrl(useApiDevServer)) === null || _a === void 0 ? void 0 : _a.port;
    }
    else {
        if (options.apiLocation && (userConfig === null || userConfig === void 0 ? void 0 : userConfig.apiLocation)) {
            // @todo check if the func binary is globally available
            const funcBinary = "func";
            // serve the api if and only if the user provides a folder via the --api-location flag
            if (isApiLocationExistsOnDisk) {
                serveApiCommand = `cd ${userConfig.apiLocation} && ${funcBinary} start --cors "*" --port ${options.apiPort}`;
            }
        }
    }
    if (options.ssl) {
        if (options.sslCert === undefined || options.sslKey === undefined) {
            core_1.logger.error(`SSL Key or SSL Cert are required when using HTTPS`, true);
        }
    }
    if (options.run) {
        startupCommand = core_1.createStartupScriptCommand(options.run, options);
    }
    // WARNING: code from above doesn't have access to env vars which are only defined below
    // set env vars for current command
    const envVarsObj = {
        SWA_CLI_DEBUG: options.verbose,
        SWA_CLI_API_PORT: `${apiPort}`,
        SWA_CLI_APP_LOCATION: userConfig === null || userConfig === void 0 ? void 0 : userConfig.appLocation,
        SWA_CLI_OUTPUT_LOCATION: userConfig === null || userConfig === void 0 ? void 0 : userConfig.outputLocation,
        SWA_CLI_API_LOCATION: userConfig === null || userConfig === void 0 ? void 0 : userConfig.apiLocation,
        SWA_CLI_ROUTES_LOCATION: options.routesLocation,
        SWA_CLI_HOST: options.host,
        SWA_CLI_PORT: `${options.port}`,
        SWA_WORKFLOW_FILES: (_b = userConfig === null || userConfig === void 0 ? void 0 : userConfig.files) === null || _b === void 0 ? void 0 : _b.join(","),
        SWA_CLI_APP_SSL: `${options.ssl}`,
        SWA_CLI_APP_SSL_CERT: options.sslCert,
        SWA_CLI_APP_SSL_KEY: options.sslKey,
        SWA_CLI_STARTUP_COMMAND: startupCommand,
    };
    // merge SWA env variables with process.env
    process.env = { ...process.env, ...envVarsObj };
    // INFO: from here code may access SWA CLI env vars.
    const { env } = process;
    const concurrentlyCommands = [
        // start the reverse proxy
        { command: `node ${path_1.default.join(__dirname, "..", "..", "proxy", "server.js")}`, name: "swa", env, prefixColor: "gray.dim" },
    ];
    if (isApiLocationExistsOnDisk) {
        concurrentlyCommands.push(
        // serve the api, if it's available
        { command: serveApiCommand, name: "api", env, prefixColor: "gray.dim" });
    }
    if (startupCommand) {
        concurrentlyCommands.push(
        // run an external script, if it's available
        { command: `cd ${userConfig === null || userConfig === void 0 ? void 0 : userConfig.appLocation} && ${startupCommand}`, name: "run", env, prefixColor: "gray.dim" });
    }
    if (options.build) {
        // run the app/api builds
        await builder_1.default({
            config: userConfig,
        });
    }
    core_1.logger.silly({
        ssl: [options.ssl, options.sslCert, options.sslKey],
        env: envVarsObj,
        commands: {
            swa: (_c = concurrentlyCommands.find((c) => c.name === "swa")) === null || _c === void 0 ? void 0 : _c.command,
            api: (_d = concurrentlyCommands.find((c) => c.name === "api")) === null || _d === void 0 ? void 0 : _d.command,
            run: (_e = concurrentlyCommands.find((c) => c.name === "run")) === null || _e === void 0 ? void 0 : _e.command,
        },
    }, "swa");
    await concurrently_1.default(concurrentlyCommands, {
        restartTries: 0,
        prefix: "name",
    }).then(() => process.exit(), () => process.exit());
}
exports.start = start;
//# sourceMappingURL=start.js.map