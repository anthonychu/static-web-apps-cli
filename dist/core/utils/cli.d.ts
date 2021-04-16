/**
 * Parse process.argv and retrieve a specific flag value.
 * Usage:
 * ```
 * // ./server --port 4242
 * let port = argv<number>('--port');
 * ```
 *
 * @param flag the flag name to retrieve from argv, e.g.: --port
 * @returns {T} the value of the corresponding flag:
 * - if flag is --key=value or --key value, returns value as type `T`.
 * - if flag is --key, return a boolean (true if the flag is present, false if not).
 * - if flag is not present, return null.
 *
 */
export declare function argv<T extends string | number | boolean | null>(flag: string): T;
export declare const registerProcessExit: (fn: Function) => void;
export declare const createStartupScriptCommand: (startupScript: string, options: SWACLIConfig) => string | null;
//# sourceMappingURL=cli.d.ts.map
