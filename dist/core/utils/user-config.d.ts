export declare function traverseFolder(folder: string): AsyncGenerator<string>;
export declare function findSWAConfigFile(
  folder: string
): Promise<
  | {
      file: string;
      isLegacyConfigFile: boolean;
    }
  | null
  | undefined
>;
export declare function validateUserConfig(userConfig: Partial<GithubActionWorkflow> | undefined): Partial<GithubActionWorkflow> | undefined;
//# sourceMappingURL=user-config.d.ts.map
