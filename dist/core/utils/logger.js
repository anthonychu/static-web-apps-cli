"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.logger = {
    _print(prefix, data) {
        if (prefix) {
            console.log(chalk_1.default.dim.gray(`[${prefix}]`), data);
        }
        else {
            console.log(data);
        }
    },
    _traverseObjectProperties(o, fn, indent = "") {
        for (const i in o) {
            if (Array.isArray(o) || (typeof o === "object" && o.hasOwnProperty(i))) {
                if (o[i] !== null && typeof o[i] === "object") {
                    fn(i, null, `${indent}`);
                    this._traverseObjectProperties(o[i], fn, ` ${indent}`);
                }
                else {
                    fn(i, o[i], ` ${indent}`);
                }
            }
        }
    },
    // public methods
    info(data, prefix = null) {
        this.silly(data, prefix, "info");
    },
    log(data, prefix = null) {
        this.silly(data, prefix, "log");
    },
    error(data, exit = false) {
        const { SWA_CLI_DEBUG } = process.env;
        if (!SWA_CLI_DEBUG || (SWA_CLI_DEBUG === null || SWA_CLI_DEBUG === void 0 ? void 0 : SWA_CLI_DEBUG.includes("silent"))) {
            return;
        }
        console.error(chalk_1.default.red(data));
        if (exit) {
            process.exit(-1);
        }
    },
    silly(data, prefix = null, debugFilter = "silly") {
        const { SWA_CLI_DEBUG } = process.env;
        if (!SWA_CLI_DEBUG || (SWA_CLI_DEBUG === null || SWA_CLI_DEBUG === void 0 ? void 0 : SWA_CLI_DEBUG.includes("silent"))) {
            return;
        }
        if ((SWA_CLI_DEBUG === null || SWA_CLI_DEBUG === void 0 ? void 0 : SWA_CLI_DEBUG.includes("silly")) || (SWA_CLI_DEBUG === null || SWA_CLI_DEBUG === void 0 ? void 0 : SWA_CLI_DEBUG.includes(debugFilter))) {
            if (typeof data === "object") {
                this._traverseObjectProperties(data, (key, value, indent) => {
                    if (value !== null) {
                        value = typeof value === "undefined" ? chalk_1.default.gray("<undefined>") : value;
                        this._print(prefix, `${indent}- ${key}: ${chalk_1.default.green(value)}`);
                    }
                    else {
                        this._print(prefix, `${indent}- ${key}:`);
                    }
                });
            }
            else {
                // data is not an object so just print its value even if it's null or undefined
                this._print(prefix, data);
            }
        }
    },
};
//# sourceMappingURL=logger.js.map