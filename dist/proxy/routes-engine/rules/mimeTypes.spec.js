"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mimeTypes_1 = require("./mimeTypes");
describe("mimeTypes()", () => {
    let req;
    let res;
    let userConfig;
    beforeEach(() => {
        req = {};
        res = {
            setHeader: jest.fn(),
        };
        userConfig = {};
    });
    it("should not add mime types if empty config", async () => {
        await mimeTypes_1.mimeTypes(req, res, userConfig);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should check for undefined config", async () => {
        req.url = "/foo";
        await mimeTypes_1.mimeTypes(req, res, undefined);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should check for null config", async () => {
        req.url = "/foo";
        await mimeTypes_1.mimeTypes(req, res, null);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should not add mime types if URL doesnt include a file extension", async () => {
        req.url = "/foo";
        await mimeTypes_1.mimeTypes(req, res, userConfig);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should not add mime type if URL includes a file extension but no config match", async () => {
        req.url = "/foo.jpg";
        await mimeTypes_1.mimeTypes(req, res, userConfig);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should not add mime type if URL includes a file extension not in config", async () => {
        req.url = "/foo.html";
        userConfig = {
            ".jpg": "text/json",
        };
        await mimeTypes_1.mimeTypes(req, res, userConfig);
        expect(res.setHeader).not.toHaveBeenCalled();
    });
    it("should not add mime type if URL includes a file extension and config match", async () => {
        req.url = "/foo.jpg";
        userConfig = {
            ".jpg": "text/json",
        };
        await mimeTypes_1.mimeTypes(req, res, userConfig);
        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/json");
    });
    it("should add mime type if URL includes a file extension with many dots", async () => {
        req.url = "/foo.bar.jpg";
        userConfig = {
            ".jpg": "text/json",
        };
        await mimeTypes_1.mimeTypes(req, res, userConfig);
        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/json");
    });
});
//# sourceMappingURL=mimeTypes.spec.js.map