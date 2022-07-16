import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "./utils/logger";

export async function getInstalledDockerVersion(): Promise<number | undefined> {
  try {
    const { stdout: versionsOutput } = await promisify(exec)(`docker version -f json`);
    const versions = JSON.parse(versionsOutput);
    const serverVersion = versions?.Server?.Version;
    return serverVersion;
  } catch (e) {
    logger.info(`Cannot get installed Docker version: ${e}`);
    return;
  }
}
