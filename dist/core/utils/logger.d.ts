export declare const logger: {
  _print(prefix: string | null, data: string): void;
  _traverseObjectProperties(o: any, fn: (_prop: string, _value: any, _indent: string) => void, indent?: string): void;
  info(data: string | object, prefix?: string | null): void;
  log(data: string | object, prefix?: string | null): void;
  error(data: string | object, exit?: boolean): void;
  silly(data: string | object, prefix?: string | null, debugFilter?: DebugFilterLevel): void;
};
//# sourceMappingURL=logger.d.ts.map
