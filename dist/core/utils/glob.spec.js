"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("./glob");
describe("globToRegExp()", () => {
    it("glob = <EMPTY>", () => {
        expect(glob_1.globToRegExp("")).toBe("");
    });
    it("glob = abc", () => {
        expect(glob_1.globToRegExp("abc")).toBe("abc");
    });
    it("glob = foo=bar", () => {
        expect(glob_1.globToRegExp("foo=bar")).toBe("foo=bar");
    });
    it("glob = *", () => {
        expect(glob_1.globToRegExp("*")).toBe("*");
    });
    it("glob = /*", () => {
        expect(glob_1.globToRegExp("/*")).toBe("\\/.*");
    });
    it("glob = /foo/*", () => {
        expect(glob_1.globToRegExp("/foo/*")).toBe("\\/foo\\/.*");
    });
    it("glob = /*.{jpg}", () => {
        expect(glob_1.globToRegExp("/*.{jpg}")).toBe("\\/.*(jpg)");
    });
    it("glob = /*.{jpg,gif}", () => {
        expect(glob_1.globToRegExp("/*.{jpg,gif}")).toBe("\\/.*(jpg|gif)");
    });
    it("glob = /foo/*.{jpg,gif}", () => {
        expect(glob_1.globToRegExp("/foo/*.{jpg,gif}")).toBe("\\/foo\\/.*(jpg|gif)");
    });
    it("glob = {foo,bar}.json", () => {
        expect(glob_1.globToRegExp("{foo,bar}.json")).toBe("(foo|bar).json");
    });
});
//# sourceMappingURL=glob.spec.js.map