"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRuntimeHost = void 0;
const config_1 = require("../config");
const runtimes_1 = require("./runtimes");
const httpServerBin = "npx http-server";
const createRuntimeHost = ({ appPort, proxyHost, appLocation, outputLocation }) => {
    const runtimeType = runtimes_1.detectRuntime(appLocation);
    switch (runtimeType) {
        // .NET runtime
        case runtimes_1.RuntimeType.dotnet:
            return {
                command: "dotnet",
                args: `watch --project ${appLocation} run --urls=http://${proxyHost}:${appPort}`.split(" "),
            };
        // Node.js runtime or static sites
        case runtimes_1.RuntimeType.node:
        case runtimes_1.RuntimeType.unknown:
        default:
            const command = httpServerBin;
            outputLocation = outputLocation || config_1.DEFAULT_CONFIG.outputLocation;
            // See available options for http-server: https://github.com/http-party/http-server#available-options
            // Note: --proxy allows us to add fallback routes for SPA (https://github.com/http-party/http-server#catch-all-redirect)
            const args = `${outputLocation} -d false --host ${proxyHost} --port ${appPort} --cache -1`.split(" ");
            return {
                command,
                args,
            };
    }
};
exports.createRuntimeHost = createRuntimeHost;
//# sourceMappingURL=runtime-host.js.map