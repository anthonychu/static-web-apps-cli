import chalk from "chalk";
import type http from "http";
import httpProxy from "http-proxy";
import { decodeCookie, logger, logRequest, registerProcessExit, validateCookie } from "../../core";
import { HAS_DB } from "../../core/constants";
import { onConnectionLost } from "../middlewares/request.middleware";

const proxyApi = httpProxy.createProxyServer({ autoRewrite: true });
registerProcessExit(() => {
  logger.silly(`killing SWA CLI`);
  proxyApi.close(() => logger.log("Data Gateway proxy stopped."));
  // process.exit(0);
});

// TODO: extract these shared functions to a common file
function injectHeaders(req: http.ClientRequest, host: string | undefined) {
  logger.silly(`injecting headers to Data Gateway request:`);
  if (!req.getHeader("x-ms-original-url")) {
    req.setHeader("x-ms-original-url", encodeURI(new URL(req.path!, host).toString()));
    logger.silly(` - x-ms-original-url: ${chalk.yellow(req.getHeader("x-ms-original-url"))}`);
  }
  // generate a fake correlation ID
  req.setHeader("x-ms-request-id", `SWA-CLI-${Math.random().toString(36).substring(2).toUpperCase()}`);
  logger.silly(` - x-ms-request-id: ${chalk.yellow(req.getHeader("x-ms-request-id"))}`);
}

function injectClientPrincipalCookies(req: http.ClientRequest) {
  logger.silly(`injecting client principal to Data Gateway request:`);

  const cookie = req.getHeader("cookie") as string;
  if (cookie && validateCookie(cookie)) {
    const user = decodeCookie(cookie);

    // Remove claims from client principal to match SWA behaviour. See https://github.com/MicrosoftDocs/azure-docs/issues/86803.
    // The following property deletion can be removed depending on outcome of the above issue.
    if (user) {
      delete user["claims"];
    }

    const buff = Buffer.from(JSON.stringify(user), "utf-8");
    const token = buff.toString("base64");
    req.setHeader("X-MS-CLIENT-PRINCIPAL", token);
    logger.silly(` - X-MS-CLIENT-PRINCIPAL: ${chalk.yellow(req.getHeader("X-MS-CLIENT-PRINCIPAL"))}`);

    // locally, we set the JWT bearer token to be the same as the cookie value because we are not using the real auth flow.
    // Note: on production, SWA uses a valid encrypted JWT token!
    if (!req.getHeader("authorization")) {
      req.setHeader("authorization", `Bearer ${token}`);
      logger.silly(` - Authorization: ${chalk.yellow(req.getHeader("authorization"))}`);
    }
  } else {
    logger.silly(` - no valid cookie found`);
  }
}

export function handleDataGatewayRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const target = "http://localhost:5000";
  if (HAS_DB) {
    logger.silly(`data gateway request detected. Proxying to Data Gateway emulator`);
    logger.silly(` - target: ${chalk.yellow(target)}`);
  } else {
    logger.log(`***************************************************************************`);
    logger.log(`** Data Gateway request detected but no endpoint configuration was found.**`);
    logger.log(`** Use the --db-location option to configure a Data Gateway endpoint.    **`);
    logger.log(`***************************************************************************`);
  }

  req.url = req.url?.replace(/^\/db-api/, "");

  proxyApi.web(
    req,
    res,
    {
      target,
    },
    onConnectionLost(req, res, target, "↳")
  );

  proxyApi.once("proxyReq", (proxyReq: http.ClientRequest) => {
    injectHeaders(proxyReq, target);
    injectClientPrincipalCookies(proxyReq);
  });

  proxyApi.once("proxyRes", (proxyRes: http.IncomingMessage) => {
    logger.silly(`getting response from remote host`);
    logRequest(req, "", proxyRes.statusCode);
  });

  logRequest(req, target);
}

export function isDataGatewayRequest(req: http.IncomingMessage, rewritePath?: string) {
  let path = rewritePath || req.url;
  return Boolean(path?.toLowerCase().startsWith(`/db-api/`));
}