"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalHeaders = void 0;
const core_1 = require("../../../core");
// See: https://docs.microsoft.com/en-us/azure/static-web-apps/configuration#global-headers
const globalHeaders = async (_req, res, globalHeaders) => {
    core_1.logger.silly("checking globalHeaders rule...");
    for (const header in globalHeaders) {
        if (globalHeaders[header] === "") {
            res.removeHeader(header);
            core_1.logger.silly(` - removing header: ${header}`);
        }
        else {
            res.setHeader(header, globalHeaders[header]);
            core_1.logger.silly(` - adding header: ${header}=${globalHeaders[header]}`);
        }
    }
};
exports.globalHeaders = globalHeaders;
//# sourceMappingURL=globalHeaders.js.map