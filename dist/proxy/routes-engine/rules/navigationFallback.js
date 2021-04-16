"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigationFallback = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("../../../core");
const glob_1 = require("../../../core/utils/glob");
// See: https://docs.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes
const navigationFallback = async (req, res, navigationFallback) => {
    var _a, _b;
    let originlUrl = req.url;
    // don't process .auth or api requests
    if ((originlUrl === null || originlUrl === void 0 ? void 0 : originlUrl.startsWith("/.auth")) || (originlUrl === null || originlUrl === void 0 ? void 0 : originlUrl.startsWith("/api"))) {
        return;
    }
    // exit if no rewrite rule provided
    if (!(navigationFallback === null || navigationFallback === void 0 ? void 0 : navigationFallback.rewrite)) {
        return;
    }
    // exit if no exclude property provided, or exclude list is empty
    if (!(navigationFallback === null || navigationFallback === void 0 ? void 0 : navigationFallback.exclude) || ((_a = navigationFallback === null || navigationFallback === void 0 ? void 0 : navigationFallback.exclude) === null || _a === void 0 ? void 0 : _a.length) === 0) {
        return;
    }
    core_1.logger.silly("checking navigationFallback rule...");
    // make sure we have a leading / in the URL
    if (navigationFallback.rewrite.startsWith("/") === false) {
        navigationFallback.rewrite = `/${navigationFallback.rewrite}`;
    }
    // is the requested file available on disk?
    const filename = (originlUrl === null || originlUrl === void 0 ? void 0 : originlUrl.endsWith("/")) ? `${originlUrl}/index.html` : originlUrl;
    const filepath = path_1.default.join(process.env.SWA_CLI_OUTPUT_LOCATION, filename);
    const isFileFoundOnDisk = fs_1.default.existsSync(filepath);
    core_1.logger.silly(` - url ${originlUrl}`);
    // parse the exclusion rules and match at least one rule
    const isMatchedFilter = (_b = navigationFallback === null || navigationFallback === void 0 ? void 0 : navigationFallback.exclude) === null || _b === void 0 ? void 0 : _b.some((filter) => {
        // we don't support full globs in the config file.
        // add this little utility to convert a wildcard into a valid glob pattern
        const regexp = new RegExp(`^${glob_1.globToRegExp(filter)}$`);
        const isMatch = regexp.test(originlUrl);
        core_1.logger.silly(`   - filter= ${filter}`);
        core_1.logger.silly(`   -  regexp= ${regexp}`);
        core_1.logger.silly(`   -  match= ${isMatch}`);
        return isMatch;
    });
    core_1.logger.silly(` - isMatchedFilter=${isMatchedFilter}`);
    // rules logic:
    // 1. if no exclude rules are provided, rewrite by default
    // 2. if a file exists on disk, and match exclusion => return it
    // 3. if a file doesn't exist on disk, and match exclusion => 404
    // 4. if a file exists on disk, and doesn't match exclusion => /index.html
    // 5. if a file doesn't exist on disk, and doesn't match exclusion => /index.html
    // note: given the complexity of all possible combinations, don't refactor the code below
    let newUrl = req.url;
    // 1.
    if (!navigationFallback.exclude || navigationFallback.exclude.length === 0) {
        newUrl = navigationFallback.rewrite;
        core_1.logger.silly(` - no exclude rules are provided (rewrite by default)`);
        core_1.logger.silly(` - url=${newUrl}`);
    }
    // 2.
    else if (isFileFoundOnDisk === true && isMatchedFilter === true) {
        newUrl = req.url;
        core_1.logger.silly(` - file exists on disk, and match exclusion`);
        core_1.logger.silly(` - url=${newUrl}`);
    }
    // 3.
    else if (isFileFoundOnDisk === false && isMatchedFilter === true) {
        res.statusCode = 404;
        core_1.logger.silly(` - file doesn't exist on disk, and match exclusion`);
        core_1.logger.silly(` - statusCode=404`);
    }
    // 4.
    else if (isFileFoundOnDisk === true && isMatchedFilter === false) {
        newUrl = navigationFallback.rewrite;
        core_1.logger.silly(` - file exists on disk, and doesn't match exclusion`);
        core_1.logger.silly(` - url=${newUrl}`);
    }
    // 5.
    else if (isFileFoundOnDisk === false && isMatchedFilter === false) {
        newUrl = navigationFallback.rewrite;
        core_1.logger.silly(` - file doesn't exist on disk, and doesn't match exclusion`);
        core_1.logger.silly(` - url=${newUrl}`);
    }
    req.url = newUrl;
};
exports.navigationFallback = navigationFallback;
//# sourceMappingURL=navigationFallback.js.map