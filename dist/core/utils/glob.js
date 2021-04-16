"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globToRegExp = void 0;
/**
 *  Turn expression into a valid regex
 */
function globToRegExp(glob) {
    const filesExtensionMatch = glob.match(/{.*}/);
    if (filesExtensionMatch) {
        const filesExtensionExpression = filesExtensionMatch[0];
        if (filesExtensionExpression) {
            // build a regex group (png|jpg|gif)
            const filesExtensionRegEx = filesExtensionExpression.replace(/\,/g, "|").replace("{", "(").replace("}", ")");
            glob = glob.replace(filesExtensionExpression, filesExtensionRegEx);
        }
    }
    return glob.replace(/\//g, "\\/").replace("*.", ".*").replace("/*", "/.*");
}
exports.globToRegExp = globToRegExp;
//# sourceMappingURL=glob.js.map