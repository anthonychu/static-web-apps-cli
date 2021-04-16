"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseOverrides = void 0;
const config_1 = require("../../../config");
const core_1 = require("../../../core");
// See: https://docs.microsoft.com/en-us/azure/static-web-apps/configuration#response-overrides
const responseOverrides = async (req, res, responseOverrides) => {
    const statusCode = res.statusCode;
    if ([400, 401, 403, 404].includes(statusCode)) {
        const overridenStatusCode = responseOverrides === null || responseOverrides === void 0 ? void 0 : responseOverrides[`${statusCode}`];
        if (overridenStatusCode) {
            core_1.logger.silly("checking responseOverrides rule...");
            if (overridenStatusCode.statusCode) {
                res.statusCode = overridenStatusCode.statusCode;
                core_1.logger.silly(` - statusCode: ${statusCode}`);
            }
            if (overridenStatusCode.redirect) {
                res.setHeader("Location", overridenStatusCode.redirect);
                core_1.logger.silly(` - Location: ${overridenStatusCode.redirect}`);
            }
            if (overridenStatusCode.rewrite && req.url !== overridenStatusCode.rewrite) {
                req.url = `${config_1.DEFAULT_CONFIG.customUrlScheme}${overridenStatusCode.rewrite}`;
                core_1.logger.silly(` - url: ${req.url}`);
            }
        }
    }
};
exports.responseOverrides = responseOverrides;
//# sourceMappingURL=responseOverrides.js.map