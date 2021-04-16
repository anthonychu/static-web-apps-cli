"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mimeTypes = void 0;
// See: https://docs.microsoft.com/en-us/azure/static-web-apps/configuration
const mimeTypes = async (req, res, mimeTypes) => {
    var _a, _b;
    if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.includes(".")) {
        const fileExtentionFromURL = (_b = req.url) === null || _b === void 0 ? void 0 : _b.split(".").pop();
        const overrideMimeType = mimeTypes === null || mimeTypes === void 0 ? void 0 : mimeTypes[`.${fileExtentionFromURL}`];
        if (fileExtentionFromURL && overrideMimeType) {
            res.setHeader("Content-Type", overrideMimeType);
        }
    }
};
exports.mimeTypes = mimeTypes;
//# sourceMappingURL=mimeTypes.js.map