"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const finalhandler_1 = __importDefault(require("finalhandler"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const https_1 = __importDefault(require("https"));
const internal_ip_1 = __importDefault(require("internal-ip"));
const path_1 = __importDefault(require("path"));
const serve_static_1 = __importDefault(require("serve-static"));
const auth_1 = require("../auth/");
const config_1 = require("../config");
const core_1 = require("../core");
const index_1 = require("./routes-engine/index");
const SWA_WORKFLOW_CONFIG_FILE = process.env.SWA_WORKFLOW_CONFIG_FILE;
const SWA_CLI_HOST = process.env.SWA_CLI_HOST;
const SWA_CLI_PORT = parseInt((process.env.SWA_CLI_PORT || config_1.DEFAULT_CONFIG.port), 10);
const SWA_CLI_API_URI = core_1.address(SWA_CLI_HOST, process.env.SWA_CLI_API_PORT);
const SWA_CLI_APP_LOCATION = (process.env.SWA_CLI_APP_LOCATION || config_1.DEFAULT_CONFIG.appLocation);
const SWA_CLI_ROUTES_LOCATION = (process.env.SWA_CLI_ROUTES_LOCATION || config_1.DEFAULT_CONFIG.routesLocation);
const SWA_CLI_OUTPUT_LOCATION = (process.env.SWA_CLI_OUTPUT_LOCATION || config_1.DEFAULT_CONFIG.outputLocation);
const SWA_CLI_API_LOCATION = (process.env.SWA_CLI_API_LOCATION || config_1.DEFAULT_CONFIG.apiLocation);
const SWA_CLI_APP_SSL = process.env.SWA_CLI_APP_SSL === "true" || config_1.DEFAULT_CONFIG.ssl === true;
const SWA_CLI_APP_SSL_KEY = process.env.SWA_CLI_APP_SSL_KEY;
const SWA_CLI_APP_SSL_CERT = process.env.SWA_CLI_APP_SSL_CERT;
const PROTOCOL = SWA_CLI_APP_SSL ? `https` : `http`;
const proxyApi = http_proxy_1.default.createProxyServer({ autoRewrite: true });
const proxyApp = http_proxy_1.default.createProxyServer({ autoRewrite: true });
const isStaticDevServer = core_1.isHttpUrl(SWA_CLI_OUTPUT_LOCATION);
const isApiDevServer = core_1.isHttpUrl(SWA_CLI_API_LOCATION);
if (!core_1.isHttpUrl(SWA_CLI_API_URI)) {
    core_1.logger.error(`The provided API URI ${SWA_CLI_API_URI} is not a valid. Exiting.`, true);
}
// TODO: handle multiple workflow files (see #32)
if (SWA_WORKFLOW_CONFIG_FILE) {
    core_1.logger.info(`\nFound workflow file:\n    ${chalk_1.default.green(SWA_WORKFLOW_CONFIG_FILE)}`);
}
const httpsServerOptions = SWA_CLI_APP_SSL
    ? {
        cert: fs_1.default.readFileSync(SWA_CLI_APP_SSL_CERT, "utf8"),
        key: fs_1.default.readFileSync(SWA_CLI_APP_SSL_KEY, "utf8"),
    }
    : null;
