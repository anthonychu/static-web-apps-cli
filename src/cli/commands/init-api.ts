import * as path from "path";
import * as fse from "fs-extra";
import { logger } from "../../core";
import { spawnSync } from "child_process";

export async function initApi(context: string, options: any) {
  console.log({
    context,
    options,
  });

  context = context ?? ".";

  if (options.language !== "python") {
    logger.error("Only language 'python' is supported at this time");
    process.exit(1);
  }

  if (!process.env.VIRTUAL_ENV) {
    logger.error("Create and activate a Python virtual environment before continuing");
    logger.log(`
    python -m venv .venv
    source .venv/bin/activate
        `);
    process.exit(1);
  }

  const apiPath = path.resolve(process.cwd(), "api");
  const templatePath = path.resolve(__dirname, "../../templates/python-api");

  if (fse.existsSync(apiPath)) {
    logger.error(`API folder ${apiPath} already exists`);
    process.exit(1);
  }

  fse.mkdirSync(apiPath);
  fse.copySync(templatePath, apiPath);

  const gitIgnorepath = path.resolve(process.cwd(), ".gitignore");
  if (!fse.existsSync(gitIgnorepath)) {
    fse.copyFileSync(path.resolve(__dirname, "../../templates/_gitignore"), gitIgnorepath);
  }

  spawnSync("python", ["-m", "pip", "install", "-r", path.join(apiPath, "requirements.txt")], { stdio: "inherit" });

  logger.log(`API folder ${apiPath} created.`);
}
