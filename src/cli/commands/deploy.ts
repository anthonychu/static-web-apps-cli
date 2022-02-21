import { spawn } from "child_process";
import * as fs from "fs";
import fetch from "node-fetch";
import * as os from "os";
import * as path from "path";

interface DeployOptions {
  appOutputLocation: string;
  apiOutputLocation: string;
  deploymentToken: string;
}

export async function deploy(options: DeployOptions) {
  // TODO: need to handle folders that aren't in cwd, like if options.appOutputLocation is ../../foo
  // TODO: need to test on Windows
  const appOutputLocation = options.appOutputLocation ?? "/";
  const apiOutputLocation = options.apiOutputLocation ?? "";
  const deploymentToken = options.deploymentToken;

  // console.log("deploy", appOutputLocation, apiOutputLocation, deploymentToken);

  const clientPath = await downloadClient();

  const env = Object.assign({}, process.env, {
    DEPLOYMENT_TOKEN: deploymentToken,
    DEPLOYMENT_ACTION: "upload",
    DEPLOYMENT_PROVIDER: "Custom",
    REPOSITORY_BASE: process.cwd(),
    APP_LOCATION: appOutputLocation,
    SKIP_APP_BUILD: "true",
    API_LOCATION: apiOutputLocation,
    SKIP_API_BUILD: "true",
  });

  if (!deploymentToken) {
    throw new Error("Deployment token is required");
  }

  const child = spawn(clientPath, [], {
    stdio: [process.stdin, process.stdout, process.stderr, "pipe"],
    env,
  });

  child.on("exit", (code) => {
    deleteZips();
    process.exit(code as number);
  });
}

async function downloadClient(): Promise<string> {
  const versions = await fetch("https://20220219swadeploy.blob.core.windows.net/download/versions.json").then((res) => res.json());

  const latestVersion = Object.keys(versions).find((version) => versions[version].isLatest);

  if (latestVersion === undefined) {
    // TODO: maybe still use the downloaded version
    throw new Error("Could not find latest version");
  }

  const downloadFolder = path.join(os.homedir(), ".swa", "deploy");
  fs.mkdirSync(downloadFolder, { recursive: true });

  let downloadedVersion = "";

  if (fs.existsSync(path.join(downloadFolder, "version.txt"))) {
    downloadedVersion = fs.readFileSync(path.join(downloadFolder, "version.txt"), "utf8");
  }

  if (downloadedVersion !== latestVersion) {
    const platform = getPlatform();
    const downloadUrl = versions[latestVersion][platform].url as string;
    const downloadFilename = path.basename(downloadUrl);
    const downloadPath = path.join(downloadFolder, downloadFilename);

    console.log(`Downloading ${downloadUrl} to ${downloadPath}`);

    await fetch(downloadUrl)
      .then((res) => res.buffer())
      .then((buffer) => fs.writeFileSync(downloadPath, buffer));

    const isPosix = process.platform === "linux" || process.platform === "darwin";
    if (isPosix) {
      fs.chmodSync(downloadPath, 0o755);
    }

    fs.writeFileSync(path.join(downloadFolder, "version.txt"), latestVersion);
  }

  if (fs.existsSync(path.join(downloadFolder, "StaticSitesClient.exe"))) {
    return path.join(downloadFolder, "StaticSitesClient.exe");
  } else {
    return path.join(downloadFolder, "StaticSitesClient");
  }
}

function getPlatform(): string {
  switch (os.platform()) {
    case "win32":
      return "win-x64";
    case "darwin":
      return "osx-x64";
    case "linux":
      return "linux-x64";
    default:
      throw new Error(`Unsupported platform: ${os.platform()}`);
  }
}

// TODO: get StaticSiteClient to remove zip files
function deleteZips() {
  if (fs.existsSync(path.join(process.cwd(), ".\\app.zip"))) {
    try {
      fs.unlinkSync(path.join(process.cwd(), ".\\app.zip"));
    } catch {}
  }
  if (fs.existsSync(path.join(process.cwd(), ".\\api.zip"))) {
    try {
      fs.unlinkSync(path.join(process.cwd(), ".\\api.zip"));
    } catch {}
  }
}
