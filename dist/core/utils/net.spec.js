"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const net_1 = require("./net");
describe("response()", () => {
    it("context = null", () => {
        expect(() => {
            net_1.response({
                context: null,
            });
        }).toThrow();
    });
    it("context.bindingData = {foo:bar}", () => {
        expect(net_1.response({
            status: 200,
            context: {
                bindingData: {
                    foo: "bar",
                },
            },
        })).toEqual({
            body: null,
            cookies: undefined,
            headers: { "Content-Type": "application/json", status: 200 },
            status: 200,
        });
    });
    it("status = null", () => {
        expect(() => {
            net_1.response({
                context: {
                    bindingData: {},
                },
                status: null,
            });
        }).toThrow(/TypeError/);
    });
    it("status = 200", () => {
        const res = net_1.response({
            context: {
                bindingData: {},
            },
            status: 200,
        });
        expect(res.status).toBe(200);
        expect(res.headers.status).toBe(200);
    });
    it("body = null", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            body: null,
        });
        expect(res.body).toBe(null);
    });
    it("body = {foo:bar}", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            body: {
                foo: "bar",
            },
        });
        expect(typeof res.body).toBe("object");
        expect(res.body.foo).toBeDefined();
        expect(res.body.foo).toBe("bar");
    });
    it("body = {foo:bar} (DEBUG on)", () => {
        process.env.SWA_CLI_DEBUG = "*";
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            body: {
                foo: "bar",
            },
        });
        expect(typeof res.body).toBe("object");
        expect(res.body.foo).toBeDefined();
        expect(res.body.foo).toBe("bar");
    });
    it("headers = null", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            headers: null,
        });
        expect(res.headers).toBeDefined();
        expect(res.headers.status).toBe(200);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });
    it("headers = null (DEBUG on)", () => {
        process.env.SWA_CLI_DEBUG = "*";
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            headers: null,
        });
        expect(res.headers).toBeDefined();
        expect(res.headers.status).toBe(200);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });
    it("headers = { foo: bar }", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            headers: {
                foo: "bar",
            },
        });
        expect(res.headers).toBeDefined();
        expect(res.headers.foo).toBe("bar");
        expect(res.headers.status).toBe(200);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });
    it("headers = { foo: bar } (DEBUG on)", () => {
        process.env.SWA_CLI_DEBUG = "*";
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            headers: {
                foo: "bar",
            },
        });
        expect(res.headers).toBeDefined();
        expect(res.headers.foo).toBe("bar");
        expect(res.headers.status).toBe(200);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });
    it("headers = { location: null }", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            headers: {
                location: null,
            },
        });
        expect(res.headers).toBeDefined();
        expect(res.headers.location).toBe(null);
        expect(res.headers.status).toBe(200);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });
    it("headers = { location: null } (DEBUG on)", () => {
        process.env.SWA_CLI_DEBUG = "*";
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            headers: {
                location: null,
            },
        });
        expect(res.headers).toBeDefined();
        expect(res.headers.location).toBe(null);
        expect(res.headers.status).toBe(200);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });
    it("headers = { location: 'wassim.dev' }", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            headers: {
                location: "wassim.dev",
            },
        });
        expect(res.headers).toBeDefined();
        expect(res.headers.location).toBe("wassim.dev");
        expect(res.headers.status).toBe(200);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });
    it("cookies = null", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            cookies: null,
        });
        expect(res.cookies).toBe(null);
    });
    it("cookies = { foo:bar }", () => {
        const res = net_1.response({
            status: 200,
            context: {
                bindingData: {},
            },
            cookies: {
                foo: "bar",
            },
        });
        expect(res.cookies).toBeDefined();
        expect(res.cookies.foo).toBe("bar");
    });
});
describe("parsePort()", () => {
    const mockLoggerError = jest.spyOn(logger_1.logger, "error").mockImplementation(() => {
        return undefined;
    });
    it("Ports below 1024 should be invalid", () => {
        net_1.parsePort("0");
        expect(mockLoggerError).toBeCalled();
    });
    it("Ports above 49151 should be invalid", () => {
        net_1.parsePort("98765");
        expect(mockLoggerError).toBeCalled();
    });
    it("Non-number ports should be invalid", () => {
        net_1.parsePort("not a number");
        expect(mockLoggerError).toBeCalled();
    });
    it("Ports between 1024 - 49151 should be valid", () => {
        const port = net_1.parsePort("1984");
        expect(port).toBe(1984);
    });
});
describe("address()", () => {
    it("should throw for malformed URI", () => {
        expect(() => net_1.address("", undefined)).toThrowError(/is not set/);
        expect(() => net_1.address("", 80)).toThrowError(/is not set/);
        expect(() => net_1.address("¬˚˜∆˙¨√√†®ç†®∂œƒçƒ∂ß®´ß`®´£¢´®¨¥†øˆ¨ø(*&*ˆ%&ˆ%$#%@!", 80)).toThrowError(/malformed/);
        expect(() => net_1.address("123.45.43.56234", undefined)).toThrowError(/malformed/);
    });
    it("should handle valid URIs", () => {
        expect(net_1.address("foo", undefined)).toBe("http://foo");
        expect(net_1.address("foo.com", undefined)).toBe("http://foo.com");
        expect(net_1.address("foo.com", 80)).toBe("http://foo.com:80");
        expect(net_1.address("foo.bar.com", 80)).toBe("http://foo.bar.com:80");
        expect(net_1.address("foo.com", "4200")).toBe("http://foo.com:4200");
        expect(net_1.address("127.0.0.1", "4200")).toBe("http://127.0.0.1:4200");
        expect(net_1.address("127.0.0.1", "4200")).toBe("http://127.0.0.1:4200");
        expect(net_1.address("[::1]", "4200")).toBe("http://[::1]:4200");
    });
    it("should accept protocol both HTTP and HTTPS protocols", () => {
        expect(net_1.address("127.0.0.1", "4200", "http")).toBe("http://127.0.0.1:4200");
        expect(net_1.address("127.0.0.1", "4200", "https")).toBe("https://127.0.0.1:4200");
    });
});
//# sourceMappingURL=net.spec.js.map