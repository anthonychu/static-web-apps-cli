"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const fs = require("fs").promises;
const path = require("path");
const httpTrigger = async function (context, request) {
    const body = await fs.readFile(path.join(__dirname, "..", "..", "public", "auth.html"), "utf-8");
    context.res = core_1.response({
        context,
        status: 200,
        headers: {
            "Content-Type": "text/html",
            status: 200,
        },
        body: injectOriginalUrlMetaTags(body, request.url),
    });
};
function injectOriginalUrlMetaTags(body, url) {
    // pass original URL to page in case or rewrite
    if (url) {
        const [path, search] = url.split("?");
        const metaTags = `<meta name="swa:originalPath" content="${path}">` + (search ? `<meta name="swa:originalSearch" content="?${search}">` : "");
        return body.replace(/(<\/head>)/i, `${metaTags}$1`);
    }
    else {
        return body;
    }
}
exports.default = httpTrigger;
//# sourceMappingURL=auth_login_provider.js.map