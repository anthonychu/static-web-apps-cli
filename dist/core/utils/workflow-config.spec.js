"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_fs_1 = __importDefault(require("mock-fs"));
const path_1 = __importDefault(require("path"));
const workflow_config_1 = require("./workflow-config");
describe("readWorkflowFile()", () => {
    afterEach(() => {
        mock_fs_1.default.restore();
    });
    it("config file not found should return undefined", () => {
        expect(workflow_config_1.readWorkflowFile()).toBe(undefined);
    });
    it("config file with wrong filename should return undefined", () => {
        mock_fs_1.default({
            ".github/workflows/wrong-file-name-pattern.yml": "",
        });
        expect(workflow_config_1.readWorkflowFile()).toBe(undefined);
    });
    it("invalid YAML file should throw", () => {
        mock_fs_1.default({
            ".github/workflows/azure-static-web-apps__not-valid.yml": "",
        });
        expect(() => workflow_config_1.readWorkflowFile()).toThrow(/could not parse the SWA workflow file/);
    });
    describe("checking workflow properties", () => {
        it("missing property 'jobs' should throw", () => {
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps__not-valid.yml": `name: Azure Static Web Apps CI/CD`,
            });
            expect(() => workflow_config_1.readWorkflowFile()).toThrow(/missing property 'jobs'/);
        });
        it("missing property 'jobs.build_and_deploy_job' should throw", () => {
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  invalid_property:
`,
            });
            expect(() => workflow_config_1.readWorkflowFile()).toThrow(/missing property 'jobs.build_and_deploy_job'/);
        });
        it("missing property 'jobs.build_and_deploy_job.steps' should throw", () => {
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    invalid_property:
`,
            });
            expect(() => workflow_config_1.readWorkflowFile()).toThrow(/missing property 'jobs.build_and_deploy_job.steps'/);
        });
        it("invalid property 'jobs.build_and_deploy_job.steps' should throw", () => {
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
`,
            });
            expect(() => workflow_config_1.readWorkflowFile()).toThrow(/missing property 'jobs.build_and_deploy_job.steps'/);
        });
        it("invalid property 'jobs.build_and_deploy_job.steps[]' should throw", () => {
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
`,
            });
            expect(() => workflow_config_1.readWorkflowFile()).toThrow(/invalid property 'jobs.build_and_deploy_job.steps\[\]'/);
        });
        it("missing property 'jobs.build_and_deploy_job.steps[].with' should throw", () => {
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
`,
            });
            expect(() => workflow_config_1.readWorkflowFile()).toThrow(/missing property 'jobs.build_and_deploy_job.steps\[\].with'/);
        });
    });
    describe("checking SWA properties", () => {
        it("property 'app_location' should be set", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          app_location: "/"
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.appLocation).toBe(path_1.default.normalize(process.cwd() + "/"));
        });
        it("property 'app_location' should be set to '/' if missing", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.appLocation).toBe(path_1.default.normalize(process.cwd() + "/"));
        });
        it("property 'api_location' should be set", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          api_location: "/api"
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.apiLocation).toBe(path_1.default.normalize(process.cwd() + "/api"));
        });
        it("property 'api_location' should be undefined if missing", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.apiLocation).toBeUndefined();
        });
        it("property 'output_location' should be set", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          output_location: "/"
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.outputLocation).toBe(path_1.default.normalize(process.cwd() + "/"));
        });
        it("property 'output_location' should be set to '/' if missing", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.outputLocation).toBe(path_1.default.normalize(process.cwd() + "/"));
        });
        it("property 'app_build_command' should be set", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          app_build_command: "echo test"
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.appBuildCommand).toBe("echo test");
        });
        it("property 'app_build_command' should be set to default if missing", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.appBuildCommand).toBe("npm run build --if-present");
        });
        it("property 'api_build_command' should be set", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          api_build_command: "echo test"
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.apiBuildCommand).toBe("echo test");
        });
        it("property 'api_build_command' should be set to default if missing", () => {
            var _a;
            mock_fs_1.default({
                ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
            });
            expect(workflow_config_1.readWorkflowFile()).toBeTruthy();
            expect((_a = workflow_config_1.readWorkflowFile()) === null || _a === void 0 ? void 0 : _a.apiBuildCommand).toBe("npm run build --if-present");
        });
    });
});
//# sourceMappingURL=workflow-config.spec.js.map