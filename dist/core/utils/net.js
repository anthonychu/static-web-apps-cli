"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePort = exports.response = exports.address = exports.parseUrl = exports.validateDevServerConfig = exports.isHttpUrl = exports.isAcceptingTcpConnections = void 0;
const chalk_1 = __importDefault(require("chalk"));
const net_1 = __importDefault(require("net"));
const ora_1 = __importDefault(require("ora"));
const wait_on_1 = __importDefault(require("wait-on"));
const logger_1 = require("./logger");
function isAcceptingTcpConnections({ host = "127.0.0.1", port }) {
    return new Promise((resolve) => {
        const socket = net_1.default.createConnection(port, host);
        socket
            .once("error", () => {
            resolve(false);
            socket.end();
        })
            .once("connect", () => {
            resolve(true);
            socket.end();
        });
    });
}
exports.isAcceptingTcpConnections = isAcceptingTcpConnections;
function isHttpUrl(input) {
    try {
        const url = new URL(input);
        return url.protocol.startsWith("http");
    }
    catch {
        return false;
    }
}
exports.isHttpUrl = isHttpUrl;
async function validateDevServerConfig(context) {
    let { hostname, port } = parseUrl(context);
    try {
        const appListening = await isAcceptingTcpConnections({ port, host: hostname });
        if (appListening === false) {
            const spinner = ora_1.default();
            try {
                spinner.start(`Waiting for ${chalk_1.default.green(context)} to be ready...`);
                await wait_on_1.default({
                    resources: [exports.address(hostname, port)],
                    delay: 1000,
                    interval: 100,
                    simultaneous: 1,
                    timeout: 30000,
                    tcpTimeout: 1000,
                    window: 1000,
                    strictSSL: false,
                });
                spinner.succeed(`Connected to ${chalk_1.default.green(context)} successfully.`);
                spinner.clear();
            }
            catch (err) {
                spinner.fail();
                logger_1.logger.error(`Could not connect to "${context}". Is the server up and running?`);
                process.exit(-1);
            }
        }
    }
    catch (err) {
        if (err.message.includes("EACCES")) {
            logger_1.logger.error(`Port "${port}" cannot be used. You might need elevated or admin privileges. Or, use a valid port: 1024 to 49151.`);
        }
        else {
            logger_1.logger.error(err.message);
        }
        process.exit(-1);
    }
    return context;
}
exports.validateDevServerConfig = validateDevServerConfig;
function parseUrl(url) {
    const { protocol, port, host, hostname } = new URL(url);
    return {
        protocol,
        port: Number(port),
        host,
        hostname,
    };
}
exports.parseUrl = parseUrl;
const address = (host, port, protocol = `http`) => {
    if (!host) {
        throw new Error(`Host value is not set`);
    }
    let uri = port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
    try {
        new URL(uri);
    }
    catch (error) {
        throw new Error(`Address: ${uri} is malformed!`);
    }
    return uri;
};
exports.address = address;
const response = ({ status, headers, cookies, body = "" }) => {
    if (typeof status !== "number") {
        throw Error("TypeError: status code must be a number.");
    }
    body = body || null;
    const res = {
        status,
        cookies,
        headers: {
            status,
            "Content-Type": "application/json",
            ...headers,
        },
        body,
    };
    return res;
};
exports.response = response;
function parsePort(port) {
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber)) {
        logger_1.logger.error(`Port "${port}" is not a number.`, true);
    }
    else {
        if (portNumber < 1024 || portNumber > 49151) {
            logger_1.logger.error(`Port "${port}" is out of range. Allowed ports are from 1024 to 49151.`, true);
        }
    }
    return portNumber;
}
exports.parsePort = parsePort;
//# sourceMappingURL=net.js.map