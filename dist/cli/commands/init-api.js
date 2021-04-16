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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApi = void 0;
const path = __importStar(require("path"));
const fse = __importStar(require("fs-extra"));
const core_1 = require("../../core");
const child_process_1 = require("child_process");
async function initApi(context, options) {
    console.log({
        context,
        options,
    });
    context = context !== null && context !== void 0 ? context : ".";
    if (options.language !== "python") {
        core_1.logger.error("Only language 'python' is supported at this time");
        process.exit(1);
    }
    if (!process.env.VIRTUAL_ENV) {
        core_1.logger.error("Create and activate a Python virtual environment before continuing");
        core_1.logger.log(`
    python -m venv .venv
    source .venv/bin/activate
        `);
        process.exit(1);
    }
    const apiPath = path.resolve(process.cwd(), "api");
    const templatePath = path.resolve(__dirname, "../../templates/python-api");
    if (fse.existsSync(apiPath)) {
        core_1.logger.error(`API folder ${apiPath} already exists`);
        process.exit(1);
    }
    fse.mkdirSync(apiPath);
    fse.copySync(templatePath, apiPath);
    child_process_1.spawnSync("python", ["-m", "pip", "install", "-r", path.join(apiPath, "requirements.txt")], { stdio: "inherit" });
    core_1.logger.log(`API folder ${apiPath} created.`);
}
exports.initApi = initApi;
//# sourceMappingURL=init-api.js.map