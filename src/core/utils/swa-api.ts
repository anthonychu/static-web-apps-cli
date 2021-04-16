import * as fs from "fs";
import * as path from "path";
import * as fse from "fs-extra";
import { logger } from "./logger";
import { spawnSync } from "child_process";

const API_OUTPUT_FOLDER = ".api";
const LOGGER_PREFIX = "---";

export function generateSwaApiFunctions(apiFolder: string, generateOnly = false) {
  const apiPath = path.resolve(process.cwd(), apiFolder);
  const outputPath = path.resolve(process.cwd(), API_OUTPUT_FOLDER);
  logger.log("Functions output folder: " + outputPath, LOGGER_PREFIX);

  const isPythonSwaApi = fs.existsSync(path.resolve(apiPath, "main.py")) && !fs.existsSync(path.resolve(apiPath, "host.json"));
  if (isPythonSwaApi) {
    if (!generateOnly && !process.env.VIRTUAL_ENV) {
      logger.error("Virtual environment not activated");
      process.exit(1);
    }

    logger.log("Python SWA API project detected", LOGGER_PREFIX);
    if (fs.existsSync(outputPath)) {
      logger.log(`Cleaning ${outputPath}...`, LOGGER_PREFIX);
      fs.rmSync(outputPath, { recursive: true, force: true });
    }

    const templatePath = path.resolve(__dirname, "../../templates/python");
    fs.mkdirSync(outputPath);
    fse.copySync(apiPath, outputPath);
    fse.copySync(templatePath, outputPath, { overwrite: false });

    if (!generateOnly) {
      spawnSync("python", ["-m", "pip", "install", "-r", path.join(outputPath, "requirements-all.txt")], { stdio: "inherit" });
    }

    return outputPath;
  }

  return apiFolder;
}
