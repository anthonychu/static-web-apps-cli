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
exports.generateSwaApiFunctions = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fse = __importStar(require("fs-extra"));
const logger_1 = require("./logger");
const child_process_1 = require("child_process");
const API_OUTPUT_FOLDER = ".api";
const LOGGER_PREFIX = "---";
function generateSwaApiFunctions(apiFolder, generateOnly = false) {
    const apiPath = path.resolve(process.cwd(), apiFolder);
    const outputPath = path.resolve(process.cwd(), API_OUTPUT_FOLDER);
    logger_1.logger.log("Functions output folder: " + outputPath, LOGGER_PREFIX);
    const isPythonSwaApi = fs.existsSync(path.resolve(apiPath, "main.py")) && !fs.existsSync(path.resolve(apiPath, "host.json"));
    if (isPythonSwaApi) {
        if (!generateOnly && !process.env.VIRTUAL_ENV) {
            logger_1.logger.error("Virtual environment not activated");
            process.exit(1);
        }
        logger_1.logger.log("Python SWA API project detected", LOGGER_PREFIX);
        if (fs.existsSync(outputPath)) {
            logger_1.logger.log(`Cleaning ${outputPath}...`, LOGGER_PREFIX);
            fs.rmSync(outputPath, { recursive: true, force: true });
        }
        const templatePath = path.resolve(__dirname, "../../templates/python");
        fs.mkdirSync(outputPath);
        fse.copySync(apiPath, outputPath);
        fse.copySync(templatePath, outputPath, { overwrite: false });
        if (!generateOnly) {
            child_process_1.spawnSync("python", ["-m", "pip", "install", "-r", path.join(outputPath, "requirements-all.txt")], { stdio: "inherit" });
        }
        return outputPath;
    }
    return apiFolder;
}
exports.generateSwaApiFunctions = generateSwaApiFunctions;
//# sourceMappingURL=swa-api.js.map