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
const commander_1 = __importStar(require("commander"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const core_1 = require("../core");
const generate_api_output_1 = require("./commands/generate-api-output");
const init_api_1 = require("./commands/init-api");
const start_1 = require("./commands/start");
exports.main = async function () {
    const cli = commander_1.default
        .name("swa")
        .usage("<command> [options]")
        .version(require("../../package.json").version, "-v, --version")
        // SWA config
        .option("--verbose [prefix]", "enable verbose output. Values are: silly,info,log,silent", config_1.DEFAULT_CONFIG.verbose)
        .addHelpText("after", "\nDocumentation:\n  https://aka.ms/swa/cli-local-development\n");
    commander_1.default
        .command("start [context]")
        .usage("[context] [options]")
        .description("start the emulator from a directory or bind to a dev server")
        .option("--app-location <appLocation>", "set location for the static app source code", config_1.DEFAULT_CONFIG.appLocation)
        .option("--app, --app-artifact-location <outputLocation>", "set the location of the build output directory relative to the --app-location.", config_1.DEFAULT_CONFIG.outputLocation)
        .option("--api, --api-location <apiLocation>", "set the API folder or Azure Functions emulator address", config_1.DEFAULT_CONFIG.apiLocation)
        .addOption(new commander_1.Option("--routes, --routes-location <routesLocation>", "set the directory location where the staticwebapp.config.json file is found. This location is relative to the root of the project")
        .default(config_1.DEFAULT_CONFIG.routesLocation)
        .hideHelp())
        // CLI config
        .option("--api-port <apiPort>", "set the API backend port", core_1.parsePort, config_1.DEFAULT_CONFIG.apiPort)
        .option("--host <host>", "set the cli host address", config_1.DEFAULT_CONFIG.host)
        .option("--port <port>", "set the cli port", core_1.parsePort, config_1.DEFAULT_CONFIG.port)
        .addOption(new commander_1.Option("--build", "build the app and API before starting the emulator").default(false).hideHelp())
        .option("--ssl", "serve the app and API over HTTPS", config_1.DEFAULT_CONFIG.ssl)
        .option("--ssl-cert <sslCertLocation>", "SSL certificate (.crt) to use for serving HTTPS", config_1.DEFAULT_CONFIG.sslCert)
        .option("--ssl-key <sslKeyLocation>", "SSL key (.key) to use for serving HTTPS", config_1.DEFAULT_CONFIG.sslKey)
        .addOption(new commander_1.Option("--run <startupScript>", "run a external program or npm/yarn script on startup").default(config_1.DEFAULT_CONFIG.run).hideHelp())
        .action(async (context = `.${path_1.default.sep}`, options) => {
        var _a;
        options = {
            ...options,
            verbose: cli.opts().verbose,
        };
        // make sure the start command gets the right verbosity level
        process.env.SWA_CLI_DEBUG = options.verbose;
        if ((_a = options.verbose) === null || _a === void 0 ? void 0 : _a.includes("silly")) {
            // when silly level is set,
            // propagate debugging level to other tools using the DEBUG environment variable
            process.env.DEBUG = "*";
        }
        await start_1.start(context, options);
    })
        .addHelpText("after", `
Examples:

  Serve static content from the current folder
  swa start

  Serve static content from a specific folder
  swa start ./output-folder

  Use an already running framework development server
  swa start http://localhost:3000

  Serve static content and run an API from another folder
  swa start ./output-folder --api ./api
    `);
    commander_1.default
        .command("init-api [context]")
        .usage("[context] [options]")
        .description("initialize an api folder")
        .option("--language <language>", "API language (JavaScript, Python, C#)")
        .action(async (context = `.${path_1.default.sep}`, options) => {
        var _a;
        options = {
            ...options,
            verbose: cli.opts().verbose,
        };
        // make sure the start command gets the right verbosity level
        process.env.SWA_CLI_DEBUG = options.verbose;
        if ((_a = options.verbose) === null || _a === void 0 ? void 0 : _a.includes("silly")) {
            // when silly level is set,
            // propagate debugging level to other tools using the DEBUG environment variable
            process.env.DEBUG = "*";
        }
        await init_api_1.initApi(context, options);
    });
    commander_1.default
        .command("generate-api-output [context]")
        .usage("[context] [options]")
        .description("generate an api output folder")
        .action(async (context = `.${path_1.default.sep}`, options) => {
        var _a;
        options = {
            ...options,
            verbose: cli.opts().verbose,
        };
        // make sure the start command gets the right verbosity level
        process.env.SWA_CLI_DEBUG = options.verbose;
        if ((_a = options.verbose) === null || _a === void 0 ? void 0 : _a.includes("silly")) {
            // when silly level is set,
            // propagate debugging level to other tools using the DEBUG environment variable
            process.env.DEBUG = "*";
        }
        await generate_api_output_1.generateApiOutput(context);
    });
    await commander_1.default.parseAsync(process.argv);
};
//# sourceMappingURL=index.js.map