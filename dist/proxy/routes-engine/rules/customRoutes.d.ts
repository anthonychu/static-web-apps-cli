import http from "http";
export declare const matchRoute: (req: http.IncomingMessage, isLegacyConfigFile: boolean) => (routeDef: SWAConfigFileRoute) => boolean;
export declare const customRoutes: (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  userDefinedRoute: SWAConfigFileRoute | undefined
) => Promise<undefined>;
//# sourceMappingURL=customRoutes.d.ts.map
