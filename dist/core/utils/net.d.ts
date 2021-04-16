export declare function isAcceptingTcpConnections({ host, port }: { host?: string; port: number }): Promise<boolean>;
export declare function isHttpUrl(input: string): boolean;
export declare function validateDevServerConfig(context: string): Promise<string>;
export declare function parseUrl(
  url: string
): {
  protocol: string;
  port: number;
  host: string;
  hostname: string;
};
export declare const address: (host: string, port: number | string | undefined, protocol?: string) => string;
export declare const response: ({
  status,
  headers,
  cookies,
  body,
}: ResponseOptions) => {
  status: number;
  cookies: any;
  headers: any;
  body: any;
};
export declare function parsePort(port: string): number;
//# sourceMappingURL=net.d.ts.map
