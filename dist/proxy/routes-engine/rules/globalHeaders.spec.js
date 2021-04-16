"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalHeaders_1 = require("./globalHeaders");
describe("globalHeaders()", () => {
    let req;
    let res;
    let userConfig;
    beforeEach(() => {
        req = {};
        res = {
            setHeader: jest.fn(),
            removeHeader: jest.fn(),
        };
        userConfig = {};
    });
    it("should not set headers if empty config", async () => {
        await globalHeaders_1.globalHeaders(req, res, userConfig);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should check for undefined config", async () => {
        await globalHeaders_1.globalHeaders(req, res, undefined);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should check for null config", async () => {
        await globalHeaders_1.globalHeaders(req, res, null);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should add new headers", async () => {
        userConfig = {
            "Cache-Control": "public, max-age=604800",
        };
        await globalHeaders_1.globalHeaders(req, res, userConfig);
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "public, max-age=604800");
    });
    it("should remove exsting header", async () => {
        userConfig = {
            "Cache-Control": "",
        };
        await globalHeaders_1.globalHeaders(req, res, userConfig);
        expect(res.removeHeader).toHaveBeenCalledWith("Cache-Control");
        expect(res.setHeader).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=globalHeaders.spec.js.map