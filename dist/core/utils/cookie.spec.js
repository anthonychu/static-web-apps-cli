"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = require("./cookie");
describe("validateCookie()", () => {
    it("cookies = ''", () => {
        expect(cookie_1.validateCookie("")).toBe(false);
    });
    it("cookies = 'abc'", () => {
        expect(cookie_1.validateCookie("abc")).toBe(false);
    });
    it("cookies = 'foo=bar'", () => {
        expect(cookie_1.validateCookie("foo=bar")).toBe(false);
    });
});
//# sourceMappingURL=cookie.spec.js.map