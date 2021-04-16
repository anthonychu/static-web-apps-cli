"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartupScriptCommand = exports.registerProcessExit = exports.argv = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
/**
 * Parse process.argv and retrieve a specific flag value.
 * Usage:
 * ```
 * // ./server --port 4242
 * let port = argv<number>('--port');
 * ```
 *
 * @param flag the flag name to retrieve from argv, e.g.: --port
 * @returns {T} the value of the corresponding flag:
 * - if flag is --key=value or --key value, returns value as type `T`.
 * - if flag is --key, return a boolean (true if the flag is present, false if not).
 * - if flag is not present, return null.
 *
 */
function argv(flag) {
    var _a;
    const flags = process.argv;
    for (let index = 0; index < flags.length; index++) {
        const entry = flags[index];
        // ex: --key=value
        if (entry.startsWith("--")) {
            if (entry.includes("=")) {
                // ex: [--key, value]
                const [key, value] = entry.split("=");
                if (flag === key.trim()) {
                    // ex: --key=value --> value
                    // ex: --key=      --> null
                    return (!!value ? value.trim() : null);
                }
            }
            // ex: --key value
            // ex: --key
            else if (flag === entry.trim()) {
                const nextEntry = (_a = flags[index + 1]) === null || _a === void 0 ? void 0 : _a.trim();
                // ex: --key
                if (nextEntry === undefined || (nextEntry === null || nextEntry === void 0 ? void 0 : nextEntry.startsWith("--"))) {
                    return true;
                }
                // ex: --key value
                else if (!!nextEntry) {
                    return nextEntry;
                }
            }
            else {
                // flag wasn't found
                return false;
            }
        }
    }
    return null;
}
exports.argv = argv;
const registerProcessExit = (fn) => {
    let terminated = false;
    const wrapper = () => {
        if (!terminated) {
            terminated = true;
            fn();
        }
    };
    process.on("SIGINT", wrapper);
    process.on("SIGTERM", wrapper);
    process.on("exit", wrapper);
};
exports.registerProcessExit = registerProcessExit;
const createStartupScriptCommand = (startupScript, options) => {
    if (startupScript.includes(":")) {
        const [npmOrYarnBin, ...npmOrYarnScript] = startupScript.split(":");
        if (["npm", "yarn"].includes(npmOrYarnBin)) {
            return `${npmOrYarnBin} run ${npmOrYarnScript.join(":")} --if-present`;
        }
        else if (["npx"].includes(npmOrYarnBin)) {
            return `${npmOrYarnBin} ${npmOrYarnScript.join(":")}`;
        }
    }
    else {
        if (!path_1.default.isAbsolute(startupScript)) {
            const { appLocation } = options;
            const cwd = appLocation || process.cwd();
            startupScript = path_1.default.resolve(cwd, startupScript);
        }
        if (fs_1.default.existsSync(startupScript)) {
            return startupScript;
        }
        else {
            logger_1.logger.error(`Script file "${startupScript}" was not found.`, true);
        }
    }
    return null;
};
exports.createStartupScriptCommand = createStartupScriptCommand;
//# sourceMappingURL=cli.js.map