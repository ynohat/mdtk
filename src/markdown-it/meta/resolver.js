"use strict";

const path = require("path");
const debug = require("debug")("mdtk/markdown-it/meta/resolver");
const {resolve} = require("../../utils");

const IS_URL = /^[^:]+:\/\//;

/**
 * Assets referenced using the @css, @js (etc...) extensions are resolved relative
 * to the markdown fragment or to any of the include paths.
 *
 * The Resolver processes the token stream to declare the resulting dependencies
 * in such a way that all referenced assets use a path relative to the include path,
 * under the "assets/" prefix.
 *
 * For example:
 * 
 * includeA/a/b/c.js
 * includeB/a/d/e.js
 *
 * Will resolve to the following URLs:
 * 
 * assets/a/b/c.js
 * assets/a/d/e.js
 */

class Resolver {
    constructor(outputDir, search, deps) {
        this.outputDir = outputDir;
        this.search = search;
        this.deps = deps;
    }

    walk(state) {
        state.tokens.forEach((token, idx) => {
            this.resolveToken(token);

            if (Array.isArray(token.children)) {
                token.children.forEach(token => this.resolveToken(token));
            }
        });
    }

    resolveToken(token) {
        debug("resolveToken", token.tag, token.type);
        if (token.tag === "img") {
            this.resolveImgToken(token);
        } else if (token.type === "css") {
            this.resolveLinkToken(token);
        } else if (token.type === "script_open") {
            this.resolveScriptToken(token);
        }
        this.resolveKnownAttributes(token);
    }

    resolveKnownAttributes(token) {
        var bkg = token.attrGet("data-background");
        if (bkg && token.file) {
            bkg = this.resolve(token.file, bkg);
            token.attrSet("data-background", bkg);
        }
    }

    resolveImgToken(token) {
        let src = token.attrGet("src");
        let relSrc = this.resolve(token.file, src);
        token.attrSet("src", relSrc);
    }

    resolveLinkToken(token) {
        let href = token.attrGet("href");
        let relHref = this.resolve(token.file, href);
        token.attrSet("href", relHref);

        let rel = token.attrGet("rel");
        if (rel === "stylesheet") {
            const fs = require("fs");
            const absHref = this.normalize(token.file, href);
            if (absHref) {
                var contents = fs.readFileSync(absHref, "utf-8");
                contents.replace(/url\(([^)]+)\)/g, (_, ref) => {
                    return this.resolve(absHref, ref);
                });
            }
        }
    }

    resolveScriptToken(token) {
        let src = token.attrGet("src");
        let relSrc = this.resolve(token.file, src);
        token.attrSet("src", relSrc);
    }

    normalize(fragmentPath, ref) {
        if (IS_URL.test(ref)) {
            return ref;
        }

        if (path.isAbsolute(ref)) {
            return ref;
        }

        let fragmentDir = path.dirname(fragmentPath);
        return resolve(ref, fragmentDir, ...this.search);
    }

    resolve(fragmentPath, ref) {
        let absPath = this.normalize(fragmentPath, ref);

        if (!absPath) {
            return absPath;
        }

        // We want a URL that is relative to the include path that
        // contains the asset.
        let root = this.search
            .filter(dir => absPath.startsWith(dir))
            .shift();
        let relPath = path.relative(root, absPath);

        return this.deps.root(root, "assets")(relPath);
    }
}

module.exports = Resolver;
