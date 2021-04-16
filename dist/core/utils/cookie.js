"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCookie = exports.serializeCookie = exports.validateCookie = void 0;
const cookie_1 = __importDefault(require("cookie"));
const validateCookie = (cookieValue) => {
    if (typeof cookieValue !== "string") {
        throw Error(`TypeError: cookie value must be a string.`);
    }
    const cookies = cookie_1.default.parse(cookieValue);
    return !!cookies.StaticWebAppsAuthCookie;
};
exports.validateCookie = validateCookie;
const serializeCookie = (cookieName, cookieValue, options) => {
    return cookie_1.default.serialize(cookieName, cookieValue, options);
};
exports.serializeCookie = serializeCookie;
const decodeCookie = (cookieValue) => {
    const cookies = cookie_1.default.parse(cookieValue);
    if (cookies.StaticWebAppsAuthCookie) {
        const decodedValue = Buffer.from(cookies.StaticWebAppsAuthCookie, "base64").toString();
        return JSON.parse(decodedValue);
    }
    return null;
};
exports.decodeCookie = decodeCookie;
//# sourceMappingURL=cookie.js.map