const SWA_PUBLIC_DIR = path_1.default.resolve(__dirname, "..", "public");
const logRequest = (req, target = null, statusCode = null) => {
    var _a, _b;
    if (((_a = process.env.SWA_CLI_BEBUG) === null || _a === void 0 ? void 0 : _a.includes("req")) === false) {
        return;
    }
    const host = target || `${PROTOCOL}://${req.headers.host}`;
    const url = ((_b = req.url) === null || _b === void 0 ? void 0 : _b.startsWith("/")) ? req.url : `/${req.url}`;
    if (statusCode) {
        core_1.logger.log(`${chalk_1.default.cyan(req.method)} ${host}${url} - ${chalk_1.default.green(statusCode)}`);
    }
    else {
        core_1.logger.log(chalk_1.default.yellow(`${req.method} ${host + url} (proxy)`));
    }
};
const serve = (root, req, res) => {
    // if the requested file is not foud on disk
    // or if routes rule config is 404
    // send our 404 custom page instead of serve-static's one.
    const file = path_1.default.join(root, req.url);
    if (fs_1.default.existsSync(file) === false) {
        req.url = "404.html";
        res.statusCode = 404;
        root = SWA_PUBLIC_DIR;
    }
    const done = finalhandler_1.default(req, res);
    return serve_static_1.default(root, { extensions: ["html"] })(req, res, done);
};
const onConnectionLost = (req, res, target) => (error) => {
    if (error.message.includes("ECONNREFUSED")) {
        const statusCode = 502;
        res.statusCode = statusCode;
        const uri = `${target}${req.url}`;
        core_1.logger.error(`${req.method} ${uri} - ${statusCode} (Bad Gateway)`);
    }
    else {
        core_1.logger.error(`${error.message}`);
    }
    core_1.logger.silly({ error });
    res.end();
};
const injectClientPrincipalCookies = (req) => {
    const cookie = req.headers.cookie;
    if (cookie && core_1.validateCookie(cookie)) {
        const user = core_1.decodeCookie(cookie);
        const buff = Buffer.from(JSON.stringify(user), "utf-8");
        req.headers["x-ms-client-principal"] = buff.toString("base64");
    }
};
const handleUserConfig = async (appLocation) => {
    if (!fs_1.default.existsSync(appLocation)) {
        return null;
    }
    const configFile = await core_1.findSWAConfigFile(appLocation);
    if (!configFile) {
        return null;
    }
    let configJson = null;
    try {
        configJson = require(configFile.file);
        configJson.isLegacyConfigFile = configFile.isLegacyConfigFile;
        core_1.logger.info(`\nFound configuration file:\n    ${chalk_1.default.green(configFile.file)}`);
        if (configFile.isLegacyConfigFile) {
            core_1.logger.info(`    ${chalk_1.default.yellow(`WARNING: Functionality defined in the routes.json file is now deprecated.`)}\n` +
                `    ${chalk_1.default.yellow(`Read more: https://docs.microsoft.com/azure/static-web-apps/configuration#routes`)}`);
        }
        return configJson;
    }
    catch (error) { }
    return configJson;
};
const requestHandler = (userConfig) => async function (req, res) {
    // not quite sure how you'd hit an undefined url, but the types say you can
    if (!req.url) {
        return;
    }
    if (userConfig) {
        await index_1.applyRules(req, res, userConfig);
        // in case a redirect rule has been applied, flush response
        if (res.getHeader("Location")) {
            logRequest(req, null, res.statusCode);
            return res.end();
        }
        if ([401, 403, 404].includes(res.statusCode)) {
            const isCustomUrl = req.url.startsWith(config_1.DEFAULT_CONFIG.customUrlScheme);
            if (isCustomUrl) {
                // extract user custom url
                req.url = req.url.replace(`${config_1.DEFAULT_CONFIG.customUrlScheme}`, "");
            }
            else {
                switch (res.statusCode) {
                    case 401:
                        req.url = "unauthorized.html";
                        break;
                    case 403:
                        // @TODO provide a Forbidden HTML template
                        req.url = "unauthorized.html";
                        break;
                    case 404:
                        req.url = "404.html";
                        break;
                }
                return serve(SWA_PUBLIC_DIR, req, res);
            }
            logRequest(req, null, res.statusCode);
        }
    }
    // don't serve staticwebapp.config.json / routes.json
    if (req.url.endsWith(config_1.DEFAULT_CONFIG.swaConfigFilename) || req.url.endsWith(config_1.DEFAULT_CONFIG.swaConfigFilenameLegacy)) {
        req.url = "404.html";
        res.statusCode = 404;
        serve(SWA_PUBLIC_DIR, req, res);
        logRequest(req, PROTOCOL + "://" + req.headers.host + req.url, 404);
    }
    // proxy AUTH request to AUTH emulator
    else if (req.url.startsWith("/.auth")) {
        const statusCode = await auth_1.processAuth(req, res);
        if (statusCode === 404) {
            req.url = "404.html";
            res.statusCode = 404;
            serve(SWA_PUBLIC_DIR, req, res);
        }
        logRequest(req, null, statusCode);
    }
    // proxy API request to Azure Functions emulator
    else if (req.url.startsWith(`/${config_1.DEFAULT_CONFIG.apiPrefix}`)) {
        const target = SWA_CLI_API_URI;
        injectClientPrincipalCookies(req);
        proxyApi.web(req, res, {
            target,
        }, onConnectionLost(req, res, target));
        proxyApi.once("proxyRes", (proxyRes, req) => {
            logRequest(req, null, proxyRes.statusCode);
        });
        logRequest(req);
    }
    // proxy APP requests
    else {
        const target = SWA_CLI_OUTPUT_LOCATION;
        // is this a dev server?
        if (isStaticDevServer) {
            proxyApp.web(req, res, {
                target,
                secure: false,
                toProxy: true,
            }, onConnectionLost(req, res, target));
            proxyApp.once("proxyRes", (proxyRes, req) => {
                logRequest(req, null, proxyRes.statusCode);
            });
            logRequest(req);
        }
        else {
            serve(target, req, res);
            logRequest(req, null, res.statusCode);
        }
    }
};
// start SWA proxy server
(async () => {
    let socketConnection;
    const localIpAdress = await internal_ip_1.default.v4();
    const onWsUpgrade = function (req, socket, head) {
        socketConnection = socket;
        const target = SWA_CLI_OUTPUT_LOCATION;
        if (isStaticDevServer) {
            core_1.logger.log(chalk_1.default.green("** WebSocket connection established **"));
            proxyApp.ws(req, socket, head, {
                target,
                secure: false,
            }, onConnectionLost(req, socket, target));
        }
    };
    const onServerStart = async () => {
        if (isStaticDevServer) {
            // prettier-ignore
            core_1.logger.log(`\nUsing dev server for static content:\n` +
                `    ${chalk_1.default.green(SWA_CLI_OUTPUT_LOCATION)}`);
        }
        else {
            // prettier-ignore
            core_1.logger.log(`\nServing static content:\n` +
                `    ${chalk_1.default.green(SWA_CLI_OUTPUT_LOCATION)}`);
        }
        if (SWA_CLI_API_LOCATION) {
            if (isApiDevServer) {
                // prettier-ignore
                core_1.logger.log(`\nUsing dev server for API:\n` +
                    `    ${chalk_1.default.green(SWA_CLI_API_LOCATION)}`);
            }
            else {
                // prettier-ignore
                core_1.logger.log(`\nServing API:\n` +
                    `    ${chalk_1.default.green(SWA_CLI_API_LOCATION)}`);
            }
        }
        // prettier-ignore
        core_1.logger.log(`\nAvailable on:\n` +
            `    ${chalk_1.default.green(core_1.address(`${localIpAdress}`, SWA_CLI_PORT, PROTOCOL))}\n` +
            `    ${chalk_1.default.green(core_1.address(SWA_CLI_HOST, SWA_CLI_PORT, PROTOCOL))}\n\n` +
            `Azure Static Web Apps emulator started. Press CTRL+C to exit.\n\n`);
        server.on("upgrade", onWsUpgrade);
        core_1.registerProcessExit(() => {
            core_1.logger.info("Azure Static Web Apps emulator shutting down...");
            socketConnection === null || socketConnection === void 0 ? void 0 : socketConnection.end(() => core_1.logger.info("WebSocket connection closed."));
            server.close(() => core_1.logger.log("Server stopped."));
            proxyApi.close(() => core_1.logger.log("Api proxy stopped."));
            proxyApp.close(() => core_1.logger.log("App proxy stopped."));
            process.exit(0);
        });
    };
    // load user custom rules if running in local mode (non-dev server)
    let userConfig = null;
    if (!isStaticDevServer) {
        userConfig = await handleUserConfig(SWA_CLI_ROUTES_LOCATION || SWA_CLI_APP_LOCATION);
    }
    const createServer = () => {
        if (SWA_CLI_APP_SSL && httpsServerOptions !== null) {
            return https_1.default.createServer(httpsServerOptions, requestHandler(userConfig));
        }
        return http_1.default.createServer(requestHandler(userConfig));
    };
    if (isStaticDevServer) {
        await core_1.validateDevServerConfig(SWA_CLI_OUTPUT_LOCATION);
    }
    const isApi = Boolean(SWA_CLI_API_LOCATION && SWA_CLI_API_URI);
    if (isApi) {
        await core_1.validateDevServerConfig(SWA_CLI_API_URI);
    }
    const server = createServer();
    server.listen(SWA_CLI_PORT, SWA_CLI_HOST, onServerStart);
    server.listen(SWA_CLI_PORT, localIpAdress);
})();
//# sourceMappingURL=server.js.map